<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import gsap from "gsap";

const cardsRef = ref([]);
const { t } = useI18n();

const cards = [
  {
    image: "/images/man.webp",
    title: "Wonder Comfort",
    tech: "Laravel, PHP, JavaScript, Figma, Vue.js",
    tags: [t("projects.tags.websites")],
  },
  {
    image: "/images/soundBar.webp",
    title: "Sound Bar",
    tech: "Laravel, JavaScript, Figma, Flutter, Vue.js",
    link: "https://soundbar010.com/",
    tags: [t("projects.tags.websites"), t("projects.tags.mobile_apps")],
  },
  {
    image: "/images/car.webp",
    title: t("projects.car_card_title"),
    tech: "Laravel, PHP, JavaScript, Figma, Vue.js",
    link: "https://asacar.uz/",
    tags: [t("projects.tags.websites")],
  },
  {
    image: "/images/bbd.jpg",
    title: "BBD",
    tech: "Laravel, PHP, MySQL, JavaScript",
    link: "https://bbd.uz/",
    tags: [t("projects.tags.websites")],
  },
];

const openLink = (url) => {
  window.open(url, "_blank");
};

onMounted(async () => {
  await nextTick();

  // Animate each card's cursor inside
  cardsRef.value.forEach((card) => {
    const cursor = card.querySelector(".card-cursor");

    // move cursor inside card only
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(cursor, {
        x,
        y,
        duration: 0.2,
        ease: "power3.out",
      });
    });

    // show on enter
    card.addEventListener("mouseenter", () => {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.2 });
    });

    // hide on leave
    card.addEventListener("mouseleave", () => {
      gsap.to(cursor, { scale: 0.5, opacity: 0, duration: 0.2 });
    });
  });
});
</script>

<template>
  <div class="container mx-auto mb-[80px] mt-[64px]" id="projects">
    <div class="flex justify-center items-center">
      <h3
        class="text-sm text-[#080808] border-2 rounded-full p-2 border-[#EEE]"
      >
        {{ t("hero.our_projects") }}
      </h3>
    </div>

    <div class="flex justify-center">
      <h2
        class="md:text-5xl text-2xl text-[#080808] font-medium text-center mt-5 md:w-[1070px]"
      >
        {{ t("projects.title") }}
      </h2>
    </div>

    <div class="flex flex-wrap justify-center gap-[32px] mt-12">
      <!-- Cards -->
      <!-- Inside v-for loop -->
      <div
        v-for="(card, i) in cards"
        :key="i"
        ref="cardsRef"
        class="relative rounded-xl overflow-hidden shadow-xl md:h-[501px] md:w-[656px] project-cards"
      >
        <img
          :src="card.image"
          alt="Project"
          class="w-full h-full object-cover"
        />

        <!-- Custom Cursor INSIDE Card (Clickable) -->
        <div class="card-cursor" v-if="card.link" @click="openLink(card.link)">
          {{ t("projects.view") }}
          <!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="#fff" class="w-6 h-6">
            <path
              d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z"
            />
          </svg> -->
        </div>

        <!-- Category -->
        <div class="absolute top-3 left-3 flex gap-1 z-10">
          <span
            v-for="(tag, t) in card.tags"
            :key="t"
            class="bg-white text-gray-800 text-sm px-3 py-1 rounded-full shadow"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Button -->
        <a :href="card.link" target="_blank">
          <button
            class="absolute bottom-6 left-[20px] right-[20px] backdrop-blur-md bg-white/30 rounded-xl shadow md:p-4 p-2 md:w-[608px] md:h-[89px] flex items-center justify-between hover:bg-white/40 transition"
          >
            <div class="text-left">
              <h3
                :class="[
                  'md:text-[24px] font-medium',
                  i === 1 ? 'text-black' : 'text-white',
                ]"
              >
                {{ card.title }}
              </h3>
              <p
                :class="[
                  'md:text-[14px]',
                  i === 1 ? 'text-black' : 'text-white',
                ]"
              >
                {{ card.tech }}
              </p>
            </div>
            <div
              class="flex items-center justify-center md:w-12 md:h-12 w-[30px] h-[30px] rounded-xl border-2 border-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-cursor {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%) scale(0.5);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; 
  cursor: pointer; 
  opacity: 0;
  z-index: 20;
}

@media (max-width: 768px) {
  .card-cursor {
    display: none;
  }
}
</style>
