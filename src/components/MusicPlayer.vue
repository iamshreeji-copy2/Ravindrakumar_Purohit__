<script setup lang="ts">
import { ref } from 'vue'

const isPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)

// Resolve path dynamically to support both local dev and GitHub Pages base paths
const audioSrc = `${import.meta.env.BASE_URL || '/'}bg.mp3`.replace(/\/+/g, '/')

function fadeInVolume(audio: HTMLAudioElement, duration = 3000) {
  audio.volume = 0
  const start = performance.now()
  const targetVolume = 0.5 // comfortable target volume limit

  const animate = (time: number) => {
    const progress = (time - start) / duration
    if (progress < 1) {
      audio.volume = progress * targetVolume
      requestAnimationFrame(animate)
    } else {
      audio.volume = targetVolume
    }
  }
  requestAnimationFrame(animate)
}

function fadeOutVolume(audio: HTMLAudioElement, duration = 1500, callback: () => void) {
  const startVolume = audio.volume
  const start = performance.now()

  const animate = (time: number) => {
    const progress = (time - start) / duration
    if (progress < 1) {
      audio.volume = startVolume * (1 - progress)
      requestAnimationFrame(animate)
    } else {
      audio.volume = 0
      audio.pause()
      callback()
    }
  }
  requestAnimationFrame(animate)
}

function togglePlay() {
  if (!audioRef.value) return

  if (isPlaying.value) {
    fadeOutVolume(audioRef.value, 1500, () => {
      isPlaying.value = false
    })
  } else {
    audioRef.value.volume = 0
    audioRef.value.play()
      .then(() => {
        isPlaying.value = true
        fadeInVolume(audioRef.value!, 3000)
      })
      .catch((err) => {
        console.warn('Playback request failed or was blocked by browser autoplay policy:', err)
      })
  }
}
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
