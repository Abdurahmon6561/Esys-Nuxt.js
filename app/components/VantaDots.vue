<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const vantaRef = ref(null);
let vantaEffect = null;

onMounted(async () => {
  try {
    // Dynamically import Vanta DOTS
    const VANTA = await import('vanta/dist/vanta.dots.min.js');

    if (vantaRef.value && VANTA.default) {
      vantaEffect = VANTA.default({
        el: vantaRef.value,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x00d9ff,          // Cyan brand color for dots
        color2: 0x0088ff,         // Blue accent color
        backgroundColor: 0x0a0e1a, // Very dark blue-black background
        size: 3.50,               // Larger dots for visibility
        spacing: 25.00,           // More spacing for cleaner look
        showLines: true           // Show connection lines between dots
      });
    }
  } catch (error) {
    console.error('Vanta DOTS initialization error:', error);
  }
});

onUnmounted(() => {
  if (vantaEffect) {
    vantaEffect.destroy();
  }
});
</script>

<template>
  <div ref="vantaRef" class="absolute inset-0 w-full h-full"></div>
</template>

<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>
