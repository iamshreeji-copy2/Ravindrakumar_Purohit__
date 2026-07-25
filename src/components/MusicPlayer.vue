<script setup lang="ts">
import { ref } from 'vue'

const isPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)

// Resolve path dynamically to support both local dev and GitHub Pages base paths
const audioSrc = `${import.meta.env.BASE_URL || '/'}bg.mp3`.replace(/\/+/g, '/')

function togglePlay() {
  if (!audioRef.value) return

  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play()
      .then(() => {
        isPlaying.value = true
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
