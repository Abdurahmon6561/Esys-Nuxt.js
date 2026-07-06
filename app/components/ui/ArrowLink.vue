<script setup>
// Arrow text link - used for "back to list" and "all projects" navigation.
import { computed } from "vue";

const props = defineProps({
  to: { type: String, required: true },
  text: { type: String, required: true },
  // "back" → arrow points left; "forward" → arrow points right.
  direction: { type: String, default: "back" },
});

const localePath = useLocalePath();
const target = computed(() => localePath(props.to));
</script>

<template>
  <NuxtLink :to="target" class="alink" :class="`alink--${direction}`">
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        :d="direction === 'back' ? 'M19 12H5M11 18l-6-6 6-6' : 'M5 12h14M13 6l6 6-6 6'"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span>{{ text }}</span>
  </NuxtLink>
</template>

<style scoped>
.alink {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #a9d6e5;
  text-decoration: none;
  transition: color 0.2s ease, gap 0.2s ease;
}

.alink:hover {
  color: #eef1f7;
}

.alink--back:hover {
  gap: 0.35rem;
}

.alink--forward:hover {
  gap: 0.65rem;
}
</style>