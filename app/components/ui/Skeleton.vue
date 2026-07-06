<script setup>
// Pulse skeleton placeholder. Use while a list/grid is loading so layout
// doesn't jump when data arrives.
defineProps({
  minHeight: { type: String, default: "440px" },
  featured: { type: Boolean, default: false },
});
</script>

<template>
  <div
    class="usk"
    :class="{ 'usk--featured': featured }"
    :style="{ minHeight }"
  />
</template>

<style scoped>
.usk {
  border-radius: 1.25rem;
  background: rgba(238, 241, 247, 0.04);
  animation: usk-pulse 1.4s ease-in-out infinite;
}

.usk--featured {
  min-height: 520px;
}

@keyframes usk-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.85;
  }
}

@media (prefers-reduced-motion: reduce) {
  .usk {
    animation: none;
    opacity: 0.5;
  }
}
</style>