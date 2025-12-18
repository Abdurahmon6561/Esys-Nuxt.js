<script setup>
import { ref, onMounted, nextTick, watch, computed, defineExpose } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useApiService } from "~/composables/useApiService.js";
import gsap from "gsap";

const cardsRef = ref([]);
const { t, locale } = useI18n();
const router = useRouter();
const localePath = useLocalePath();

const { portfolioApi } = useApiService();

const portfolio = ref([]);
const loading = ref(false);
const error = ref(null);
const showAll = ref(false);
const allPortfolioData = ref([]);
const selectedFilter = ref("all"); 

const filteredPortfolio = computed(() => {
  if (selectedFilter.value === "all") {
    return allPortfolioData.value;
  }
  
  const normalizedFilter = selectedFilter.value.toLowerCase().trim();
  
  return allPortfolioData.value.filter(project => {
    if (!project.services || !Array.isArray(project.services)) {
      return false;
    }
    
    return project.services.some(service => {
      const normalizedService = service.toLowerCase().trim();
      return normalizedService === normalizedFilter || 
             normalizedService.includes(normalizedFilter) ||
             normalizedFilter.includes(normalizedService);
    });
  });
});

const displayedPortfolio = computed(() => {
  const filtered = filteredPortfolio.value;
  return showAll.value ? filtered : filtered.slice(0, 4);
});

const setupCursorLogic = async () => {
  await nextTick();
  
  cardsRef.value.forEach((card) => {
    const cursor = card.querySelector(".card-cursor");
    if (!cursor) return;

    card.removeEventListener("mousemove", card._mousemoveHandler);
    card.removeEventListener("mouseenter", card._mouseenterHandler);
    card.removeEventListener("mouseleave", card._mouseleaveHandler);

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
    allPortfolioData.value = response.data || response;

    portfolio.value = displayedPortfolio.value;
    await setupCursorLogic();
  } catch (err) {
    error.value = err.message || 'Failed to fetch projects';
    console.error('Error fetching projects:', err);
  } finally {
    loading.value = false;
  }
};

watch(selectedFilter, () => {
  portfolio.value = displayedPortfolio.value;
  nextTick(() => {
    setupCursorLogic();
  });
});

watch(
  locale,
  () => {
    fetchPortfolio();
  },
  { immediate: false }
);

watch(
  showAll,
  () => {
    portfolio.value = displayedPortfolio.value;
  },
  { immediate: false }
);

const openProject = (card) => {
  const alias = card.alias || card.slug || card.id;
  router.push(`${localePath("/view")}?alias=${alias}`);
};

const toggleShowAll = async () => {
  showAll.value = !showAll.value;
  portfolio.value = displayedPortfolio.value;
  await nextTick();
  await setupCursorLogic();
};

const setFilter = (filter) => {
  const normalizedFilter = filter.toLowerCase().trim();
  selectedFilter.value = normalizedFilter === "all" || normalizedFilter === "все" ? "all" : normalizedFilter;
};

const handleFilterSelected = (filter) => {
  setFilter(filter);
  setTimeout(() => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      const offset = 100; // Adjust this value as needed
      const elementPosition = projectsSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, 100);
};

defineExpose({
  handleFilterSelected
});

onMounted(async () => {
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
            class="absolute bottom-3 sm:bottom-6 left-3 cursor-pointer sm:left-[20px] right-3 sm:right-[20px] backdrop-blur-md bg-white/30 rounded-lg sm:rounded-xl shadow p-2 sm:p-4 w-[calc(100%-1.5rem)] sm:w-auto flex items-center justify-between hover:bg-white/40 transition"
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

    <!-- More Projects Button -->
    <div v-if="portfolio.length > 0" class="flex justify-center mt-8 md:mt-12">
      <button
        @click="toggleShowAll()"
        :class="showAll ? 'hidden' : ''"
        class="px-5 py-2 border-2 border-[#EEE] cursor-pointer rounded-full font-medium text-[#080808] hover:bg-[#EEE] text-sm sm:text-base transition-colors duration-200"
      >
        {{ t("projects.more_projects") }}
      </button>
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