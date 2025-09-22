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
const { locale } = useI18n();
const localePath = useLocalePath();
const project = ref(null);
const loading = ref(false);
const error = ref(null);

// Fetch project from API by alias
const fetchProject = async (alias) => {
  if (!alias) return;
  
  try {
    loading.value = true;
    error.value = null;
    const response = await portfolioApi.getPortfolioByAlias(alias);
    // Handle different response structures - extract from portfolio key if needed
    project.value = response.portfolio || response.data || response;
  } catch (err) {
    error.value = err.message || 'Failed to fetch project';
    console.error('Error fetching project:', err);
    
    // Fallback to localStorage if API fails
    const stored = localStorage.getItem("selectedProject");
    if (stored) {
      project.value = JSON.parse(stored);
    }
  } finally {
    loading.value = false;
  }
};

// Watch for locale changes and refetch data
watch(locale, () => {
  const alias = route.query.alias;
  if (alias) {
    fetchProject(alias);
  }
}, { immediate: false });

onMounted(() => {
  // Get alias from route query parameters
  const alias = route.query.alias;
  
  if (alias) {
    // Fetch from API using alias
    fetchProject(alias);
  } else {
    // Fallback to localStorage for backward compatibility
    const stored = localStorage.getItem("selectedProject");
    if (stored) {
      project.value = JSON.parse(stored);
    }
  }

  // Smooth scroll to top
  gsap.to(window, {
    scrollTo: 0,
    duration: 0.1,
    ease: "power2.inOut",
  });
});
</script>

<template>
  <div class="mb-[40px] mt-[60px] md:mb-[80px] md:mt-[80px] px-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1aab9a]"></div>
    </div>

    <!-- Project Content -->
    <div
      v-else-if="project"
      class="w-full max-w-4xl mx-auto bg-white rounded-xl md:rounded-2xl overflow-hidden"
    >
      <!-- Title -->
      <div class="px-4 md:px-6 pt-4 md:pt-6">
        <h1
          class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight text-center md:text-left"
        >
          {{ project.title }}
        </h1>
      </div>

      <!-- Image -->
      <div class="mt-4">
        <img
          :src="project.image"
          alt="Project Image"
          class="w-full h-[220px] sm:h-[300px] md:h-[420px] object-cover rounded-lg"
        />
      </div>

      <!-- Content -->
      <div class="px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
        <!-- Tech -->
        <div class="flex flex-wrap gap-2">
          <p
            v-for="(service, i) in project.services"
            :key="i"
            class="inline-block px-3 py-1 text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full"
          >
            {{ service }}
          </p>
        </div>

        <!-- Description -->
        <p
          v-html="project.text"
          v-if="project.text"
          class="text-base sm:text-lg text-gray-700 leading-relaxed text-justify md:text-left"
        ></p>
        <p
          v-else
          class="text-base sm:text-lg text-gray-700 leading-relaxed text-justify md:text-left"
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat sed
          id, quis velit dolor sunt officia culpa perferendis architecto dolorum
          impedit ab consequuntur illo exercitationem minus vel recusandae,
          magnam esse.
        </p>
      </div>
    </div>

  </div>
</template>
