<script setup>
import { ref, onMounted, watch } from "vue";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useRoute } from "vue-router";
import { useApiService } from "~/composables/useApiService.js";
import { useI18n } from "vue-i18n";
import { useLocalePath } from "#i18n";

gsap.registerPlugin(ScrollToPlugin);

const route = useRoute();
const { portfolioApi } = useApiService();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const project = ref(null);
const loading = ref(false);
const error = ref(null);

const fetchProject = async (alias) => {
  if (!alias) return;

  try {
    loading.value = true;
    error.value = null;
    const response = await portfolioApi.getPortfolioByAlias(alias);
    project.value = response.portfolio || response.data || response;
  } catch (err) {
    error.value = err.message || "Failed to fetch project";
    console.error("Error fetching project:", err);

    const stored = localStorage.getItem("selectedProject");
    if (stored) {
      project.value = JSON.parse(stored);
    }
  } finally {
    loading.value = false;
  }
};

watch(
  locale,
  () => {
    const alias = route.query.alias;
    if (alias) {
      fetchProject(alias);
    }
  },
  { immediate: false }
);

onMounted(() => {
  const alias = route.query.alias;

  if (alias) {
    fetchProject(alias);
  } else {
    const stored = localStorage.getItem("selectedProject");
    if (stored) {
      project.value = JSON.parse(stored);
    }
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
    <!-- Hero Section -->
    <section v-if="project" ref="heroSection"
      class="relative flex items-center justify-center min-h-[calc(100vh-3rem)] bg-cover bg-center hero rounded-lg overflow-hidden hero-section"
      :style="`background-image: url('${project.image}')`">
      <div class="absolute inset-0 bg-black/50"></div>

      <div class="relative z-10 flex flex-col items-center justify-center px-4">
        <div
          class="flex items-center justify-center overflow-hidden h-[41px] md:px-6 px-2 py-2 select-none text-[13px] md:text-[15px] border border-white/40 rounded-full font-medium transition-transform duration-700">
          <span v-for="(service, i) in project.services" :key="i" class="text-[14px] font-medium text-white">
            {{ service }}
          </span>
        </div>

        <h1 class="text-5xl md:text-6xl font-extrabold mt-4 text-white drop-shadow-lg">
          {{ project.title }}
        </h1>
      </div>
    </section>

    <!-- Content Section -->
    <div class="flex justify-center mx-auto ">
      <div class="mb-[89px] gap-16 text-gray-800 leading-relaxed flex justify-between mt-[48px]">
        <section v-if="project?.text">
          <h1 class="font-medium text-[18px] mb-5">
            {{ t("projects.project_review") }}
          </h1>
          <div class="md:flex justify-between md:w-[326px]">
            <div v-html="project.text" class="text-lg"></div>
          </div>
          <a v-if="project?.link" :href="project.link" target="_blank" rel="noopener noreferrer"
            class="flex text-center md:w-full gap-2 mt-[16px] items-center justify-center cursor-pointer overflow-hidden h-[41px] md:px-5 px-2 py-3 text-[13px] md:text-[15px] border border-gray-300 rounded-full font-medium transition-transform duration-700">
            {{ t("projects.view_project") }}
            <img src="/images/open_project.svg" alt="" />
          </a>

          <div class="mt-[100px] flex flex-col gap-3 md:w-[326px]">

            <!-- Client -->
            <div class="border border-gray-300 rounded-lg p-4 grid grid-cols-[110px_1fr] gap-4 items-start">
              <p class="text-[16px] font-normal text-gray-600">
                {{ t("projects.client") }}
              </p>
              <p class="text-[16px] font-semibold break-words leading-snug">
                Компания заказчика
              </p>
            </div>

            <!-- Category -->
            <div class="border border-gray-300 rounded-lg p-4 grid grid-cols-[110px_1fr] gap-4 items-start">
              <p class="text-[16px] font-normal text-gray-600">
                {{ t("projects.category") }}
              </p>
              <p class="text-[16px] font-semibold break-words leading-snug">
                <span v-for="(service, i) in project.services" :key="i">
                  {{ service }}<span v-if="i < project.services.length - 1">, </span>
                </span>
              </p>
            </div>

            <!-- Date -->
            <div class="border border-gray-300 rounded-lg p-4 grid grid-cols-[110px_1fr] gap-4 items-start">
              <p class="text-[16px] font-normal text-gray-600">
                {{ t("projects.date") }}
              </p>
              <p class="text-[16px] font-semibold break-words leading-snug">
                Сентябрь 3, 2025
              </p>
            </div>

          </div>
        </section>
        <div v-if="project" class="md:flex flex-col gap-4 hidden">
          <img :src="project.image" alt="project_image" class="md:w-[977px] md:h-[733px] object-cover" />
          <img :src="project.image" alt="project_image" class="md:w-[977px] md:h-[733px] object-cover" />
          <img :src="project.image" alt="project_image" class="md:w-[977px] md:h-[733px] object-cover" />
        </div>
      </div>
    </div>
  </div>
</template>
