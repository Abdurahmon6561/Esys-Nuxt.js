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
  <div
    v-if="project"
    class="mb-[40px] mt-[60px] md:mb-[80px] md:mt-[80px] px-4"
  >
    <div
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
        <p
          v-for="(project, i) in project.services"
          :key="i"
          class="inline-block px-3 py-1 text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full"
        >
          {{ project }}
        </p>

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
