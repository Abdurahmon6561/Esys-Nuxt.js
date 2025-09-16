<script setup>
import { onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Hero from "~/components/blog/Hero.vue";
import Info from "~/components/blog/Info.vue";
// import BenefitSection from "~/components/video/BenefitSection.vue";

gsap.registerPlugin(ScrollToPlugin);

// Page animations on mount
onMounted(async () => {
  if (process.client) {
    const { gsap } = await import("gsap");

    // Animate page sections with stagger
    gsap.fromTo(
      ".page-section",
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
        delay: 0.1,
      }
    );
  }

  gsap.to(window, {
    scrollTo: 0,
    duration: 0.1,
    ease: "power2.inOut",
  });
});
</script>

<template>
  <div>
    <div class="page-section hero-section"><Hero /></div>
    <div class="page-section"><Info /></div>
    <!-- <div class="page-section"><BenefitSection /></div> -->
  </div>
</template>
