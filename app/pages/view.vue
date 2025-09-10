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
  <div v-if="project" class="mb-[80px]" ref="heroSection" id="smooth-wrapper">
    <section
      class="md:min-h-[calc(100vh-3rem)] min-h-[calc(100vh-1.5rem)] bg-gray-100 flex items-center justify-center rounded-t-lg bg-cover bg-center bg-no-repeat"
      :style="`background-image: url('${project.image}')`"
    ></section>
    <div
      class="mx-auto bg-white rounded-b-lg shadow text-center relative z-10 flex justify-center items-center hover:bg-gray-100 transition-transform duration-300"
    >
    <a :href="project.link" target="_blank" class="w-full h-full md:p-12 p-4">
        <button class="w-full h-full">
            <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                {{ project.title }}
            </h1>
            <p class="text-lg md:text-xl text-gray-600 leading-relaxed">
                {{ project.tech }}
            </p>
        </button>
    </a>
</div>
  </div>
</template>
