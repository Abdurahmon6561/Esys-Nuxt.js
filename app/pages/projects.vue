<script setup>
import { ref } from "vue";
import Hero from "~/components/project/Hero.vue";
import Projects from "~/components/project/Projects.vue";
import Technologies from "~/components/project/Technologies.vue";
import Users from "~/components/project/Users.vue";

const projectsRef = ref(null);

const handleFilterSelected = (filter) => {
  if (projectsRef.value && typeof projectsRef.value.handleFilterSelected === 'function') {
    projectsRef.value.handleFilterSelected(filter);
  }
};
</script>

<template>
  <div>
    <div class="page-section hero-section">
      <Hero @filter-selected="handleFilterSelected" />
    </div>
    <div class="page-section">
      <Projects ref="projectsRef" />
    </div>
    <div class="page-section"><Users /></div>
    <div class="page-section"><Technologies /></div>
  </div>
</template>