<script setup>
import { ref } from "vue";

const testimonials = ref([
    {
        id: 1,
        name: "Якобов Мунир Муродович",
        role: "Portfolio Investments",
        text: `От имени нашей компании Portfolio Investments хотим выразить благодарность команде компании ESYS, разработавшей наш замечательный веб-сайт. 
    Они продемонстрировали высокий профессионализм и внимание к деталям на каждом этапе создания. 
    Благодаря их креативному подходу и глубокому пониманию наших нужд, мы получили современный, функциональный и привлекательный веб-сайт, который идеально отражает нашу компанию и ее ценности. 
    Работать с ними было легко и приятно, а результат превзошел все ожидания. Рекомендуем их как надежного партнера для веб-разработки!`,
        avatar: "/images/avatar.jpg",
    },
    {
        id: 2,
        name: "Анна Смирнова",
        role: "Tech Solutions",
        text: `Команда ESYS помогла нам создать интуитивный и современный веб-портал. 
    Они всегда были на связи и предлагали отличные решения для каждой задачи.`,
        avatar: "data:image/jpeg;base64,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",
    },
]);

const current = ref(0);

const prev = () => {
    current.value = (current.value - 1 + testimonials.value.length) % testimonials.value.length;
};

const next = () => {
    current.value = (current.value + 1) % testimonials.value.length;
};
</script>

<template>
<div class="p-6 bg-[#ededed] rounded-xl">
        <div class="flex items-center justify-center min-h-screen bg-cover bg-center rounded-xl"
        style="background-image: url('/images/bg-avatar.jpg')">
        <div class="md:w-[576px] p-8 md:p-0">
            <div class="bg-white rounded-2xl shadow-md p-8 text-center relative">
                <div class="flex justify-center -mt-20 mb-4">
                    <img :src="testimonials[current].avatar" alt="avatar"
                        class="w-24 h-24 rounded-xl object-cover shadow-md" />
                </div>

                <p class="text-gray-700 text-sm leading-relaxed">
                    {{ testimonials[current].text }}
                </p>

                <!-- Name + Role -->
                <div class="mt-6">
                    <h3 class="font-semibold text-gray-900 text-[18px]">
                        {{ testimonials[current].name }}
                    </h3>
                    <p class="text-[#080808] text-sm">
                        {{ testimonials[current].role }}
                    </p>
                </div>

                <!-- Arrows-->
                <div class="flex justify-between mt-2" v-if="testimonials.length > 1">
                    <button @click="prev"
                        class="flex items-center justify-center w-12 h-12 rounded-xl border-2 border-gray-100 hover:bg-gray-200 rotate-180">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <button @click="next"
                        class="flex items-center justify-center w-12 h-12 rounded-xl border-2 border-gray-100 hover:bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

        </div>
    </div>
</div>
</template>
