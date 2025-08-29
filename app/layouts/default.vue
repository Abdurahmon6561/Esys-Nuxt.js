<!-- in this code when user cliking to "Проекты" this have to scroll down smooth to the projects section -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { gsap } from "gsap/all";

const open = ref(false);
const menuOpen = ref(false);

const locale = ref("ru");
const dropdownRef = ref(null);

const languages = [
  { code: "ru", label: "RU", flag: "/images/ru.webp" },
  { code: "en", label: "EN", flag: "/images/en.webp" },
  { code: "uz", label: "UZ", flag: "/images/uz.webp" },
];

const switchLocale = (code) => {
  locale.value = code;
  localStorage.setItem("locale", code);
  open.value = false;
  menuOpen.value = false;
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
  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 2,
    effects: true,
  });

  smoother.effects("header", { speed: 1, lag: 0 });
});

onMounted(() => {
  gsap.from("header", {
    y: -100,
    opacity: 0,
    duration: 2,
  });
});
</script>

<template>
  <div id="smooth-wrapper">
    <div id="smooth-content" class="flex flex-col min-h-screen bg-white p-3 md:p-6">
      <div class="fixed w-full top-0 left-0 right-0">
        <header class="fixed top-0 left-0 w-full z-50 bg-transparent p-6 rounded-xl">
          <div class="flex justify-between items-center px-6 py-4 rounded-t-xl">
            <!-- Logo -->
            <a href="/">
              <img src="/images/logo.webp" alt="logo" class="h-8" />
            </a>

            <!-- Desktop Nav -->
            <nav>
              <ul class="md:flex hidden gap-8 text-white font-medium">
                <li>
                  <NuxtLink to="#"
                    class="relative after:content-[''] pb-1 after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full">
                    Компания
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="#" @click.prevent="scrollToSection('projects'); menuOpen = false"
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

            <!-- Desktop Locale Dropdown -->
            <div class="relative hidden md:block" style="z-index: 9999;" ref="dropdownRef">
              <button @click.stop="open = !open"
                class="text-white flex items-center justify-center gap-1 border-2 border-[#8198a6] p-2 rounded-full cursor-pointer h-[35px] w-[82px]">
                <img :src="languages.find(l => l.code === locale)?.flag" alt="locale" class="w-7" />
                <span class="ml-1 uppercase text-[14px]">{{ locale }}</span>
                <img src="/images/arrow-down.webp" alt="arrow" :class="{ 'rotate-180': open }" class="w-4" />
              </button>

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

            <!-- Hamburger -->
            <button
              class="md:hidden flex flex-col gap-1 z-50 text-white text-[24px] hover:scale-105  transition-all duration-300"
              @click="menuOpen = !menuOpen">
              <FontAwesomeIcon :icon="['fas', 'bars']" />
            </button>
          </div>
        </header>
      </div>

      <!-- Mobile Side -->
      <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0" leave-active-class="transition-transform duration-300 ease-in"
        leave-from-class="translate-x-0" leave-to-class="-translate-x-full">
        <div v-if="menuOpen" class="fixed inset-0 bg-white text-black z-40 flex flex-col p-8">
          <!-- Close button -->
          <button class="self-end mb-2 mt-[12px] mr-[12px]" @click="menuOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Nav -->
          <nav class="flex flex-col gap-3 text-lg font-semibold">
            <NuxtLink to="#" @click="menuOpen = false" class="text-sm font-normal">Компания</NuxtLink>
            <NuxtLink to="#" @click="menuOpen = false" class="text-sm font-normal">Проекты</NuxtLink>
            <NuxtLink to="#" @click="menuOpen = false" class="text-sm font-normal">Блог</NuxtLink>
          </nav>

          <!-- Locale -->
          <div class="mt-10 border-t pt-4">
            <p class="mb-2 text-sm font-semibold">Язык</p>
            <ul class="flex gap-2" ref="dropdownRef">
              <li v-for="lang in languages" :key="lang.code" @click="switchLocale(lang.code)"
                class="flex items-center border rounded-lg gap-2 px-2 py-2 hover:bg-gray-100 cursor-pointer">
                <img :src="lang.flag" alt="" class="w-7" />
                <span class="text-[14px]">{{ lang.label }}</span>
              </li>
            </ul>
          </div>
        </div>
      </Transition>

      <main>
        <slot />
      </main>

      <footer>
        <div class="p-10 bg-[#e8e8e8]">
          <div class="bg-white md:p-20 p-8 rounded-xl">
            <div class="md:flex justify-between items-center gap-4">
              <a href="/">
                <img src="/images/footer-logo.svg" alt="logo" />
              </a>

              <div class="md:flex grid grid-cols-1 md:gap-5 mt-5 md:mt-0 gap-3">
                <a href="/" class="relative text-[18px] pb-1 hover:after:w-full after:content-['']
                  after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black
                  after:transition-all after:duration-300 after:-translate-x-1/2">Главная</a>
                <a href="/" class="relative text-[18px] pb-1 hover:after:w-full after:content-['']
                  after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black
                  after:transition-all after:duration-300 after:-translate-x-1/2">Компания</a>
                <a href="/" class="relative text-[18px] pb-1 hover:after:w-full after:content-['']
                  after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black
                  after:transition-all after:duration-300 after:-translate-x-1/2">Проекты</a>
                <a href="/" class="relative text-[18px] pb-1 hover:after:w-full after:content-['']
                  after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black
                  after:transition-all after:duration-300 after:-translate-x-1/2">Блог</a>
                <a href="/" class="relative text-[18px] pb-1 hover:after:w-full after:content-['']
                  after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black
                  after:transition-all after:duration-300 after:-translate-x-1/2">Связь</a>
              </div>

              <div class="flex gap-2 mt-5 md:mt-0">
                <!-- Facebook -->
                <a href="/" target="_blank"
                  class="group p-4 rounded-full border-2 border-[#e0e0e0] transition-all duration-300 hover:bg-[#0866ff] hover:border-[#0866ff]">
                  <img src="/images/facebok.svg" alt="facebook"
                    class="h-4 w-4 transition-all duration-300 group-hover:invert group-hover:scale-125" />
                </a>

                <!-- Instagram -->
                <a href="/" target="_blank"
                  class="group p-4 rounded-full border-2 border-[#e0e0e0] transition-all duration-300 hover:border-[#d62976] hover:bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]">
                  <img src="/images/instagram.svg" alt="instagram"
                    class="h-4 w-4 transition-all duration-300 group-hover:invert group-hover:scale-125" />
                </a>

                <!-- Telegram -->
                <a href="/" target="_blank"
                  class="group p-4 rounded-full border-2 border-[#e0e0e0] transition-all duration-300 hover:bg-[#27a8e8] hover:border-[#27a8e8]">
                  <img src="/images/telegram.svg" alt="telegram"
                    class="h-4 w-4 transition-all duration-300 group-hover:invert group-hover:scale-125" />
                </a>
              </div>

            </div>
            <div class="mt-20">
              <hr />
              <div class="flex flex-col md:flex-row justify-between mt-6 items-center">
                <p class="text-[14px] text-[#080808]">
                  2025 © Evolution Systems — Все права защищены.
                </p>
                <p class="font-semibold text-[14px] text-[#080808] flex items-center gap-1 text-center">
                  Design by <span class="opacity-50 font-normal">Crave Studio</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
