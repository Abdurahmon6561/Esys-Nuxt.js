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
    blogs.value = response.data || response;

  } catch (err) {
    console.error("Error fetching blogs:", err);
    error.value = t("api.fetch_error");
    blogs.value = []; 
  } finally {
    loading.value = false;
  }
};

watch(locale, () => {
  fetchBlogs();
});

onMounted(() => {
  fetchBlogs();
});

const openBlog = (card) => {
  const alias = card.alias || card.slug || card.id;
  router.push(localePath(`/blog-view?alias=${alias}`));
};
</script>

<template>
  <div class="mt-[120px] max-w-7xl mx-auto space-y-16 mb-[120px]">

    <!-- Loading Spinner -->
    <div v-if="loading" class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1aab9a]"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-16 border-2 rounded-md">
      <p class="text-red-500 text-lg font-medium">
        {{ error }}
      </p>
    </div>

    <!-- Blog List -->
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

          <p class="mt-5 text-sm text-gray-400">
            {{ card.published_at }}
          </p>

          <div v-if="card.tech && card.tech.length" class="flex flex-wrap gap-2 mt-4">
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

  </div>
</template>
