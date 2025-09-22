<script setup>
import { useCustomCursor } from '~/composables/useCustomCursor.js';

const { initCursor, destroyCursor } = useCustomCursor();

onMounted(() => {
  initCursor();
});

onBeforeUnmount(() => {
  destroyCursor();
});
</script>

<template>
  <NuxtLayout>
      <NuxtPage />
  </NuxtLayout>
</template>
