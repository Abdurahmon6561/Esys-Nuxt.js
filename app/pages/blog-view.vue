<script setup>
import { ref, onMounted, watch } from "vue";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useRoute } from "vue-router";
import { useApiService } from "~/composables/useApiService.js";
import { useI18n } from "vue-i18n";

gsap.registerPlugin(ScrollToPlugin);

const route = useRoute();
const { blogApi } = useApiService();
const { t, locale } = useI18n();
const blog = ref(null);
const loading = ref(false);
const error = ref(null);
const currentAlias = ref(null);

// Fetch blog from API using alias
const fetchBlogByAlias = async (alias) => {
  try {
    loading.value = true;
    error.value = null;
    const response = await blogApi.getBlogByAlias(alias);
    
    // Handle the nested response structure where data is under 'blog' key
    blog.value = response.blog || response.data || response;
  } catch (err) {
    error.value = err.message || 'Failed to fetch blog';
    console.error('Error fetching blog:', err);
    
    // Fallback to localStorage if API fails
    const stored = localStorage.getItem("selectedBlog");
    if (stored) {
      blog.value = JSON.parse(stored);
      error.value = null;
    }
  } finally {
    loading.value = false;
  }
};

// Fetch blog from API if ID is provided in route (legacy support)
const fetchBlog = async (id) => {
  try {
    loading.value = true;
    error.value = null;
    const response = await blogApi.getBlog(id);
    
    // Handle the nested response structure where data is under 'blog' key
    blog.value = response.blog || response.data || response;
  } catch (err) {
    error.value = err.message || 'Failed to fetch blog';
    console.error('Error fetching blog:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Priority 1: Try to get alias from route query
  const alias = route.query.alias;
  
  if (alias) {
    currentAlias.value = alias;
    // Fetch from API using alias
    fetchBlogByAlias(alias);
  } else {
    // Priority 2: Try to get blog ID from route params (legacy support)
    const blogId = route.params.id || route.query.id;
    
    if (blogId) {
      // Fetch from API using ID
      fetchBlog(blogId);
    } else {
      // Priority 3: Fallback to localStorage
      const stored = localStorage.getItem("selectedBlog");
      if (stored) {
        blog.value = JSON.parse(stored);
      }
    }
  }

  // Smooth scroll to top
  gsap.to(window, {
    scrollTo: 0,
    duration: 0.1,
    ease: "power2.inOut",
  });
});

// Watch for locale changes and refetch blog data
watch(locale, () => {
  if (currentAlias.value) {
    fetchBlogByAlias(currentAlias.value);
  }
}, { immediate: false });
</script>

<template>
  <div class="mb-[40px] mt-[60px] md:mb-[80px] md:mt-[80px] px-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1aab9a]"></div>
      <span class="ml-4 text-lg text-gray-600">{{ t('api.loading_blog') }}</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-16">
      <div class="text-red-500 text-lg mb-4">{{ error }}</div>
      <button 
        @click="$router.go(-1)" 
        class="px-6 py-2 bg-[#1aab9a] text-white rounded-lg hover:bg-[#16967d] transition duration-300"
      >
        {{ t('api.go_back') }}
      </button>
    </div>

    <!-- Blog Content -->
    <div
      v-else-if="blog"
      class="w-full max-w-4xl mx-auto bg-white rounded-xl md:rounded-2xl overflow-hidden"
    >
      <!-- Title -->
      <div class="px-4 md:px-6 pt-4 md:pt-6">
        <h1
          class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight text-center md:text-left"
        >
          {{ blog.title }}
        </h1>
        
        <!-- Date and additional info -->
        <div class="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
          <span v-if="blog.date || blog.created_at || blog.published_at">
            {{ blog.date || blog.created_at || blog.published_at }}
          </span>
          <span v-if="blog.author">
            By {{ blog.author }}
          </span>
          <span v-if="blog.read_time">
            {{ blog.read_time }} {{ t('api.read_time') }}
          </span>
        </div>
      </div>

      <!-- Image -->
      <div class="mt-4">
        <img
          :src="blog.image || blog.featured_image || blog.main_image || '/placeholder-blog.jpg'"
          :alt="blog.title"
          class="w-full h-[220px] sm:h-[300px] md:h-[420px] object-cover rounded-lg"
          @error="$event.target.src = '/placeholder-blog.jpg'"
        />
      </div>

      <!-- Content -->
      <div class="px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
        <!-- Tech tags -->
        <div v-if="blog.tech && blog.tech.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="(item, i) in blog.tech"
            :key="i"
            class="inline-block px-3 py-1 text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full"
          >
            {{ item }}
          </span>
        </div>

        <!-- Short Description -->
        <div
          v-if="blog.short_text"
          class="text-base sm:text-lg text-gray-600 leading-relaxed prose max-w-none"
          v-html="blog.short_text"
        >
        </div>

        <!-- Main Content -->
        <div
          class="text-base sm:text-lg text-gray-700 leading-relaxed text-justify md:text-left prose max-w-none"
          v-html="blog.text"
        >
        </div>
        
        <!-- Fallback description if no content -->
        <p 
          v-if="!blog.text"
          class="text-base sm:text-lg text-gray-700 leading-relaxed text-justify md:text-left"
        >
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Perferendis architecto sapiente facere quibusdam consequuntur! Dolorum nobis, quia nemo rem, autem quas obcaecati voluptatum sed mollitia aliquid illum eaque corporis sit!
        </p>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="text-center py-16">
      <div class="text-gray-500 text-lg mb-4">{{ t('api.blog_not_found') }}</div>
      <button 
        @click="$router.push('/blog')" 
        class="px-6 py-2 bg-[#1aab9a] text-white rounded-lg hover:bg-[#16967d] transition duration-300"
      >
        {{ t('api.back_to_blogs') }}
      </button>
    </div>
  </div>
</template>
