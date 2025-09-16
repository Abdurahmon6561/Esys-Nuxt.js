<template>
  <section class="vd-pin-section">
    <div
      :style="{
        clipPath: isMobile
          ? 'circle(100% at 50% 50%)'
          : 'circle(6% at 50% 50%)',
      }"
      class="size-full video-box"
    >
      <video
        src="/videos/pin-video.mp4"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        class="absolute inset-0 w-full h-full object-cover"
      />

      <div class="abs-center md:scale-100 scale-200">
        <img src="/images/circle-text.svg" alt="" class="spin-circle" />
        <div class="play-btn">
          <img
            src="/images/play.svg"
            alt=""
            class="size-[3vw] ml-[.5vw]"
            style="width: 60px !important"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const isMobile = ref(false);

// Check if device is mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);

  if (!isMobile.value) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".vd-pin-section",
        start: "center bottom", // 👈 section's center reaches bottom of screen
        end: "center center", // 👈 fully open when center aligns with viewport center
        scrub: true,
        pin: true,
      },
    });

    tl.fromTo(
      ".video-box",
      { clipPath: "circle(6% at 50% 50%)" }, // stay small until start
      { clipPath: "circle(100% at 50% 50%)", ease: "none" }
    );
  }
});

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
});
</script>
