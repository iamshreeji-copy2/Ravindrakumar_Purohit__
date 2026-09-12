<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const _props = withDefaults(defineProps<{
  src?: string
  videoSrc?: string
  alt?: string
}>(), {
  src: '/posts/prism-v-vocoder-benchmark-2026/prism-v-algorithm.gif',
  videoSrc: '/posts/prism-v-vocoder-benchmark-2026/prism-v-algorithm.mp4',
  alt: 'PRISM-V Pipeline Animation',
})

const isReady = ref(false)
const isPlaying = ref(true)
const playbackSpeed = ref(0.5) // Default 0.50x speed
const videoRef = ref<HTMLVideoElement | null>(null)
const currentStep = ref(1)
const videoProgress = ref(0)
const hasVideoError = ref(false)

const stepTitles = [
  'Ground-Truth Audio',
  'Mel-Spectrogram Extraction',
  'Neural Vocoder Synthesis',
  'PRISM-V Scoring',
  'Composite PRISM-V Score',
  'Leaderboard Ranking',
]

onMounted(() => {
  // Deferred loading: load only after all text, markdown, and fonts have finished initial paint
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        isReady.value = true
      })
    }
    else {
      setTimeout(() => {
        isReady.value = true
      }, 300)
    }
  }
})

function onVideoLoaded() {
  if (videoRef.value) {
    videoRef.value.playbackRate = playbackSpeed.value
    videoRef.value.play().then(() => {
      isPlaying.value = true
    }).catch(() => {
      isPlaying.value = false
    })
  }
}

function togglePlay() {
  if (!videoRef.value)
    return
  if (videoRef.value.paused) {
    videoRef.value.play()
    isPlaying.value = true
  }
  else {
    videoRef.value.pause()
    isPlaying.value = false
  }
}

function setSpeed(speed: number) {
  playbackSpeed.value = speed
  if (videoRef.value) {
    videoRef.value.playbackRate = speed
  }
}

function onTimeUpdate() {
  if (!videoRef.value)
    return
  const dur = videoRef.value.duration || 8
  const ct = videoRef.value.currentTime
  videoProgress.value = (ct / dur) * 100

  // 6 steps distributed along the 8s timeline (1s for steps 1-5, 3s for step 6)
  if (ct < 1.0)
    currentStep.value = 1
  else if (ct < 2.0)
    currentStep.value = 2
  else if (ct < 3.0)
    currentStep.value = 3
  else if (ct < 4.0)
    currentStep.value = 4
  else if (ct < 5.0)
    currentStep.value = 5
  else
    currentStep.value = 6
}

function jumpToStep(step: number) {
  if (!videoRef.value)
    return
  // Time offsets: 0, 1.0, 2.0, 3.0, 4.0, 5.0
  const offsets = [0, 0, 1.0, 2.0, 3.0, 4.0, 5.0]
  videoRef.value.currentTime = offsets[step] || 0
  currentStep.value = step
}

function restart() {
  if (videoRef.value) {
    videoRef.value.currentTime = 0
    videoRef.value.play()
    isPlaying.value = true
  }
}

const currentStepLabel = computed(() => `Step ${currentStep.value}/6: ${stepTitles[currentStep.value - 1]}`)
</script>

<template>
  <div class="my-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 overflow-hidden shadow-sm">
    <!-- Deferred loading placeholder skeleton -->
    <div
      v-if="!isReady"
      class="w-full flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 animate-pulse text-sm font-mono"
      style="min-height: 280px;"
    >
      <span class="i-carbon-circle-dash animate-spin text-2xl mb-2" />
      <span>Loading algorithm pipeline animation...</span>
    </div>

    <div v-else class="relative group">
      <!-- Media Player (HTML5 video with auto-fallback to GIF) -->
      <div class="relative cursor-pointer select-none overflow-hidden" @click="togglePlay">
        <video
          v-if="!hasVideoError"
          ref="videoRef"
          :src="videoSrc"
          playsinline
          loop
          muted
          class="w-full h-auto block rounded-t-2xl"
          @loadeddata="onVideoLoaded"
          @timeupdate="onTimeUpdate"
          @error="hasVideoError = true"
        />

        <!-- Fallback GIF image -->
        <img
          v-else
          :src="src"
          :alt="alt"
          class="w-full h-auto block rounded-t-2xl"
        >

        <!-- Centered Paused Indicator Overlay -->
        <div
          v-if="!isPlaying"
          class="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none transition-opacity"
        >
          <div class="px-4 py-2 rounded-full bg-black/75 backdrop-blur-md text-white font-mono text-sm font-semibold flex items-center gap-2 shadow-lg">
            <span class="i-carbon-pause-outline text-lg" />
            <span>Paused (Click to Resume)</span>
          </div>
        </div>
      </div>

      <!-- Timeline Progress Bar -->
      <div class="w-full bg-gray-200 dark:bg-gray-800 h-1 relative overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 via-emerald-400 via-amber-400 to-rose-500 transition-all duration-150"
          :style="{ width: `${videoProgress}%` }"
        />
      </div>

      <!-- Player Controls Bar -->
      <div class="px-4 py-3 bg-gray-50/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <!-- Left: Play/Pause and Restart -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shadow-sm cursor-pointer"
            :class="isPlaying
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
              : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border border-green-500/30'"
            :title="isPlaying ? 'Pause animation for analysis' : 'Play animation'"
            @click="togglePlay"
          >
            <span v-if="isPlaying" class="i-carbon-pause text-sm" />
            <span v-else class="i-carbon-play text-sm" />
            <span>{{ isPlaying ? 'Pause' : 'Play' }}</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-200/60 dark:bg-gray-800 hover:bg-gray-300/60 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
            title="Restart from beginning"
            @click="restart"
          >
            <span class="i-carbon-restart text-sm" />
            <span class="hidden sm:inline">Restart</span>
          </button>

          <!-- Current Step Status Badge -->
          <span class="text-gray-500 dark:text-gray-400 hidden md:inline ml-1 font-sans font-medium text-[11px]">
            {{ currentStepLabel }}
          </span>
        </div>

        <!-- Center: Interactive Step Dots -->
        <div class="flex items-center gap-1.5" title="Click to jump to any phase">
          <button
            v-for="s in 6"
            :key="s"
            type="button"
            class="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer"
            :class="currentStep === s
              ? 'bg-blue-600 text-white shadow-sm scale-110'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'"
            @click="jumpToStep(s)"
          >
            {{ s }}
          </button>
        </div>

        <!-- Right: Speed Selector & Loop Indicator -->
        <div class="flex items-center gap-2">
          <span class="text-gray-400 text-[11px] hidden sm:inline">Speed:</span>
          <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 p-0.5 bg-gray-200/40 dark:bg-gray-800/40">
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer"
              :class="playbackSpeed === 0.5
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
              title="0.50x Slow Paced (Default)"
              @click="setSpeed(0.5)"
            >
              0.50x
            </button>
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer"
              :class="playbackSpeed === 1.0
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
              title="1.0x Normal Speed"
              @click="setSpeed(1.0)"
            >
              1.0x
            </button>
          </div>

          <span class="text-green-600 dark:text-green-400 text-[10px] font-medium flex items-center gap-1 ml-1" title="Continuous repeat active">
            <span class="i-carbon-repeat text-xs" />
            <span class="hidden sm:inline">Repeat</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
