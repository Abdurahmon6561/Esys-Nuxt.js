<script setup>
import { ref, onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useRoute } from "vue-router";
import { useApiService } from "~/composables/useApiService.js";
import { useI18n } from "vue-i18n";

gsap.registerPlugin(ScrollToPlugin);

const route = useRoute();
const { blogApi } = useApiService();
const { t } = useI18n();
const blog = ref(null);
const loading = ref(false);
const error = ref(null);

// Default content fallback
const defaultContent = "Bang & Olufsen partnered with HELLO MONDAY/DEPT® to create a web app that gives every user a uniquely sensory experience. 'See Yourself in Sound' is designed to generate a vibrant, one-of-a-kind avatar for every visitor. Each character is crafted in real-time by analyzing your Spotify sound profile and aligning your overall mood and energy levels to all the aspects of a 3D character: texture, shapes, body movement and more. Visitors without Spotify can also generate their avatar via a fun, emoji-driven process. After your 3D character is generated, it can be shared with the world via link or a video that's created just for you.";

// Fetch blog from API if ID is provided in route
const fetchBlog = async (id) => {
  try {
    loading.value = true;
    error.value = null;
    const response = await blogApi.getBlog(id);
    blog.value = response.data || response;
  } catch (err) {
    error.value = err.message || 'Failed to fetch blog';
    console.error('Error fetching blog:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Try to get blog ID from route params
  const blogId = route.params.id || route.query.id;
  
  if (blogId) {
    // Fetch from API
    fetchBlog(blogId);
  } else {
    // Fallback to localStorage
    const stored = localStorage.getItem("selectedBlog");
    if (stored) {
      blog.value = JSON.parse(stored);
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
          <span v-if="blog.date || blog.created_at">
            {{ blog.date || blog.created_at }}
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
          :src="blog.image || blog.featured_image || '/placeholder-blog.jpg'"
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

        <!-- Description/Content -->
        <div
          class="text-base sm:text-lg text-gray-700 leading-relaxed text-justify md:text-left prose max-w-none"
          v-html="blog.content || blog.description || defaultContent"
        >
        </div>
        
        <!-- Fallback description if no content -->
        <p 
          v-if="!blog.content && !blog.description"
          class="text-base sm:text-lg text-gray-700 leading-relaxed text-justify md:text-left"
        >
          {{ defaultContent }}
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
