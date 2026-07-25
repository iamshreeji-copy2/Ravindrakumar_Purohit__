<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  date?: string
}>()

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="my-3 border-b border-gray-200/40 dark:border-gray-800/40 pb-2">
    <button
      type="button"
      class="w-full text-left font-semibold text-base flex items-center justify-between select-none py-2 hover:opacity-100 opacity-90 transition-opacity bg-transparent border-none! cursor-pointer p-0"
      @click="toggle"
    >
      <span class="text-gray-900 dark:text-gray-100">{{ title }}</span>
      <span class="text-xs opacity-50 flex items-center gap-1.5 ml-2 shrink-0">
        <span v-if="date">{{ date }}</span>
        <span
          class="inline-block transition-transform duration-700 ease-in-out"
          :class="isOpen ? 'rotate-180' : 'rotate-0'"
        >
          ▼
        </span>
      </span>
    </button>

    <div
      class="grid transition-all duration-700 ease-in-out overflow-hidden"
      :class="isOpen ? 'grid-rows-[1fr] opacity-100 mt-2 py-1' : 'grid-rows-[0fr] opacity-0 mt-0 py-0'"
    >
      <div class="min-h-0 text-sm opacity-80 pl-3 border-l border-gray-300 dark:border-gray-700">
        <slot />
      </div>
    </div>
  </div>
</template>
