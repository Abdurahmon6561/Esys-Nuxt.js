<script setup>
import { onMounted } from 'vue'
import Hero from '~/components/project/Hero.vue';
import Projects from '~/components/project/Projects.vue';
import Technologies from '~/components/project/Technologies.vue';
import Users from '~/components/project/Users.vue';

// Page animations on mount
onMounted(async () => {
  if (process.client) {
    const { gsap } = await import('gsap')
    
    // Animate page sections with stagger
    gsap.fromTo('.page-section', 
      {
        opacity: 0,
        y: 60,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        delay: 0.1
      }
    )
  }
})
</script>

<template>
  <div>
    <div class="page-section"><Hero /></div>
    <div class="page-section"><Projects /></div>
    <div class="page-section"><Users /></div>
    <div class="page-section"><Technologies /></div>
  </div>
</template>