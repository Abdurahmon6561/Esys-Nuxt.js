<script setup></script>

<template>
  <div class="container mx-auto mt-[80px] mb-[80px]">
    <div>
      <div class="flex items-center">
        <h3
          class="text-[14px] font-medium text-[#080808] border-2 rounded-full p-2 border-[#EEE]"
        >
          В чем мы сильны
        </h3>
      </div>
      <h1 class="md:text-[60px] text-[40px] text-[#080808] font-medium mt-[19px]">
        Услуги, которые <br />
        приносят пользу
      </h1>
    </div>
    <div class="grid md:grid-cols-3 bg-[#ededed] p-8 rounded-xl mt-[48px]">
      <!-- Card -->
      <div class="md:p-10 p-2 bg-white md:rounded-l-xl">
        <div>
          <h2 class="md:text-[24px] text-[18px] text-[#080808] font-medium">
            Веб-cайты
          </h2>
          <p class="text-[16px] text-[#080808] w-[288px] mt-2">
            Создаем сайты, которые работают для вас: от лендингов до
            интернет-магазинов. Современный дизайн, удобство и функционал — всё
            под ключ
          </p>
        </div>

        <!-- заменили div + button на один button -->
        <button
          class="w-full bg-white rounded-xl md:p-4 p-2 flex items-center justify-between mt-[50px] border-2 border-[#e0e0e0] hover:bg-gray-100 transition"
        >
          <span class="text-[16px] font-medium">Заказать</span>
          <span
            class="flex items-center justify-center max-h-[50px] w-10 h-10 rounded-xl border-2 border-[#e0e0e0] hover:bg-gray-200 transition"
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
          </span>
        </button>
      </div>

      <!-- Card -->
      <div
        class="md:p-10 p-2 bg-white flex flex-col md:border-l-2 md:border-r-2 border-b-2 border-t-2 md:border-t-0 md:border-b-0"
      >
        <div>
          <h2 class="md:text-[24px] text-[18px] text-[#080808] font-medium">
            Мобильные приложения
          </h2>
          <p class="text-[16px] text-[#080808] w-[288px] mt-2">
            Разрабатываем мобильные приложения для iOS и Android: удобные,
            быстрые и функциональные. Всё для вашего бизнеса под ключ
          </p>
        </div>

        <button
          class="w-full bg-white rounded-xl md:p-4 p-2 flex items-center justify-between border-2 border-[#e0e0e0] hover:bg-gray-100 transition mt-auto"
        >
          <span class="text-[16px] font-medium">Заказать</span>
          <span
            class="flex items-center justify-center max-h-[50px] w-10 h-10 rounded-xl border-2 border-[#e0e0e0] hover:bg-gray-200 transition"
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
          </span>
        </button>
      </div>

      <!-- Card -->
      <div class="md:p-10 p-2 bg-white md:rounded-r-xl">
        <div>
          <h2 class="md:text-[24px] text-[18px] text-[#080808] font-medium">
            CRM Системы
          </h2>
          <p class="text-[16px] text-[#080808] w-[288px] mt-2">
            Создаем CRM-системы для управления бизнесом: автоматизация,
            аналитика и контроль. Всё для удобства вашей команды и роста
            компании
          </p>
        </div>
        <button
          class="w-full bg-white rounded-xl md:p-4 p-2 flex items-center justify-between mt-[50px] border-2 border-[#e0e0e0] hover:bg-gray-100 transition"
        >
          <span class="text-[16px] font-medium">Заказать</span>
          <span
            class="flex items-center justify-center max-h-[50px] w-10 h-10 rounded-xl border-2 border-[#e0e0e0] hover:bg-gray-200 transition"
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
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
