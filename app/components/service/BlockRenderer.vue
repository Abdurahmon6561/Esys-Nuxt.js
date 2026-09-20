<script setup>
import { computed } from "vue";
import Hero from "./Hero.vue";
import Problems from "./Problems.vue";
import Audience from "./Audience.vue";
import Features from "./Features.vue";
import Technologies from "./Technologies.vue";
import Stages from "./Stages.vue";
import Timeline from "./Timeline.vue";
import Pricing from "./Pricing.vue";
import Benefits from "./Benefits.vue";
import Cases from "./Cases.vue";
import Articles from "./Articles.vue";
import Faq from "./Faq.vue";
import Cta from "./Cta.vue";

const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
  context: {
    type: Object,
    default: () => ({}),
  },
});

const components = {
  hero: Hero,
  problems: Problems,
  audience: Audience,
  features: Features,
  technologies: Technologies,
  stages: Stages,
  timeline: Timeline,
  pricing: Pricing,
  benefits: Benefits,
  cases: Cases,
  articles: Articles,
  faq: Faq,
  cta: Cta,
};

const currentComponent = computed(() => {
  const type = props.block?.type;
  return type ? components[type] || null : null;
});
</script>

<template>
  <component
    :is="currentComponent"
    v-if="currentComponent"
    :block="block"
    :context="context"
  />
</template>
