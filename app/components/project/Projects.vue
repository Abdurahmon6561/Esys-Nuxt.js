<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useApiService } from "~/composables/useApiService.js";
import gsap from "gsap";

const cardsRef = ref([]);
const { t, locale  } = useI18n();
const router = useRouter();
const localePath = useLocalePath();

const { portfolioApi } = useApiService();

const portfolio = ref([]);
const loading = ref(false);
const error = ref(null);

const setupCursorLogic = async () => {
  await nextTick();
  
  cardsRef.value.forEach((card) => {
    const cursor = card.querySelector(".card-cursor");
    if (!cursor) return;

    // Remove existing listeners to avoid duplicates
    card.removeEventListener("mousemove", card._mousemoveHandler);
    card.removeEventListener("mouseenter", card._mouseenterHandler);
    card.removeEventListener("mouseleave", card._mouseleaveHandler);

    // Create new handlers
    card._mousemoveHandler = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gsap.to(cursor, { x, y, duration: 0.2, ease: "power3.out" });
    };

    card._mouseenterHandler = () => {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.2 });
    };

    card._mouseleaveHandler = () => {
      gsap.to(cursor, { scale: 0.5, opacity: 0, duration: 0.2 });
    };

    // Add new listeners
    card.addEventListener("mousemove", card._mousemoveHandler);
    card.addEventListener("mouseenter", card._mouseenterHandler);
    card.addEventListener("mouseleave", card._mouseleaveHandler);
  });
};

const fetchPortfolio = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await portfolioApi.getPortfolios();
    portfolio.value = response.data || response;
    // Setup cursor logic after data is loaded
    await setupCursorLogic();
  } catch (err) {
    error.value = err.message || 'Failed to fetch blogs';
    console.error('Error fetching blogs:', err);
  } finally {
    loading.value = false;
  }
};

watch(
  locale,
  () => {
    fetchPortfolio();
  },
  { immediate: false }
);



// don't delete this fake datas
const cards = [
  {
    id: 1,
    image: "/images/man.webp",
    title: "Wonder Comfort",
    tech: "Laravel, PHP, JavaScript, Figma, Vue.js",
    tags: [t("projects.tags.websites")],
    img_color: "black",
  },
  {
    id: 2,
    image: "/images/soundBar.webp",
    title: "Sound Bar",
    tech: "Laravel, JavaScript, Figma, Flutter, Vue.js",
    link: "https://soundbar010.com/",
    tags: [t("projects.tags.websites"), t("projects.tags.mobile_apps")],
    img_color: "white",
  },
  {
    id: 3,
    image: "/images/car.webp",
    title: t("projects.car_card_title"),
    tech: "Laravel, PHP, JavaScript, Figma, Vue.js",
    link: "https://asacar.uz/",
    tags: [t("projects.tags.websites")],
    img_color: "black",
  },
  {
    id: 4,
    image: "/images/bbd.jpg",
    title: "BBD",
    tech: "Laravel, PHP, MySQL, JavaScript",
    link: "https://bbd.uz/",
    tags: [t("projects.tags.websites")],
    img_color: "white",
  },
];

// ✅ when clicking eye
const openProject = (card) => {
  localStorage.setItem("selectedProject", JSON.stringify(card));
  localStorage.setItem("headerColor", card.img_color);
  router.push(`${localePath("/view")}`);
};

onMounted(async () => {
  // First fetch the portfolio data
  await fetchPortfolio();
});
</script> 

<template>
  <div
    class="container mx-auto mb-[60px] mt-[40px] md:mb-[80px] md:mt-[64px] px-4"
    id="projects"
  >
  <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-16">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1aab9a]"
      ></div>
      <span class="ml-4 text-lg text-gray-600">{{
        t("api.loading_blogs")
      }}</span>
    </div>
    <!-- Small Section Title -->
    <div class="flex justify-center items-center">
      <h3
        class="text-xs sm:text-sm text-[#080808] border-2 rounded-full px-3 py-1 border-[#EEE]"
      >
        {{ t("hero.our_projects") }}
      </h3>
    </div>

    <!-- Section Title -->
    <div class="flex justify-center">
      <h2
        class="text-xl sm:text-2xl md:text-5xl text-[#080808] font-medium text-center mt-4 md:mt-5 md:w-[1070px] leading-snug"
      >
        {{ t("projects.title") }}
      </h2>
    </div>

    <!-- Cards -->
    <div
      class="flex flex-wrap justify-center gap-6 md:gap-[32px] mt-8 md:mt-12"
    >
      <div
        v-for="(card, i) in portfolio"
        :key="i"
        ref="cardsRef"
        class="relative rounded-xl overflow-hidden shadow-xl w-full sm:w-[90%] md:w-[656px] h-[280px] sm:h-[360px] md:h-[501px] project-cards"
      >
        <!-- Image -->
        <img
          :src="card.image"
          alt="Project"
          class="w-full h-full object-cover"
        />

        <!-- Eye Cursor (desktop only) -->
        <div class="card-cursor" @click="openProject(card)">
          <svg
            class="eye-svg"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 32C10 16 22 8 32 8s22 8 30 24c-8 16-20 24-30 24S10 48 2 32Z"
              fill="none"
              stroke="white"
              stroke-width="4"
            />
            <circle cx="32" cy="32" r="8" fill="white" />
            <circle cx="32" cy="32" r="4" fill="black" />
            <rect
              class="eyelid"
              x="0"
              y="0"
              width="64"
              height="32"
              fill="black"
            />
          </svg>
        </div>

        <!-- Category -->
        <div
          class="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1 z-10"
        >
          <span
            v-for="(tag, t) in card.services"
            :key="t"
            class="bg-white text-gray-800 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Button -->
        <a :href="card.link" target="_blank">
          <button
            class="absolute bottom-3 sm:bottom-6 left-3 sm:left-[20px] right-3 sm:right-[20px] backdrop-blur-md bg-white/30 rounded-lg sm:rounded-xl shadow p-2 sm:p-4 w-[calc(100%-1.5rem)] sm:w-auto flex items-center justify-between hover:bg-white/40 transition"
          >
            <div class="text-left">
              <h3
                :class="[
                  'text-sm sm:text-lg md:text-[24px] font-medium leading-tight',
                  i === 1 ? 'text-black' : 'text-white',
                ]"
              >
                {{ card.title }}
              </h3>
              <p
                :class="[
                  'text-xs sm:text-sm md:text-[14px]',
                  i === 1 ? 'text-black' : 'text-white',
                ]"
              >
                {{ card.tech }}
              </p>
              <p class="hidden">{{ card.text }}</p>
            </div>
            <div
              class="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl border-2 border-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 sm:h-5 sm:w-5 text-white"
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
  width: 60px;
  height: 60px;
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

.eye-svg {
  width: 30px;
  height: 30px;
  animation: blink 2s infinite;
}

/* Eyelid moves up and down */
.eyelid {
  animation: closeEye 2s infinite;
  transform-origin: top;
}

@keyframes closeEye {
  0%,
  90%,
  100% {
    transform: translateY(-32px);
  }
  95% {
    transform: translateY(0);
  }
}

@keyframes blink {
  0%,
  90%,
  100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
}
</style>
