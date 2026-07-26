<script setup lang="ts">
import { ref, onMounted } from 'vue'

const text = ref('Speech processing is a rapidly evolving interdisciplinary field combining acoustics, digital signal processing, and advanced deep learning.')
const engine = ref<'native' | 'wasm'>('native')
const status = ref<'idle' | 'loading' | 'synthesizing' | 'ready' | 'error'>('idle')
const progress = ref(0)
const loadingFile = ref('')
const audioUrl = ref<string | null>(null)
const errorMsg = ref('')

// Native Speech Synthesis state
const voices = ref<SpeechSynthesisVoice[]>([])
const selectedVoiceName = ref('')
let synthesizer: any = null

onMounted(() => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    const loadVoices = () => {
      voices.value = window.speechSynthesis.getVoices()
      if (voices.value.length > 0 && !selectedVoiceName.value) {
        // default to first english voice or browser default
        const defaultVoice = voices.value.find(v => v.lang.startsWith('en')) || voices.value[0]
        selectedVoiceName.value = defaultVoice.name
      }
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }
})

const presets = [
  "Hello! Welcome to my speech signal processing research portfolio.",
  "Deep learning and neural audio codecs are reshaping the landscape of generative voice in 2026.",
  "Let's explore neural vocoders, voice conversion, and audio deepfake detection!"
]

// WAV Encoding Helper Functions for WASM VITS
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]))
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
  }
}

function encodeWAV(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM Format
  view.setUint16(22, 1, true)  // Mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)

  floatTo16BitPCM(view, 44, samples)

  return new Blob([view], { type: 'audio/wav' })
}

async function initSynthesizer() {
  if (synthesizer) return

  status.value = 'loading'
  progress.value = 0
  errorMsg.value = ''

  try {
    const { pipeline, env } = await import(/* @vite-ignore */ 'https://esm.sh/@xenova/transformers@2.17.2')
    
    // Configure transformers.js to load models locally from the public folder
    env.allowLocalModels = true
    env.localModelPath = '/'
    
    // Allocate the VITS speech synthesis pipeline from local path
    synthesizer = await pipeline('text-to-speech', 'models/vits', {
      progress_callback: (data: any) => {
        if (data.status === 'progress') {
          progress.value = Math.round(data.progress)
          if (data.file) {
            loadingFile.value = data.file
          }
        }
      }
    })
  } catch (err: any) {
    console.error('Failed to load VITS model:', err)
    status.value = 'error'
    errorMsg.value = `Model loading failed (Ensure VITS model files exist in public/models/vits/): ${err.message || err}`
  }
}

async function speakNative() {
  if (!text.value.trim() || typeof window === 'undefined' || !window.speechSynthesis) return

  status.value = 'synthesizing'
  
  // Stop any active speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text.value.trim())
  
  // Apply selected voice
  const activeVoice = voices.value.find(v => v.name === selectedVoiceName.value)
  if (activeVoice) {
    utterance.voice = activeVoice
  }

  utterance.onend = () => {
    status.value = 'ready'
  }

  utterance.onerror = (err) => {
    console.error('Native speech error:', err)
    status.value = 'error'
    errorMsg.value = `Web Speech synthesis failed: ${err.error}`
  }

  window.speechSynthesis.speak(utterance)
}

async function synthesizeWASM() {
  if (!text.value.trim()) return

  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }

  status.value = 'synthesizing'
  errorMsg.value = ''

  try {
    if (!synthesizer) {
      await initSynthesizer()
      if (status.value === 'error') return
    }

    status.value = 'synthesizing'
    const output = await synthesizer(text.value.trim())
    const wavBlob = encodeWAV(output.audio, output.sampling_rate)
    audioUrl.value = URL.createObjectURL(wavBlob)
    status.value = 'ready'
  } catch (err: any) {
    console.error('WASM TTS Synthesis failed:', err)
    status.value = 'error'
    errorMsg.value = `WASM Synthesis failed: ${err.message || err}`
  }
}

function handleSpeak() {
  if (engine.value === 'native') {
    speakNative()
  } else {
    synthesizeWASM()
  }
}

function selectPreset(preset: string) {
  text.value = preset
}

function stopNative() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
    status.value = 'idle'
  }
}
</script>

