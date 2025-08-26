<script setup>
import { ref, onMounted } from "vue";

const cardsRef = ref([]);

const cards = [
    {
        image: "/images/trend.jpg",
        title: "Разбираем тренды, технологии и деньги",
    },
    {
        image: "/images/insayt.jpg",
        title: "Инсайты, которые помогают бизнесу расти",
    },
    {
        image: "/images/digital.jpg",
        title: "О будущем digital — просто и по делу",
    },
];

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
    <div class="p-10 bg-[#e8e8e8]">
        <div class="container mx-auto">
            <div class="flex items-center">
                <h3 class="text-sm text-[#080808] border-2 px-4 rounded-full p-2 border-[#EEE] bg-white">
                    Блог
                </h3>
            </div>
            <h1 class="md:text-[60px] text-[40px] text-[#080808] font-medium">Главное <br> о digital</h1>
            <div>
                <div class="grid md:grid-cols-3 gap-8 mt-12">
                    <!-- Cards -->
                    <div v-for="(card, i) in cards" :key="i" ref="cardsRef" :class="[
                        'relative rounded-xl overflow-hidden shadow-xl md:h-[290px] hover:scale-105 duration-700 opacity-0 transform transition-all',
                        i % 3 === 0 ? 'translate-x-[-100px]' :
                            i % 3 === 1 ? 'translate-y-[0px]' :
                                'translate-x-[100px]'
                    ]">

                        <img :src="card.image" alt="Project" class="w-full h-full object-cover" />

                        <!-- Category Badge -->
                        <div class="absolute top-3 left-3 flex gap-1">
                            <span v-for="(tag, t) in card.tags" :key="t"
                                class="bg-white text-gray-800 text-sm px-3 py-1 rounded-full shadow">
                                {{ tag }}
                            </span>
                        </div>

                        <!-- Bottom Box -->
                        <div
                            class="absolute bottom-3 left-3 max-h-[46px] right-3 bg-white rounded-[8px] shadow p-2 flex items-center justify-between">
                            <div>
                                <h3 class="text-[15.25px] font-medium">{{ card.title }}</h3>
                            </div>
                            <button class="flex items-center justify-center w-8 h-8">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
