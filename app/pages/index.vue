<script setup>
import Hero from "~/components/Hero.vue";
import Projects from "~/components/Projects.vue";
import Services from "~/components/Services.vue";
import Users from "~/components/Users.vue";
</script>

<template>
  <div>
    <div class="page-section hero-section"><Hero /></div>
    <div class="page-section"><Projects /></div>
    <div class="page-section"><Users /></div>
    <div class="page-section"><Services /></div>
  </div>
</template>
