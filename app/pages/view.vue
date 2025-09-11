<script setup>
import { ref, onMounted } from "vue";

const project = ref(null);

onMounted(() => {
  const stored = localStorage.getItem("selectedProject");
  if (stored) {
    project.value = JSON.parse(stored);
  }
});
</script>

<template>
  <div v-if="project" class="mb-[80px]">
    <section
      ref="heroSection"
      id="smooth-wrapper"
      class="md:min-h-[calc(100vh-6rem)] min-h-[calc(100vh-1.5rem)] bg-gray-100 flex items-center justify-center rounded-t-lg bg-cover bg-center bg-no-repeat"
      :style="`background-image: url('${project.image}')`"
    ></section>

    <!-- Project Header -->
    <div class="mx-auto bg-white border-b">
      <a  class="block md:px-10 p-4 cursor-default">
        <div class="flex justify-between items-center">
          <h1 class="text-xl md:text-2xl font-bold text-gray-900">
            {{ project.title }}
          </h1>
          <p class="text-sm md:text-base text-gray-600 font-medium">
            {{ project.tech }}
          </p>
        </div>
      </a>
    </div>

    <!-- Content Section -->
    <div class="grid md:grid-cols-2 gap-12 md:p-12 p-4 bg-white">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
        {{ project.title }}
      </h2>

      <p class="text-base md:text-lg text-gray-700 leading-relaxed">
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
</template>
