<script setup>
import { ref, onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const blog = ref(null);

onMounted(() => {
  const stored = localStorage.getItem("selectedBlog");
  if (stored) {
    blog.value = JSON.parse(stored);
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
  <div v-if="blog" class="mb-[40px] mt-[60px] md:mb-[80px] md:mt-[80px] px-4">
    <div
      class="w-full max-w-4xl mx-auto bg-white rounded-xl md:rounded-2xl overflow-hidden"
    >
      <!-- Title -->
      <div class="px-4 md:px-6 pt-4 md:pt-6">
        <h1
          class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight text-center md:text-left"
        >
          {{ blog.title }}
        </h1>
      </div>

      <!-- Image -->
      <div class="mt-4">
        <img
          :src="blog.image"
          alt="blog Image"
          class="w-full h-[220px] sm:h-[300px] md:h-[420px] object-cover rounded-lg"
        />
      </div>

      <!-- Content -->
      <div class="px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
        <!-- Tech -->
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(item, i) in blog.tech"
            :key="i"
            class="inline-block px-3 py-1 text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full"
          >
            {{ item }}
          </span>
        </div>

        <!-- Description -->
        <p
          class="text-base sm:text-lg text-gray-700 leading-relaxed text-justify md:text-left"
        >
          Bang & Olufsen partnered with HELLO MONDAY/DEPT® to create a web app
          that gives every user a uniquely sensory experience. ‘See Yourself in
          Sound’ is designed to generate a vibrant, one-of-a-kind avatar for
          every visitor. Each character is crafted in real-time by analyzing
          your Spotify sound profile and aligning your overall mood and energy
          levels to all the aspects of a 3D character: texture, shapes, body
          movement and more. Visitors without Spotify can also generate their
          avatar via a fun, emoji-driven process. After your 3D character is
          generated, it can be shared with the world via link or a video that’s
          created just for you.
        </p>
      </div>
    </div>
  </div>
</template>
