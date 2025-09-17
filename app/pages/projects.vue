<script setup>
import Hero from "~/components/project/Hero.vue";
import Projects from "~/components/project/Projects.vue";
import Technologies from "~/components/project/Technologies.vue";
import Users from "~/components/project/Users.vue";
</script>

<template>
  <div>
    <div class="page-section hero-section"><Hero /></div>
    <div class="page-section"><Projects /></div>
    <div class="page-section"><Users /></div>
    <div class="page-section"><Technologies /></div>
  </div>
</template>
