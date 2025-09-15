<script setup>
import { ref, onMounted, reactive } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useI18n } from "vue-i18n";

const { t } = useI18n();    

const heroSection = ref(null);
const bottomButton = ref(null);

let bottomInitialX = 0;
const proximityThreshold = 100;

const moveBottomButton = (e) => {
  if (!bottomButton.value) return;

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const rect = bottomButton.value.getBoundingClientRect();
  const buttonCenterX = rect.left + rect.width / 2;
  const buttonCenterY = rect.top + rect.height / 2;

  const distanceX = Math.abs(mouseX - buttonCenterX);
  const distanceY = Math.abs(mouseY - buttonCenterY);

  // Only move if mouse is within 100px both horizontally & vertically
  if (distanceX <= proximityThreshold && distanceY <= proximityThreshold) {
    const offsetX = mouseX - buttonCenterX;

    gsap.to(bottomButton.value, {
      x: offsetX,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });

    const svg = bottomButton.value.querySelector(".clip-path-group");
    if (svg) {
      gsap.to(svg, {
        scaleX: 1 + Math.abs(offsetX) / 300,
        skewX: offsetX / 40,
        transformOrigin: "center",
        duration: 0.5,
        ease: "sine.out",
      });
    }
  } else {
    // Return to original X when out of proximity
    gsap.to(bottomButton.value, {
      x: bottomInitialX,
      duration: 0.8,
      ease: "sine.out",
    });

    const svg = bottomButton.value.querySelector(".clip-path-group");
    if (svg) {
      gsap.to(svg, {
        scaleX: 1,
        skewX: 0,
        duration: 0.6,
        ease: "sine.out",
      });
    }
  }
};

const scrollDown = () => {
  window.scrollBy({
    top: window.innerHeight,
    behavior: "smooth",
  });
};

onMounted(() => {
  // Floating animation for bottom button
  gsap.to(bottomButton.value, {
    x: "+=15",
    duration: 2.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  // Wave effect for SVG inside button
  gsap.to(bottomButton.value.querySelector(".clip-path-group"), {
    scaleX: 1.05,
    skewX: 3,
    transformOrigin: "center",
    duration: 1.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.from(".hero-text", {
    opacity: 0,
  });

  gsap.fromTo(
    ".hero-text",
    {
      scale: 0.3,
      opacity: 0,
      backgroundPosition: "100% 0", // start with black
    },
    {
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      backgroundPosition: "0% 0", // move gradient like a snake across text
    }
  );

  window.addEventListener("mousemove", moveBottomButton);
});

let smoother = null;

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.5,
    effects: true,
  });
});
</script>

<template>
  <section
    ref="heroSection"
    id="smooth-wrapper"
    class="relative flex items-center justify-center min-h-[calc(100vh-3rem)] bg-cover bg-center hero rounded-lg"
    style="background-image: url('/images/blog-hero.webp')"
  >
    <!-- Center Content -->
    <div class="relative z-10 text-center text-white flex-1">
      <div class="flex justify-center items-center">
        <div v-if="$i18n.locale === 'ru'">
          <h1
            class="text-2xl md:text-[50px] font-extrabold leading-tight hero-text md:max-w-[820px]"
          >
            Блоги и новости
          </h1>
        </div>

        <div v-if="$i18n.locale === 'uz'">
          <h1
            class="text-2xl md:text-[50px] font-extrabold leading-tight hero-text md:max-w-[820px]"
          >
            Blogs & News
          </h1>
        </div>

        <div v-if="$i18n.locale === 'en'">
          <h1
            class="text-2xl md:text-[50px] font-extrabold leading-tight hero-text md:max-w-[820px]"
          >
            Blogs & News
          </h1>
        </div>
      </div>
    </div>

    <!-- Scroll Down Button (absolute at bottom) -->
    <button
      @click="scrollDown"
      ref="bottomButton"
      class="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 flex-col items-center hidden md:flex"
    >
      <img src="/images/arrow-down.png" alt="arrow" />
      <img
        src="/images/arrow-down-hero.png"
        alt="arrow"
        class="w-4 h-4 mt-[-36px]"
      />
    </button>
  </section>
</template>
