<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";

// const images = [
//   "/images/bg-hero.jpg",
//   "/images/bg-hero2.jpg",
//   "/images/bg-hero3.jpg",
// ];

const currentIndex = ref(0);
const heroSection = ref(null);

const changeBackground = (direction) => {
  // const button = direction === "next" ? rightButton.value : leftButton.value;

  // gsap.fromTo(
  //   button,
  //   { scale: 1 },
  //   {
  //     scale: 1.2,
  //     duration: 0.3,
  //     ease: "power2.out",
  //     yoyo: true,
  //     repeat: 1
  //   }
  // );

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

const leftButton = ref(null);
const rightButton = ref(null);

let leftInitialY = 0;
let rightInitialY = 0;

const proximityThreshold = 100;

const moveSideButtons = (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const windowWidth = window.innerWidth;

  // left button
  if (mouseX < proximityThreshold) {
    const rect = leftButton.value.getBoundingClientRect();
    const offsetY = mouseY - rect.top - rect.height / 2;

    gsap.to(leftButton.value, {
      y: offsetY,
      duration: 0.8,
      ease: "elastic.out(1, 0.4)",
    });

    const svg = leftButton.value.querySelector("svg");
    gsap.to(svg, {
      scaleY: 1 + Math.abs(offsetY) / 300,
      skewY: offsetY / 40,
      transformOrigin: "center",
      duration: 0.5,
      ease: "sine.out",
    });
  } else {
    gsap.to(leftButton.value, { y: leftInitialY, duration: 1, ease: "sine.out" });
    gsap.to(leftButton.value.querySelector("svg"), {
      scaleY: 1,
      skewY: 0,
      duration: 0.6,
      ease: "sine.out",
    });
  }

  // right button
  if (mouseX > windowWidth - proximityThreshold) {
    const rect = rightButton.value.getBoundingClientRect();
    const offsetY = mouseY - rect.top - rect.height / 2;

    gsap.to(rightButton.value, {
      y: offsetY,
      duration: 0.8,
      ease: "elastic.out(1, 0.4)",
    });

    const svg = rightButton.value.querySelector("svg");
    gsap.to(svg, {
      scaleY: 1 + Math.abs(offsetY) / 300,
      skewY: offsetY / 40,
      transformOrigin: "center",
      duration: 0.5,
      ease: "sine.out",
    });
  } else {
    gsap.to(rightButton.value, { y: rightInitialY, duration: 1, ease: "sine.out" });
    gsap.to(rightButton.value.querySelector("svg"), {
      scaleY: 1,
      skewY: 0,
      duration: 0.6,
      ease: "sine.out",
    });
  }
};

onMounted(() => {
  gsap.to(leftButton.value, {
    y: "+=10",
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(rightButton.value, {
    y: "-=10",
    duration: 2.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // Wave effect for SVG inside buttons
  gsap.to(leftButton.value.querySelector("svg"), {
    scaleY: 1.05,
    skewY: 4,
    transformOrigin: "center",
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(rightButton.value.querySelector("svg"), {
    scaleY: 1.05,
    skewY: -4,
    transformOrigin: "center",
    duration: 1.7,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.from(".hero-text", {
    opacity: 0,
    duration: 2,
    scale: 0.3,
  });

  gsap.from('.hero-btns', {
    y: +100,
    opacity: 0,
    duration: 2
  });

  window.addEventListener("mousemove", moveSideButtons);
});
</script>

<template>
  <section ref="heroSection"
    class="flex items-center justify-center min-h-screen bg-cover bg-center hero rounded-tl-lg rounded-tr-lg"
    style="background-image: url('/images/bg-hero.webp')">
    <div class="flex justify-between w-full items-center h-screen">
      <!-- Left Arrow -->
      <button @click="changeBackground('prev')" ref="leftButton" class="ml-[-2px] md:block hidden ">
        <svg class="clip-path-group" width="78" height="320" viewBox="0 0 78 320" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <mask id="mask0_185_55" style="mask-type: luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="78"
            height="320">
            <path d="M77.41 0.0271912H0V319.973H77.41V0.0271912Z" fill="var(--color-white-solid, #ffffff)" />
          </mask>
          <g mask="url(#mask0_185_55)">
            <mask id="mask1_185_55" style="mask-type: luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="50"
              height="321">
              <path d="M49.0263 0.543243V320.489H0.516071V0.543243H49.0263Z" fill="var(--color-white-solid, #ffffff)" />
            </mask>
            <g mask="url(#mask1_185_55)">
              <path
                d="M3.47599 44.1098C5.7191 77.1494 16.2741 109.102 34.164 136.981C43.2465 151.141 43.3979 169.25 34.5631 183.561L33.7924 184.786C16.1227 213.367 5.69158 245.829 3.3659 279.35L0.517281 320.481V0.543243L3.47599 44.1098Z"
                fill="var(--color-white-solid, #ffffff)" />
            </g>
          </g>
        </svg>
        <img src="/images/arrow_left.webp" alt="arrow-left"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 ml-[-17px]" />
      </button>

      <!-- center -->
      <div class="relative z-10 text-center text-white flex-1">
        <h1 class="text-2xl md:text-[50px] font-extrabold leading-tight hero-text">
          Цифровые решения,<br />
          которые помогают вашему <br />
          бизнесу расти быстрее
        </h1>

        <div class="mt-8 md:flex justify-center grid md:grid-cols-2 gap-4 hero-btns">
          <button
            class="md:px-6 px-6 py-3 text-[13px] md:text-[15px] bg-white text-black rounded-full font-semibold hover:bg-gray-200 hover:shadow-2xl hover:scale-110 transition-transform duration-700">
            Наши проекты
          </button>
          <button class="relative overflow-hidden md:px-6 px-2 py-3 md:max-w-[139px] 
  text-[13px] md:text-[15px] bg-transparent border flex justify-center 
  items-center gap-2 border-white rounded-full font-semibold text-white group hover:shadow-2xl hover:scale-110 transition-transform duration-700">
            <span
              class="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-500 ease-in-out group-hover:w-full -z-10"></span>

            <span class="relative z-10 group-hover:text-black transition-colors duration-300">
              Связаться
            </span>

            <img src="/images/contact_arrow_up.svg" alt="logo"
              class="w-4 h-4 transition-all duration-300 relative z-10 group-hover:invert-0 group-hover:brightness-0">
          </button>

        </div>
      </div>

      <!-- Right Arrow -->
      <button @click="changeBackground('next')" ref="rightButton" class="mr-[-2px] md:block hidden">
        <svg class="clip-path-group" width="78" height="320" viewBox="0 0 78 320" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <mask id="mask0_185_2" style="mask-type: luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="78"
            height="320">
            <path d="M78 0.0271912H0.589966V319.973H78V0.0271912Z" fill="var(--color-white-solid, #ffffff)" />
          </mask>
          <g mask="url(#mask0_185_2)">
            <mask id="mask1_185_2" style="mask-type: luminance" maskUnits="userSpaceOnUse" x="28" y="0" width="50"
              height="321">
              <path d="M28.9736 320.489V0.543274H77.4839V320.489H28.9736Z" fill="var(--color-white-solid, #ffffff)" />
            </mask>
            <g mask="url(#mask1_185_2)">
              <path
                d="M74.524 276.922C72.2809 243.883 61.7259 211.93 43.836 184.051C34.7535 169.891 34.6021 151.782 43.437 137.471L44.2076 136.246C61.8773 107.665 72.3084 75.2034 74.6341 41.6822L77.4827 0.55127V320.489L74.524 276.922Z"
                fill="var(--color-white-solid, #ffffff)" />
            </g>
          </g>
        </svg>
        <img src="/images/arrow_left.webp" alt="arrow-right"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rotate-180 ml-[17px]" />
      </button>
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
