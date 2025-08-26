<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";

const images = [
  "/images/bg-hero.jpg",
  "/images/bg-hero2.jpg",
  "/images/bg-hero3.jpg",
];

const currentIndex = ref(0);
const heroSection = ref(null);

const changeBackground = (direction) => {
  if (direction === "next") {
    currentIndex.value = (currentIndex.value + 1) % images.length;
  } else {
    currentIndex.value =
      (currentIndex.value - 1 + images.length) % images.length;
  }

  gsap.to(heroSection.value, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      heroSection.value.style.backgroundImage = `url('${images[currentIndex.value]}')`;
      gsap.to(heroSection.value, { opacity: 1, duration: 0.6 });
    },
  });
};

onMounted(() => {
  gsap.from(".hero-text", {
    x: -100,
    opacity: 0,
    duration: 1
  });
});
</script>

<template>
  <section
    ref="heroSection"
    class="flex items-center justify-center min-h-screen bg-cover bg-center hero rounded-tl-lg rounded-tr-lg"
    style="background-image: url('/images/bg-hero.jpg')"
  >
    <div class="flex justify-between w-full items-center h-screen">
      <!-- Left Arrow -->
      <button
        @click="changeBackground('prev')"
        class="z-20 text-white text-4xl px-4 py-2 bg-black/40 hover:bg-black/60 rounded-r-lg transition-all duration-300 hero-text"
      >
        ‹
      </button>

      <!-- center content -->
      <div class="relative z-10 text-center text-white flex-1">
        <h1
          class="text-2xl md:text-[50px] font-extrabold leading-tight hero-text"
        >
          Цифровые решения,<br />
          которые помогают вашему <br />
          бизнесу расти быстрее
        </h1>

        <div class="mt-8 md:flex justify-center grid md:grid-cols-2 gap-4">
          <button
            class="md:px-6 px-2 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            Наши проекты
          </button>
          <button
            class="md:px-6 px-2 py-3 bg-transparent border border-white rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300 hero-text" 
          >
            Связаться
          </button>
        </div>
      </div>

      <!-- Right Arrow -->
      <button
        @click="changeBackground('next')"
        class="z-20 text-white text-4xl px-4 py-2 bg-black/40 hover:bg-black/60 rounded-l-lg transition-all duration-300"
      >
        ›
      </button>
    </div>
  </section>
</template>

<style>
.hero {
  border-top-left-radius: 10px !important;
  border-top-right-radius: 10px !important;
}
</style>
