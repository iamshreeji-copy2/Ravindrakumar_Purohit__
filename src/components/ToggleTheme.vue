<script setup lang='ts'>
import { toggleDark } from '~/logics'
</script>

<template>
  <button
    class="select-none p-2 bg-transparent border-none! text-current cursor-pointer focus:outline-none flex items-center justify-center"
    title="Toggle Color Scheme"
    aria-label="Toggle Color Scheme"
    @click="toggleDark"
  >
    <div i-ri-sun-line dark:i-ri-moon-line />
  </button>
</template>
