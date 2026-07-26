<template>
  <span
    class="logo-text text-3xl font-normal select-none inline-block leading-none pr-2 transition-all duration-300"
    style="font-family: 'Great Vibes', 'Dancing Script', 'Brush Script MT', cursive;"
  >
    RP
  </span>
</template>

<style scoped>
.logo-text {
  color: inherit;
  display: inline-block;
  animation: breathing 6s ease-in-out infinite;
  text-shadow: 0 0 1px transparent;
}

.logo-text:hover {
  animation: hover-bounce 0.6s ease-out forwards;
  color: #ff9933; /* Saffron highlight on hover */
  text-shadow: 0 0 8px rgba(255, 153, 51, 0.4);
}

@keyframes breathing {
  0%,
  100% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
  50% {
    transform: translateY(-2px) scale(1.04) rotate(1.5deg);
    text-shadow: 0 0 4px rgba(255, 153, 51, 0.15);
  }
}

@keyframes hover-bounce {
  0% {
    transform: scale(1) rotate(0deg);
  }
  30% {
    transform: scale(1.18) rotate(-5deg);
  }
  60% {
    transform: scale(1.08) rotate(3deg);
  }
  100% {
    transform: scale(1.14) rotate(-2deg);
  }
}
</style>
