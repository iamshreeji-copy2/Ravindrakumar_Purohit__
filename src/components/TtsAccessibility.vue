<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const route = useRoute()

// UI state
const isOpen = ref(false)
const isModelLoaded = ref(false)
const isLoading = ref(false)
const isSpeaking = ref(false)
const loadProgress = ref('')
const errorMsg = ref('')
const currentText = ref('')
const speed = ref(1.0)
const speakerId = ref(0)

// Audio state
let audioContext: AudioContext | null = null
let audioSource: AudioBufferSourceNode | null = null
let ttsModule: any = null
let ttsInstance: any = null

// Extract readable text from the current page
function extractPageText(): string {
  const main = document.querySelector('main')
  if (!main) return ''

  // Clone to avoid modifying the actual DOM
  const clone = main.cloneNode(true) as HTMLElement

  // Remove elements that shouldn't be read
  const removeSelectors = [
    'nav', 'footer', 'button', 'script', 'style', 'noscript',
    'svg', 'img', 'video', 'audio', 'iframe', 'canvas',
    '.no-tts', '[aria-hidden="true"]', 'code', 'pre',
    '.tts-accessibility-widget'
  ]
  removeSelectors.forEach(sel => {
    clone.querySelectorAll(sel).forEach(el => el.remove())
  })

  // Get clean text
  let text = clone.textContent || ''
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim()
  // Limit length to avoid very long synthesis
  if (text.length > 2000) {
    text = text.substring(0, 2000) + '...'
  }
  return text
}

// Load the Sherpa-ONNX WASM module
async function loadModel() {
  if (isModelLoaded.value || isLoading.value) return

  isLoading.value = true
  loadProgress.value = 'Initializing WASM runtime...'
  errorMsg.value = ''

  try {
    // Load the sherpa-onnx WASM glue code
    loadProgress.value = 'Loading sherpa-onnx WASM module...'

    // We need to load the WASM module from the public directory
    // The sherpa-onnx-wasm-main-tts.js script creates a global Module
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = '/sherpa-onnx-wasm/sherpa-onnx-wasm-main-tts.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load WASM glue script'))
      document.head.appendChild(script)
    })

    loadProgress.value = 'Loading TTS API...'
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = '/sherpa-onnx-wasm/sherpa-onnx-tts.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load TTS API script'))
      document.head.appendChild(script)
    })

    // Wait for the WASM module to be ready
    loadProgress.value = 'Initializing model...'
    const w = window as any
    if (w.Module && w.Module.onRuntimeInitialized) {
      await new Promise<void>((resolve) => {
        const origCallback = w.Module.onRuntimeInitialized
        w.Module.onRuntimeInitialized = () => {
          if (origCallback) origCallback()
          resolve()
        }
      })
    } else {
      // Give the module a moment to initialize
      await new Promise(r => setTimeout(r, 2000))
    }

    loadProgress.value = 'Creating TTS engine with Supertonic 3...'

    // Create the TTS instance using the sherpa-onnx API
    const modelDir = '/models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11'
    if (typeof w.createOfflineTts === 'function') {
      ttsInstance = w.createOfflineTts({
        supertonic: {
          durationPredictor: `${modelDir}/duration_predictor.int8.onnx`,
          textEncoder: `${modelDir}/text_encoder.int8.onnx`,
          vectorEstimator: `${modelDir}/vector_estimator.int8.onnx`,
          vocoder: `${modelDir}/vocoder.int8.onnx`,
          ttsJson: `${modelDir}/tts.json`,
          unicodeIndexer: `${modelDir}/unicode_indexer.bin`,
          voiceStyle: `${modelDir}/voice.bin`,
        },
        numThreads: 2,
        debug: false,
      })
    }

    isModelLoaded.value = true
    loadProgress.value = ''
  } catch (err: any) {
    console.error('TTS Model loading failed:', err)
    errorMsg.value = `Model loading failed: ${err.message || err}`
    isLoading.value = false
    return
  }

  isLoading.value = false
}

// Synthesize and play speech
async function speak() {
  if (isSpeaking.value) {
    stopSpeaking()
    return
  }

  const text = currentText.value.trim()
  if (!text) {
    errorMsg.value = 'No text to speak'
    return
  }

  errorMsg.value = ''

  // If model not loaded, try native Web Speech API as fallback
  if (!isModelLoaded.value) {
    speakNative(text)
    return
  }

  // Use sherpa-onnx WASM
  try {
    isSpeaking.value = true
    const w = window as any

    const genConfig = {
      sid: speakerId.value,
      numSteps: 8,
      speed: speed.value,
      extra: JSON.stringify({ lang: 'en' }),
    }

    const audio = ttsInstance.generate({ text, generationConfig: genConfig })

    // Play audio using Web Audio API
    if (!audioContext) {
      audioContext = new AudioContext()
    }

    const buffer = audioContext.createBuffer(1, audio.samples.length, audio.sampleRate)
    buffer.getChannelData(0).set(audio.samples)

    audioSource = audioContext.createBufferSource()
    audioSource.buffer = buffer
    audioSource.connect(audioContext.destination)
    audioSource.onended = () => {
      isSpeaking.value = false
    }
    audioSource.start()
  } catch (err: any) {
    console.error('TTS synthesis failed:', err)
    // Fallback to native
    speakNative(text)
  }
}

