<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";

const cardsRef = ref([]);

const cards = [
  {
    image: "/images/man.jpg",
    title: "Wonder Comfort",
    tech: "Laravel, PHP, JavaScript, Figma, Vue.js",
    tags: ["Веб-сайты"],
  },
  {
    image: "/images/soundBar.jpg",
    title: "Sound Bar",
    tech: "Laravel, JavaScript, Figma, Flutter, Vue.js",
    tags: ["Веб-сайты", "Мобильные приложения"],
  },
  {
    image: "/images/car.jpg",
    title: "Автосалон Asacar",
    tech: "Laravel, PHP, JavaScript, Figma, Vue.js",
    tags: ["Веб-сайты"],
  },
  {
    image: "/images/bbd.jpg",
    title: "BBD",
    tech: "Laravel, PHP, MySQL, JavaScript",
    tags: ["Веб-сайты"],
  },
];


onMounted(() => {
  gsap.to(".project-cards", {
    duration: 3,
    delay: 1,
  })
})


onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("opacity-0");
          entry.target.classList.remove("translate-x-[-100px]");
          entry.target.classList.remove("translate-x-[100px]");
          entry.target.classList.add("opacity-100", "translate-x-0");
        }
      });
    },
    { threshold: 0.2 }
  );

  cardsRef.value.forEach((el) => observer.observe(el));
});
</script>

<template>
  <div class="container mx-auto mb-[200px] mt-[80px]">
    <div>
      <div class="flex justify-center items-center">
        <h3
          class="text-sm text-[#080808] border-2 rounded-full p-2 border-[#EEE]"
        >
          Наши проекты
        </h3>
      </div>
      <div>
        <h2 class="text-5xl text-[#080808] font-medium text-center mt-5">
          Создаём цифровые продукты, которые <br />
          выделяют вас на рынке и приводят клиентов
        </h2>
        <div class="flex flex-wrap justify-center gap-[32px] mt-12">
          <!-- Cards -->
          <div
            v-for="(card, i) in cards"
            :key="i"
            ref="cardsRef"
            :class="[
              'relative rounded-xl overflow-hidden shadow-xl md:h-[501px] md:w-[656px] hover:scale-105 duration-700 opacity-0 transform transition-all project-cards',
              i % 2 === 0 ? 'translate-x-[-100px]' : 'translate-x-[100px]',
            ]"
          >
            <img
              :src="card.image"
              alt="Project"
              class="w-full h-full object-cover"
            />

            <!-- Category -->
            <div class="absolute top-3 left-3 flex gap-1">
              <span
                v-for="(tag, t) in card.tags"
                :key="t"
                class="bg-white text-gray-800 text-sm px-3 py-1 rounded-full shadow"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Bottom -->
            <div
              class="absolute bottom-6 left-[20px] right-[20px] bg-white rounded-xl shadow md:p-4 p-2 md:w-[608px] md:h-[89px] flex items-center justify-between"
            >
              <div>
                <h3 class="md:text-[24px] font-medium">{{ card.title }}</h3>
                <p class="text-sm text-gray-600">
                  {{ card.tech }}
                </p>
              </div>
              <button
                class="flex items-center justify-center w-12 h-12 rounded-xl border-2 border-gray-100 hover:bg-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-center items-center mt-12">
        <button
          class="px-5 hover:bg-[#EEE] text-[#080808] border-2 rounded-full p-2 border-[#EEE] font-medium"
        >
          Больше проектов
        </button>
      </div>
    </div>
  </div>
</template>