<template>
  <div class="border border-gray-200 dark:border-gray-800 rounded-xl p-5 md:p-6 bg-gray-500/5 backdrop-blur-md max-w-xl mx-auto my-8 slide-enter">
    <div class="flex items-center gap-2 mb-4">
      <div i-ri:voiceprint-line class="text-xl text-blue-500" />
      <h3 class="text-lg font-bold">Local Client Hardware TTS</h3>
    </div>

    <!-- Engine Selector Tab -->
    <div class="grid grid-cols-2 gap-2 p-1 bg-gray-500/10 rounded-lg mb-4 text-xs font-semibold">
      <button
        @click="engine = 'native'; errorMsg = ''; status = 'idle'"
        :class="engine === 'native' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-500' : 'opacity-60 hover:opacity-100'"
        class="py-2 px-3 rounded-md transition select-none text-center"
      >
        Native Browser Speech (Instant)
      </button>
      <button
        @click="engine = 'wasm'; errorMsg = ''; status = 'idle'"
        :class="engine === 'wasm' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-500' : 'opacity-60 hover:opacity-100'"
        class="py-2 px-3 rounded-md transition select-none text-center"
      >
        Neural WASM (VITS Offline)
      </button>
    </div>

    <p class="text-xs opacity-60 mb-4 leading-relaxed">
      <span v-if="engine === 'native'">
        Synthesize speech instantly using the built-in operating system/browser voice engines. Runs 100% locally on your hardware with no downloads required.
      </span>
      <span v-else>
        Synthesize speech locally using WebAssembly and ONNX Runtime. Requires VITS model files placed in your website's <code>public/models/vits/</code> directory.
      </span>
    </p>

    <!-- Native Engine Voices list -->
    <div v-if="engine === 'native' && voices.length > 0" class="mb-4">
      <label class="text-xs font-semibold opacity-50 block mb-1.5">Select Local Voice:</label>
      <select
        v-model="selectedVoiceName"
        class="w-full text-xs p-2 rounded border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-black/40 focus:outline-none"
      >
        <option v-for="voice in voices" :key="voice.name" :value="voice.name">
          {{ voice.name }} ({{ voice.lang }})
        </option>
      </select>
    </div>

    <!-- Presets -->
    <div class="mb-4">
      <span class="text-xs font-semibold opacity-50 block mb-1.5">Presets:</span>
      <div class="flex flex-col gap-1.5">
        <button
          v-for="(p, i) in presets"
          :key="i"
          @click="selectPreset(p)"
          class="text-left text-xs px-2.5 py-1.5 rounded border border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-black/20 hover:border-blue-500/40 hover:bg-blue-500/5 transition select-none truncate"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <!-- Text input box -->
    <div class="relative mb-5">
      <textarea
        v-model="text"
        rows="3"
        maxlength="250"
        placeholder="Type something..."
        class="w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-black/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition resize-none"
      />
      <span class="absolute bottom-2.5 right-3 text-[10px] opacity-40 font-mono select-none">
        {{ text.length }}/250
      </span>
    </div>

    <!-- Loading Model Progress Bar (WASM only) -->
    <div v-if="engine === 'wasm' && status === 'loading'" class="mb-5 space-y-2">
      <div class="flex justify-between text-xs font-mono select-none">
        <span class="opacity-60">Loading local model files ({{ loadingFile }})...</span>
        <span class="text-blue-500 font-bold">{{ progress }}%</span>
      </div>
      <div class="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div class="h-full bg-blue-500 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }" />
      </div>
    </div>

    <!-- Action Button -->
    <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <button
        @click="handleSpeak"
        :disabled="status === 'loading' || status === 'synthesizing'"
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed select-none"
      >
        <span v-if="status === 'loading'">Initializing WASM...</span>
        <span v-else-if="status === 'synthesizing'">Generating speech...</span>
        <span v-else>Speak Text 🗣️</span>
      </button>

      <!-- Reset/Stop Button -->
      <button
        v-if="status === 'synthesizing' && engine === 'native'"
        @click="stopNative"
        class="px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-sm font-semibold transition select-none"
      >
        Stop Speech
      </button>

      <button
        v-if="audioUrl && engine === 'wasm'"
        @click="audioUrl = null; status = 'idle'"
        class="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-500/10 text-sm font-semibold transition select-none"
      >
        Reset
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="status === 'error' || errorMsg" class="mt-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-xs">
      {{ errorMsg }}
    </div>

    <!-- Audio Player output (WASM only) -->
    <div v-if="audioUrl && engine === 'wasm'" class="mt-5 pt-5 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col gap-3 slide-enter">
      <span class="text-xs font-semibold opacity-50 select-none">Synthesized Audio Output:</span>
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full">
        <audio :src="audioUrl" controls autoplay class="w-full max-h-12" />
        
        <a
          :href="audioUrl"
          download="speech.wav"
          class="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-blue-500/20 text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 text-xs font-bold transition w-full sm:w-auto"
        >
          <div i-ri:download-line />
          Download WAV
        </a>
      </div>
    </div>
  </div>
</template>
