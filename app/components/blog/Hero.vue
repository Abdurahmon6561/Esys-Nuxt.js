<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

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
    duration: 2,
    scale: 0.3,
  });

  gsap.from(".hero-btns", {
    y: +100,
    opacity: 0,
    duration: 2,
  });

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

<!-- look in this code the Bottom Navigation Button not in centre -->
<template>
  <section
    ref="heroSection"
    id="smooth-wrapper"
    class="flex items-center justify-center min-h-screen bg-cover bg-center hero rounded-tl-lg rounded-tr-lg"
    style="background-image: url('/images/blog-hero.webp')"
  >
    <div
      class="flex justify-center w-full items-center h-screen relative"
      id="smooth-content"
    >
      <!-- Center Content -->
      <div class="relative z-10 text-center text-white flex-1">
        <h1
          class="text-2xl md:text-[92px] font-extrabold leading-tight hero-text"
        >
          Откройте для себя <br />
          наши проекты
        </h1>

        <div
          class="mt-8 md:flex justify-center grid md:grid-cols-2 gap-4 hero-btns"
        >
          <button
            class="md:px-6 h-[41px] border-white/40  text-[13px] md:text-[15px] bg-white text-black rounded-full font-medium hover:bg-gray-200 hover:shadow-2xl hover:scale-110 transition-transform duration-700"
          >
            Все
          </button>
          <button
            class="relative overflow-hidden h-[41px] border-white/40 md:px-6 px-2 py-3 text-[13px] md:text-[15px] bg-transparent border flex justify-center items-center gap-2 hover:border-none rounded-full font-medium text-white group hover:shadow-2xl hover:scale-110 transition-transform duration-700"
          >
            <span
              class="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-500 ease-in-out group-hover:w-full -z-10"
            ></span>

            <span
              class="relative z-10 group-hover:text-black transition-colors duration-300"
            >
              Веб-сайты
            </span>
          </button>
          <button
            class="relative overflow-hidden border-white/40  h-[41px] md:px-6 px-2 py-3 text-[13px] md:text-[15px] bg-transparent border flex justify-center items-center gap-2 hover:border-none rounded-full font-medium text-white group hover:shadow-2xl hover:scale-110 transition-transform duration-700"
          >
            <span
              class="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-500 ease-in-out group-hover:w-full -z-10"
            ></span>

            <span
              class="relative z-10 group-hover:text-black transition-colors duration-300"
            >
              Приложения
            </span>
          </button>
          <button
            class="relative overflow-hidden border-white/40  h-[41px] md:px-6 px-2 py-3 text-[13px] md:text-[15px] bg-transparent border flex justify-center items-center gap-2 hover:border-none rounded-full font-medium text-white group hover:shadow-2xl hover:scale-110 transition-transform duration-700"
          >
            <span
              class="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-500 ease-in-out group-hover:w-full -z-10"
            ></span>

            <span
              class="relative z-10 group-hover:text-black transition-colors duration-300"
            >
              CRM-системы
            </span>
          </button>
        </div>
      </div>

      <!-- Bottom Navigation Button -->
     <div class="flex justify-center items-center">
         <button
        @click="scrollDown"
        ref="bottomButton"
        class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 md:block hidden z-50"
      >
        <!-- Main Button Shape SVG -->
        <img src="/images/arrow-down.png" alt="arrow" class="z-50" />
        <!-- Down Arrow SVG -->
        <div
          class="absolute top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <img
            src="/images/arrow-down-hero.png"
            alt="arrow"
            class="z-50 w-4 h-4"
          />
        </div>
      </button>
     </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  overflow: hidden;
}
</style>
