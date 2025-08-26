<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { gsap } from "gsap/all"; 

const open = ref(false);
const locale = ref("ru");
const dropdownRef = ref(null);

const languages = [
  { code: "ru", label: "RU", flag: "/images/ru.png" },
  { code: "en", label: "EN", flag: "/images/en.png" },
  { code: "uz", label: "UZ", flag: "/images/uz.png" },
];

const switchLocale = (code) => {
  locale.value = code;
  localStorage.setItem("locale", code);
  open.value = false;
};

onMounted(() => {
  const saved = localStorage.getItem("locale");
  if (saved) locale.value = saved;

  const handleClickOutside = (e) => {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
      open.value = false;
    }
  };
  window.addEventListener("click", handleClickOutside);

  onBeforeUnmount(() => {
    window.removeEventListener("click", handleClickOutside);
  });
});

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollSmoother);

onMounted(() => {
  ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 3,
    effects: true,
  });
});

onMounted(() => {
  gsap.from("header", {
    y: -100,
    opacity: 0,
    duration: 1,
  });
});
</script>

<template>
  <div id="smooth-wrapper">
    <div id="smooth-content" class="flex flex-col min-h-screen bg-white p-3 md:p-6">
      <div class="fixed w-full top-0 left-0 right-0">
        <header class="absolute top-0 left-0 w-full z-50 bg-transparent p-6 rounded-xl">
          <div class="flex justify-between items-center px-6 py-4 rounded-t-xl">
            <a href="/">
              <img src="/images/logo.svg" alt="logo" class="h-8" />
            </a>

            <!-- Nav Links -->
            <nav>
              <ul class="md:flex hidden gap-8 text-white font-medium">
                <li>
                  <NuxtLink to="#"
                    class="relative after:content-[''] pb-1 after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full">
                    Компания
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="#"
                    class="relative after:content-[''] pb-1 after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full">
                    Проекты
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="#"
                    class="relative after:content-[''] pb-1 after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full">
                    Блог
                  </NuxtLink>
                </li>
              </ul>
            </nav>

            <!-- Locale Dropdown -->
            <div class="relative" style="z-index: 9999;" ref="dropdownRef">
              <button @click.stop="open = !open"
                class="text-white flex items-center justify-center gap-1 border-2 border-[#8198a6] p-2 rounded-full cursor-pointer h-[35px] w-[82px]">
                <img :src="languages.find(l => l.code === locale)?.flag" alt="locale" class="w-7" />
                <span class="ml-1 uppercase text-[14px]">
                  {{ locale }}
                </span>
                <img src="/images/arrow-down.svg" alt="arrow" :class="{ 'rotate-180': open }" />
              </button>

              <!-- Smooth Transition -->
              <Transition enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95 -translate-y-2"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-2">
                <div v-if="open"
                  class="absolute right-0 mt-2 w-auto bg-white shadow-lg rounded-lg overflow-hidden z-50">
                  <ul>
                    <li v-for="lang in languages" :key="lang.code" @click="switchLocale(lang.code)"
                      class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <img :src="lang.flag" alt="" class="w-7" />
                      <span class="text-[14px]">{{ lang.label }}</span>
                    </li>
                  </ul>
                </div>
              </Transition>
            </div>

            <!-- Mobile Menu -->
            <div class="md:hidden">
              <button @click="open = !open" class="text-white">
                <!-- <img src="/images/hamburger.svg" alt="menu" /> -->
              </button>
            </div>

          </div>
        </header>
      </div>

      <main>
        <slot />
      </main>

      <!-- Footer -->
      <footer>
        <div class="p-10 bg-[#e8e8e8]">
          <div class="bg-white md:p-20 p-8 rounded-xl">
            <div class="md:flex justify-between items-center gap-4">
              <a href="/">
                <img src="/images/footer-logo.svg" alt="logo" />
              </a>

              <div class="md:flex grid grid-cols-1 md:gap-5 mt-5 md:mt-0 gap-3">
                <a href="/"
                  class="relative text-[18px] pb-1 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full">
                  Главная
                </a>
                <a href="/"
                  class="relative text-[18px] pb-1 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full">
                  Компания
                </a>
                <a href="/"
                  class="relative text-[18px] pb-1 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full">
                  Проекты
                </a>
                <a href="/"
                  class="relative text-[18px] pb-1 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full">
                  Блог
                </a>
                <a href="/"
                  class="relative text-[18px] pb-1 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full">
                  Связь
                </a>
              </div>

              <div class="flex gap-2 mt-5 md:mt-0">
                <a href="/"
                  class="p-4 rounded-full border-2 border-[#e0e0e0] hover:bg-[#e0e0e0] transition-transform duration-200 ease-out"
                  target="_blank"><img src="/images/facebok.svg" alt="facebok" class="h-4 w-4" /></a>
                <a href="/"
                  class="p-4 rounded-full border-2 border-[#e0e0e0] hover:bg-[#e0e0e0] transition-transform duration-200 ease-out"
                  target="_blank"><img src="/images/instagram.svg" alt="instagram" class="h-4 w-4" /></a>
                <a href="/"
                  class="p-4 rounded-full border-2 border-[#e0e0e0] hover:bg-[#e0e0e0] transition-transform duration-200 ease-out"
                  target="_blank"><img src="/images/telegram.svg" alt="telegram" class="h-4 w-4" /></a>
              </div>
            </div>
            <div class="mt-20">
              <hr />
              <p class="text-[14px] text-[#080808] mt-5">
                2025 © Evolution Systems — Все права защищены.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
