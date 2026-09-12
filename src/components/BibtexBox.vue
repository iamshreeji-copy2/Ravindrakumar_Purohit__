<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  bibtex?: string
}>()

const defaultBibtex = `@misc{purohit2026prismv,
  author       = {Ravindrakumar M. Purohit and Hemant A. Patil},
  title        = {{PRISM-V}: Multidimensional Evaluation of Pretrained
                  Neural Vocoders for Speech Synthesis},
  year         = {2026},
  howpublished = {\\url{https://iamshreeji-copy2.github.io/open_vocoder_leaderboard/}},
  note         = {Open neural vocoder evaluation leaderboard}
}`

const textToCopy = computed(() => (props.bibtex || defaultBibtex).trim())
const { copy, copied } = useClipboard({ source: textToCopy })
</script>

<template>
  <div class="relative group my-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/70 overflow-hidden font-mono text-sm shadow-sm">
    <div class="flex items-center justify-between px-4 py-2 bg-gray-200/40 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 select-none">
      <span class="font-semibold uppercase tracking-wider text-[11px] opacity-75">BibTeX</span>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 shadow-sm"
        :class="copied ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'"
        title="Copy BibTeX to clipboard"
        @click="copy()"
      >
        <span v-if="copied" class="i-carbon-checkmark text-sm" />
        <span v-else class="i-carbon-copy text-sm" />
        <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
      </button>
    </div>
    <pre class="p-4 m-0 overflow-x-auto text-xs sm:text-sm leading-relaxed text-gray-800 dark:text-gray-200 bg-transparent border-none font-mono"><code>{{ textToCopy }}</code></pre>
  </div>
</template>
