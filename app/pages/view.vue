<script setup>
import { ref, onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const project = ref(null);

onMounted(() => {
  const stored = localStorage.getItem("selectedProject");
  if (stored) {
    project.value = JSON.parse(stored);
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
  <div v-if="project" class="mb-[80px] mt-[80px]">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden">
      
      <!-- Title -->
      <div class="px-6 pt-6">
        <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          {{ project.title }}
        </h1>
      </div>

      <!-- Image -->
      <div class="mt-4">
        <img
          :src="project.image"
          alt="Project Image"
          class="w-full h-[420px] object-cover rounded-lg"
        />
      </div>

      <!-- Content -->
      <div class="px-6 py-8 space-y-6">
        <!-- Tech -->
        <p class="inline-block px-4 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full">
          {{ project.tech }}
        </p>

        <!-- Description -->
        <p class="text-lg text-gray-700 leading-relaxed">
          Bang & Olufsen partnered with HELLO MONDAY/DEPT® to create a web app
          that gives every user a uniquely sensory experience. ‘See Yourself in
          Sound’ is designed to generate a vibrant, one-of-a-kind avatar for every
          visitor. Each character is crafted in real-time by analyzing your
          Spotify sound profile and aligning your overall mood and energy levels
          to all the aspects of a 3D character: texture, shapes, body movement and
          more. Visitors without Spotify can also generate their avatar via a fun,
          emoji-driven process. After your 3D character is generated, it can be
          shared with the world via link or a video that’s created just for you.
        </p>
      </div>
    </div>
  </div>
</template>
