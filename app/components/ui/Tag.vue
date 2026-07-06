<script setup>
// Pill tag - reused across portfolio services, blog tags, and technology lists.
defineProps({
  text: { type: String, required: true },
});
</script>

<template>
  <li class="ui-tag">{{ text }}</li>
</template>

<style scoped>
.ui-tag {
  padding: 0.3rem 0.75rem;
  font-size: 0.8125rem;
  color: #a9d6e5;
  background: rgba(42, 111, 151, 0.18);
  border: 1px solid rgba(42, 111, 151, 0.35);
  border-radius: 999px;
  line-height: 1.4;
}
</style>