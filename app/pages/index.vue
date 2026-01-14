<script setup>
import Hero from "~/components/Hero.vue";
import Projects from "~/components/Projects.vue";
import Services from "~/components/Services.vue";
import Users from "~/components/Users.vue";
</script>

<template>
  <div>
    <div id="hero-section" class="page-section hero-section"><Hero /></div>
    <div id="projects-section" class="page-section"><Projects /></div>
    <div id="users-section" class="page-section"><Users /></div>
    <div id="services-section" class="page-section"><Services /></div>
  </div>
</template>
