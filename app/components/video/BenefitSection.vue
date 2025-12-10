<template>
  <section class="benefit-section">
    <div class="relative overlay-box">
      <VideoPinSection   />
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

onMounted(() => {
  const revealTl = gsap.timeline({
    delay: 1,
    scrollTrigger: {
      trigger: ".benefit-section",
      start: "top 60%",
      end: "top top",
      scrub: 1.5,
    },
  })

  revealTl
    .to(".benefit-section .first-title", {
      duration: 1,
      opacity: 1,
      clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
      ease: "circ.out",
    })
    .to(".benefit-section .second-title", {
      duration: 1,
      opacity: 1,
      clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
      ease: "circ.out",
    })
    .to(".benefit-section .third-title", {  
      duration: 1,
      opacity: 1,
      clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
      ease: "circ.out",
    })
    .to(".benefit-section .fourth-title", {
      duration: 1,
      opacity: 1,
      clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
      ease: "circ.out",
    })
})

// Cleanup on unmount
onUnmounted(() => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
})
</script>