<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useLocalePath } from "#i18n";
import { useApiService } from "~/composables/useApiService.js";
import { ref, onMounted, watch } from "vue";

const { t, locale } = useI18n();
const router = useRouter();
const localePath = useLocalePath();
const { blogApi } = useApiService();

const blogs = ref([]);
const loading = ref(false);
const error = ref(null);

// Fetch blogs from API
const fetchBlogs = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await blogApi.getBlogs();
    blogs.value = response.data || response; // Handle different response structures
  } catch (err) {
    error.value = err.message || 'Failed to fetch blogs';
    console.error('Error fetching blogs:', err);
    // Fallback to static data if API fails
    blogs.value = [
      {
        id: 1,
        title: "Avtomatlashtirish va sun'iy intellekt veb-sayt ishlab chiqishni qanday o'zgartiradi?",
        image: "https://xrn-a2s-98a-sa7.esys.pro/storage/blogs/main-images/2/lyHb6yFSDNdzDSMrII3iptLs0ekGoKWQ8rzOWH6W.webp",
        date: "2025-08-11",
        tech: ["AI", "Web", "No-code", "Low-code"],
      },
      {
        id: 2,
        title: "Sayt ishlab chiqish qancha turadi va narxi nimalarga bog'liq?",
        image: "https://xrn-a2s-98a-sa7.esys.pro/storage/blogs/main-images/1/Z8x2Q2tC1jwsJs4Gc8vWiJMtm9ORLgPWqxJnrlDS.webp",
        date: "2025-08-11",
        tech: ["Разработка сайта", "CRM система", "Оптимизация бюджета", "Веб-разработка"],
      },
    ];
  } finally {
    loading.value = false;
  }
};

// Watch for locale changes and refetch data
watch(locale, () => {
  fetchBlogs();
}, { immediate: false });

// Initial data fetch
onMounted(() => {
  fetchBlogs();
});

const openBlog = (card) => {
  localStorage.setItem("selectedBlog", JSON.stringify(card));
  router.push(localePath("/blog-view"));
};
</script>

<template>
  <div class="mt-[120px] max-w-7xl mx-auto space-y-16 mb-[120px]">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1aab9a]"></div>
      <span class="ml-4 text-lg text-gray-600">{{ t('api.loading_blogs') }}</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-16">
      <div class="text-red-500 text-lg mb-4">{{ error }}</div>
      <button 
        @click="fetchBlogs" 
        class="px-6 py-2 bg-[#1aab9a] text-white rounded-lg hover:bg-[#16967d] transition duration-300"
      >
        {{ t('api.retry') }}
      </button>
    </div>

    <!-- Blog Content -->
    <div v-else-if="blogs.length > 0">
      <div
        v-for="(card, index) in blogs"
        :key="card.id || index"
        @click="openBlog(card)"
        class="group flex flex-col md:flex-row items-center justify-between gap-8 p-6 rounded-2xl bg-white transform transition duration-300 hover:scale-[1.02] cursor-pointer"
      >
        <div class="flex-1">
          <h2
            class="text-3xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-[#1aab9a]"
          >
            {{ card.title }}
          </h2>
          <p class="mt-5 text-sm text-gray-400">{{ card.published_at }}</p>
          
          <!-- Tech tags -->
          <div v-if="card.tech && card.tech.length > 0" class="flex flex-wrap gap-2 mt-4">
            <span
              v-for="(tech, i) in card.tech"
              :key="i"
              class="inline-block px-3 py-1 text-xs font-medium text-[#1aab9a] bg-[#1aab9a]/10 rounded-full"
            >
              {{ tech }}
            </span>
          </div>
        </div>
        <div class="flex-shrink-0 w-full md:w-[420px]">
          <img
            :src="card.image || card.featured_image || '/placeholder-blog.jpg'"
            :alt="card.title"
            class="rounded-xl w-full h-[260px] object-cover transition duration-300 filter opacity-50 group-hover:opacity-100"
            @error="$event.target.src = '/placeholder-blog.jpg'"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <div class="text-gray-500 text-lg">{{ t('api.no_blogs') }}</div>
    </div>
  </div>
</template>
