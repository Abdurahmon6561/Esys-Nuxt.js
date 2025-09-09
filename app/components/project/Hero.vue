<script setup>
import { ref, onMounted, reactive } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

const { t } = useI18n();

const heroSection = ref(null);
const bottomButton = ref(null);

let bottomInitialX = 0;
const proximityThreshold = 100;

const buttonTexts = [t("second_hero.btns.all"), t("second_hero.btns.websites"), t("second_hero.btns.apps"), t("second_hero.btns.crm")];

const buttons = reactive(
  buttonTexts.map((text) => ({
    text,
    xPos: "0px",
    yPos: "0px",
    isHover: false,
  }))
);

const selectedIndex = ref(null);

const updatePosition = (event, index) => {
  if (selectedIndex.value === index) return;
  const rect = event.currentTarget.getBoundingClientRect();
  buttons[index].xPos = `${event.clientX - rect.left}px`;
  buttons[index].yPos = `${event.clientY - rect.top}px`;
  buttons[index].isHover = true;
};

const resetPosition = (index) => {
  if (selectedIndex.value === index) return;
  buttons[index].isHover = false;
};

const selectButton = (index) => {
  selectedIndex.value = index;
  buttons.forEach((btn, i) => {
    btn.isHover = i === index;
  });
};

const isActive = (index) => selectedIndex.value === index;

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
    duration: 1,
    scale: 0.3,
  });

  gsap.from(".hero-btns", {
    y: +100,
    opacity: 0,
    duration: 1,
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
    duration: 4,
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
        <h1
          class="text-2xl md:text-[92px] font-extrabold md:leading-[96px] hero-text md:w-[820px] md:h-[300px]"
        >
          {{ $t("second_hero.title") }}
        </h1>
      </div>

      <div
        class="mt-8 md:flex justify-center grid md:grid-cols-4 gap-4 hero-btns"
      >
        <button
          v-for="(btn, index) in buttons"
          :key="index"
          @mouseenter="updatePosition($event, index)"
          @mousemove="updatePosition($event, index)"
          @mouseleave="resetPosition(index)"
          @click="selectButton(index)"
          class="relative flex items-center justify-center overflow-hidden h-[41px] md:px-6 px-2 py-3 text-[13px] md:text-[15px] border border-white/40 rounded-full font-medium transition-transform duration-700"
        >
          <!-- expanding circle -->
          <span
            class="absolute block rounded-full bg-white transition-all duration-500 ease-in-out -z-10"
            :style="{
              top: btn.yPos,
              left: btn.xPos,
              transform: 'translate(-50%, -50%)',
              width: isActive(index) ? '400px' : btn.isHover ? '400px' : '0px',
              height: isActive(index) ? '400px' : btn.isHover ? '400px' : '0px',
            }"
          ></span>

          <!-- text -->
          <span
            class="relative z-10 transition-colors duration-300"
            :class="
              isActive(index)
                ? 'text-black'
                : btn.isHover
                ? 'text-black'
                : 'text-white'
            "
          >
            {{ btn.text }}
          </span>
        </button>
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

<style scoped>
.hero-text {
  color: transparent;
  background: linear-gradient(90deg, white 50%, black 50%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
}
</style>