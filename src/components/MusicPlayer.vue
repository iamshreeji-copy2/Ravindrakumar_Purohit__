<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)
const lastStoppedTime = ref(0)

// Resolve path dynamically to support both local dev and GitHub Pages base paths
const audioSrc = `${import.meta.env.BASE_URL || '/'}bg.mp3`.replace(/\/+/g, '/')

let animationFrameId: number | null = null

function fadeInVolume(audio: HTMLAudioElement, duration = 7000) {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  audio.volume = 0
  const start = performance.now()
  const targetVolume = 0.5 // comfortable target volume limit

  const animate = (time: number) => {
    const progress = (time - start) / duration
    if (progress < 1) {
      audio.volume = progress * targetVolume
      animationFrameId = requestAnimationFrame(animate)
    } else {
      audio.volume = targetVolume
      animationFrameId = null
    }
  }
  animationFrameId = requestAnimationFrame(animate)
}

function fadeOutVolume(audio: HTMLAudioElement, duration = 5000, callback: () => void) {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  const startVolume = audio.volume
  const start = performance.now()

  const animate = (time: number) => {
    const progress = (time - start) / duration
    if (progress < 1) {
      audio.volume = startVolume * (1 - progress)
      animationFrameId = requestAnimationFrame(animate)
    } else {
      audio.volume = 0
      audio.pause()
      animationFrameId = null
      callback()
    }
  }
  animationFrameId = requestAnimationFrame(animate)
}

function togglePlay() {
  if (!audioRef.value) return

  if (isPlaying.value) {
    // Record the exact playhead position when the user clicked mute
    lastStoppedTime.value = audioRef.value.currentTime
    fadeOutVolume(audioRef.value, 5000, () => {
      isPlaying.value = false
    })
  } else {
    // Restore the exact playhead position before resuming play
    if (lastStoppedTime.value > 0) {
      audioRef.value.currentTime = lastStoppedTime.value
    }
    audioRef.value.volume = 0
    audioRef.value.play()
      .then(() => {
        isPlaying.value = true
        fadeInVolume(audioRef.value!, 7000)
      })
      .catch((err) => {
        console.warn('Playback request failed or was blocked by browser autoplay policy:', err)
      })
  }
}

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = 0
    // Attempt browser autoplay immediately on load
    audioRef.value.play()
      .then(() => {
        isPlaying.value = true
        fadeInVolume(audioRef.value!, 7000)
      })
      .catch((err) => {
        console.info('Browser blocked autoplay initially. Flute music will start on user interaction or click.', err)
      })
  }
})
</script>

<template>
  <div class="inline-block print:hidden select-none">
    <audio
      ref="audioRef"
      :src="audioSrc"
      preload="auto"
      loop
    />
    <button
      type="button"
      class="p-2 text-current opacity-75 hover:opacity-100 transition-opacity border-none! bg-transparent cursor-pointer flex items-center justify-center focus:outline-none"
      :title="isPlaying ? 'Turn background music off' : 'Turn background music on'"
      @click="togglePlay"
    >
      <div
        class="text-base"
        :class="isPlaying ? 'i-carbon-volume-up text-[#FF9933]' : 'i-carbon-volume-mute opacity-60'"
      />
    </button>
  </div>
</template>