// Native Web Speech API fallback
function speakNative(text: string) {
  if (!window.speechSynthesis) {
    errorMsg.value = 'Speech synthesis not supported in this browser'
    return
  }

  window.speechSynthesis.cancel()
  isSpeaking.value = true

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = speed.value
  
  const voices = window.speechSynthesis.getVoices()
  const enVoice = voices.find(v => v.lang.startsWith('en'))
  if (enVoice) utterance.voice = enVoice

  utterance.onend = () => { isSpeaking.value = false }
  utterance.onerror = () => { isSpeaking.value = false }

  window.speechSynthesis.speak(utterance)
}

function stopSpeaking() {
  if (audioSource) {
    try { audioSource.stop() } catch {}
    audioSource = null
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  isSpeaking.value = false
}

function refreshText() {
  currentText.value = extractPageText()
}

// Re-extract text on route change
watch(() => route.path, () => {
  stopSpeaking()
  setTimeout(refreshText, 500) // wait for page render
})

onMounted(() => {
  setTimeout(refreshText, 800)
})

onUnmounted(() => {
  stopSpeaking()
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
})
</script>

<template>
  <div class="tts-accessibility-widget fixed bottom-6 right-6 z-400 flex flex-col items-end gap-3">
    <!-- Expanded Panel -->
    <Transition name="tts-panel">
      <div
        v-if="isOpen"
        class="w-80 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/40 dark:border-gray-700/40">
          <div class="flex items-center gap-2">
            <div i-ri:volume-up-line class="text-blue-500 text-lg" />
            <span class="text-sm font-bold">Read Aloud</span>
            <span class="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 select-none">
              Accessibility
            </span>
          </div>
          <button
            @click="isOpen = false; stopSpeaking()"
            class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-500/10 transition"
          >
            <div i-ri:close-line class="text-sm opacity-60" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-4 py-3 space-y-3">
          <!-- Status / Loading -->
          <div v-if="isLoading" class="flex items-center gap-2 text-xs text-blue-500">
            <div class="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>{{ loadProgress }}</span>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="text-xs text-red-500 bg-red-500/5 rounded-lg px-3 py-2">
            {{ errorMsg }}
          </div>

          <!-- Text Preview -->
          <div class="relative">
            <textarea
              v-model="currentText"
              rows="3"
              maxlength="2000"
              placeholder="Page text will appear here..."
              class="w-full text-xs p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-zinc-800/50 focus:outline-none focus:border-blue-500 transition resize-none font-mono leading-relaxed"
            />
            <div class="absolute bottom-1.5 right-2 flex items-center gap-1.5">
              <span class="text-[9px] opacity-30 font-mono">{{ currentText.length }}/2000</span>
              <button
                @click="refreshText"
                class="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-500/10 transition"
                title="Re-extract page text"
              >
                <div i-ri:refresh-line class="text-xs opacity-40" />
              </button>
            </div>
          </div>

          <!-- Controls Row -->
          <div class="flex items-center gap-2">
            <!-- Speed -->
            <div class="flex items-center gap-1.5 text-[10px] opacity-60">
              <span class="select-none">Speed</span>
              <select
                v-model.number="speed"
                class="text-[10px] bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 focus:outline-none"
              >
                <option :value="0.5">0.5×</option>
                <option :value="0.75">0.75×</option>
                <option :value="1.0">1.0×</option>
                <option :value="1.25">1.25×</option>
                <option :value="1.5">1.5×</option>
              </select>
            </div>

            <div class="flex-1" />

            <!-- Speaker (when model loaded) -->
            <div v-if="isModelLoaded" class="flex items-center gap-1.5 text-[10px] opacity-60">
              <span class="select-none">Voice</span>
              <select
                v-model.number="speakerId"
                class="text-[10px] bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 focus:outline-none"
              >
                <option v-for="i in 10" :key="i-1" :value="i-1">Speaker {{ i }}</option>
              </select>
            </div>
          </div>

          <!-- Play / Stop Button -->
          <button
            @click="speak"
            :disabled="isLoading || !currentText.trim()"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-lg select-none disabled:opacity-40 disabled:cursor-not-allowed"
            :class="isSpeaking
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/20'"
          >
            <div v-if="isSpeaking" i-ri:stop-fill class="text-base" />
            <div v-else i-ri:play-fill class="text-base" />
            <span>{{ isSpeaking ? 'Stop Reading' : 'Read This Page' }}</span>
          </button>

          <!-- Engine info -->
          <p class="text-[9px] opacity-30 text-center select-none leading-snug">
            <template v-if="isModelLoaded">
              Sherpa-ONNX Supertonic 3 · Local WASM · Client CPU
            </template>
            <template v-else>
              Web Speech API · Local Browser Engine · Client CPU
            </template>
          </p>
        </div>
      </div>
    </Transition>

    <!-- Floating Action Button -->
    <button
      @click="isOpen = !isOpen"
      class="group w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 select-none"
      :class="isOpen
        ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-blue-500/30 scale-90'
        : 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-110'"
      :title="isOpen ? 'Close TTS' : 'Read Page Aloud (Accessibility)'"
      aria-label="Text to Speech Accessibility"
    >
      <div
        :class="isSpeaking ? 'i-ri:volume-up-fill animate-pulse' : 'i-ri:volume-up-line'"
        class="text-white text-xl transition-transform group-hover:scale-110"
      />
    </button>
  </div>
</template>

<style scoped>
.tts-panel-enter-active,
.tts-panel-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.tts-panel-enter-from,
.tts-panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}
</style>
