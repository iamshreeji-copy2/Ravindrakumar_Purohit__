<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const x = ref(-100)
const y = ref(-100)
const isHovering = ref(false)
const isClicking = ref(false)
const isVisible = ref(false)

function onMouseMove(e: MouseEvent) {
  x.value = e.clientX
  y.value = e.clientY
  if (!isVisible.value) {
    isVisible.value = true
  }
}

function onMouseLeave() {
  isVisible.value = false
}

function onMouseEnter() {
  isVisible.value = true
}

function onMouseDown() {
  isClicking.value = true
}

function onMouseUp() {
  isClicking.value = false
}

// Add event listeners for hover state on interactive elements
function updateHoverState(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  if (!target) return
  
  const isInteractive = target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer')
  isHovering.value = !!isInteractive
}

onMounted(() => {
  if (typeof window === 'undefined') return
  
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseleave', onMouseLeave)
  window.addEventListener('mouseenter', onMouseEnter)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mouseover', updateHoverState)
  
  // Hide default cursor
  document.documentElement.classList.add('custom-cursor-enabled')
})

onUnmounted(() => {
  if (typeof window === 'undefined') return
  
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseleave', onMouseLeave)
  window.removeEventListener('mouseenter', onMouseEnter)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mouseover', updateHoverState)
  
  document.documentElement.classList.remove('custom-cursor-enabled')
})
</script>

<template>
  <div
    v-if="isVisible"
    class="custom-cursor print:hidden"
    :class="{ 'is-hovering': isHovering, 'is-clicking': isClicking }"
    :style="{
      left: `${x}px`,
      top: `${y}px`
    }"
  />
</template>

<style>
/* Hide the default OS cursor globally on desktops */
@media (hover: hover) and (pointer: fine) {
  .custom-cursor-enabled,
  .custom-cursor-enabled * {
    cursor: none !important;
  }
}
</style>

<style scoped>
.custom-cursor {
  position: fixed;
  width: 8px;
  height: 8px;
  background-color: #FF9933; /* Saffron */
  border-radius: 50%;
  pointer-events: none; /* Let clicks pass through */
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: width 0.2s ease, height 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, border 0.2s ease;
  box-shadow: 0 0 8px rgba(255, 153, 51, 0.6);
}

/* Hovering over buttons/links -> expand and add outer border */
.custom-cursor.is-hovering {
  width: 20px;
  height: 20px;
  background-color: rgba(255, 153, 51, 0.15);
  border: 1.5px solid #FF9933;
  box-shadow: 0 0 12px rgba(255, 153, 51, 0.8);
}

/* Clicking state -> shrink */
.custom-cursor.is-clicking {
  transform: translate(-50%, -50%) scale(0.75);
  background-color: #e07b16;
}
</style>
