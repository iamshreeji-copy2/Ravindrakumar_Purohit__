<script setup lang="ts">
function doPrint() {
  if (typeof window !== 'undefined') {
    window.print()
  }
}
</script>

<template>
  <button
    type="button"
    class="px-2.5 py-1 text-xs font-semibold rounded-md bg-gray-500/10 hover:bg-gray-500/20 transition-colors border-none! cursor-pointer inline-flex items-center gap-1 text-current print:hidden"
    title="Print CV / Save PDF"
    @click="doPrint"
  >
    <span i-ri-printer-line /> Print / PDF
  </button>
</template>
