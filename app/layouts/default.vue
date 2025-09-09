<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const open = ref(false);
const menuOpen = ref(false);
const locale = ref("ru");
const dropdownRef = ref(null);

const languages = [
  { label: "ru", label: "Ру" },
  { label: "uz", label: "Uz" },
  { label: "en", label: "En" },
];

const headerScrolled = ref(false);

onMounted(async () => {
  if (process.client) {
    const { gsap } = await import("gsap");
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");

    gsap.registerPlugin(ScrollTrigger);

    // Trigger when Hero is passed
    ScrollTrigger.create({
      trigger: ".hero-section",
      start: "bottom top", // when bottom of Hero hits top of viewport
      onEnter: () => (headerScrolled.value = true),
      onLeaveBack: () => (headerScrolled.value = false),
    });
  }
});

const switchLocale = (label) => {
  locale.value = label;
  if (process.client) {
    localStorage.setItem("locale", label);
  }
  open.value = false;
  menuOpen.value = false;
};

let smoother = null;
const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el && smoother) {
    smoother.scrollTo(el, true, "top top");
  }
};

onMounted(async () => {
  if (process.client) {
    // Initialize locale from localStorage
    const saved = localStorage.getItem("locale");
    if (saved) locale.value = saved;

    // Click outside handler for dropdown
    const handleClickOutside = (e) => {
      if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
        open.value = false;
      }
    };

    window.addEventListener("click", handleClickOutside);

    // Dynamic import GSAP and plugins
    const { gsap } = await import("gsap");
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    const { ScrollSmoother } = await import("gsap/ScrollSmoother");

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    gsap.registerPlugin(ScrollSmoother);

    // Initialize ScrollSmoother
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.5,
      effects: true,
    });

    smoother.effects("header", { speed: 1, lag: 0 });

    // Animate header on mount
    gsap.fromTo(
      "header",
      {
        y: -100,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
      }
    );
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener("click", handleClickOutside);

    if (smoother) {
      smoother.kill();
    }

    // Clean up ScrollTrigger instances
    if (window.ScrollTrigger) {
      window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    }
  }
});
</script>

<template>
  <div id="smooth-wrapper">
    <header
      :class="[
        'fixed top-0 left-0 w-full z-50 rounded-xl transition-all duration-300',
        headerScrolled
          ? 'bg-white backdrop-blur-md text-black shadow-lg p-2'
          : 'bg-transparent text-white py-7 px-6',
      ]"
    >
      <div class="flex justify-between items-center px-6 py-4 rounded-t-xl">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="transition-transform duration-300 hover:scale-105"
        >
          <img
            src="/images/logo.webp"
            alt="logo"
            class="h-8"
            :class="headerScrolled ? 'invert' : ''"
          />
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav>
          <ul class="md:flex hidden gap-8 font-medium">
            <li>
              <NuxtLink
                to="#"
                class="relative pb-1 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full"
                :class="
                  headerScrolled
                    ? 'text-black after:bg-black'
                    : 'text-white after:bg-white'
                "
              >
                Компания
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/project"
                class="relative pb-1 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full"
                :class="
                  headerScrolled
                    ? 'text-black after:bg-black'
                    : 'text-white after:bg-white'
                "
              >
                Проекты
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="#"
                class="relative pb-1 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full"
                :class="
                  headerScrolled
                    ? 'text-black after:bg-black'
                    : 'text-white after:bg-white'
                "
              >
                Блог
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Desktop Locale Dropdown -->
        <div
          class="relative hidden md:block"
          style="z-index: 9999"
          ref="dropdownRef"
        >
          <!-- Button -->
          <button
            @click.stop="open = !open"
            style="padding: 8px 10px"
            :class="[
              'flex items-center justify-center gap-1 border-2 rounded-full cursor-pointer transition-all duration-300',
              headerScrolled
                ? 'text-black border-gray-400 hover:border-black hover:bg-black/10'
                : 'text-white border-[#8198a6] hover:border-white hover:bg-white/10',
            ]"
          >
            <img
              src="/images/locale.svg"
              alt="locale"
              class="w-[22px]"
              :class="headerScrolled ? 'invert' : ''"
            />
            <span class="ml-1 text-[14px]">{{ locale }}</span>
            <img
              src="/images/arrow-down.webp"
              alt="arrow"
              :class="[{ 'rotate-180': open }, headerScrolled ? 'invert' : '']"
              class="w-4 transition-transform duration-200"
            />
          </button>

          <!-- Dropdown -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95 -translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-2"
          >
            <div
              v-if="open"
              :class="[
                'absolute right-0 mt-2 shadow-lg rounded-lg overflow-hidden z-50 w-full backdrop-blur-md',
                headerScrolled
                  ? 'bg-white/90 text-black'
                  : 'bg-white/30 text-white',
              ]"
            >
              <ul>
                <li
                  v-for="lang in languages.filter((l) => l.label !== locale)"
                  :key="lang.label"
                  @click="switchLocale(lang.label)"
                  :class="[
                    headerScrolled ? 'hover:bg-gray-200' : 'hover:bg-gray-400',
                  ]"
                  class="gap-2 px-4 py-2 font-medium cursor-pointer text-center transition-colors duration-200"
                >
                  <span class="text-[14px] text-center">{{ lang.label }}</span>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <div id="smooth-content" class="flex flex-col md:p-6 p-3 bg-white">
      <div class="w-full top-0 left-0 right-0"></div>

      <main class="min-h-screen">
        <slot />
      </main>

      <footer>
        <div class="px-10 py-10 bg-[#e8e8e8]">
          <div class="bg-white rounded-xl p-6">
            <div class="md:flex justify-center gap-1 mb-[40px] mt-[20px]">
              <button>
                <img
                  src="/images/women-footer.webp"
                  alt="women"
                  class="md:h-[233px] md:w-[260px] object-cover rounded-l-md"
                />
              </button>
              <button>
                <img
                  src="/images/insayt.jpg"
                  alt="insayt"
                  class="md:h-[233px] md:w-[260px] object-cover"
                />
              </button>
              <button>
                <img
                  src="/images/soundBar.webp"
                  alt="soundBar"
                  class="md:h-[233px] md:w-[260px] object-cover"
                />
              </button>
              <button>
                <img
                  src="/images/chair-footer.webp"
                  alt="chair-footer"
                  class="md:h-[233px] md:w-[260px] object-cover"
                />
              </button>
              <button>
                <img
                  src="/images/black_women-footer.webp"
                  alt="women"
                  class="md:h-[233px] md:w-[260px] object-cover rounded-r-md"
                />
              </button>
            </div>
            <hr />
            <div class="md:px-10 md:py-[100px] p-8 rounded-xl">
              <div class="md:flex justify-between items-center gap-4 mb-[90px]">
                <NuxtLink
                  to="/"
                  class="transition-transform duration-300 hover:scale-105"
                >
                  <img src="/images/footer-logo.svg" alt="logo" />
                </NuxtLink>

                <div
                  class="md:flex grid grid-cols-1 md:gap-5 mt-5 md:mt-0 gap-3"
                >
                  <NuxtLink
                    to="/"
                    class="relative text-[18px] pb-1 hover:after:w-full after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2"
                    >Главная</NuxtLink
                  >
                  <NuxtLink
                    to="#"
                    class="relative text-[18px] pb-1 hover:after:w-full after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2"
                    >Компания</NuxtLink
                  >
                  <NuxtLink
                    href="#"
                    @click.prevent="scrollToSection('projects')"
                    class="relative text-[18px] pb-1 hover:after:w-full after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2"
                  >
                    Проекты
                  </NuxtLink>
                  <NuxtLink
                    to="#"
                    class="relative text-[18px] pb-1 hover:after:w-full after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2"
                    >Блог</NuxtLink
                  >
                  <NuxtLink
                    to="#"
                    class="relative text-[18px] pb-1 hover:after:w-full after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2"
                    >Связь</NuxtLink
                  >
                </div>

                <div class="flex gap-2 mt-5 md:mt-0">
                  <!-- Facebook -->
                  <a
                    href="https://www.facebook.com/esys.uz"
                    target="_blank"
                    class="group w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#e0e0e0] transition-all duration-300 hover:bg-[#0866ff] hover:border-white"
                  >
                    <img
                      src="/images/facebok.svg"
                      alt="facebook"
                      class="h-4 w-4 transition-all duration-300 group-hover:invert group-hover:scale-125"
                    />
                  </a>

                  <!-- Instagram -->
                  <a
                    href="https://www.instagram.com/esysuz/"
                    target="_blank"
                    class="group w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#e0e0e0] transition-all duration-300 hover:border-white hover:bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]"
                  >
                    <img
                      src="/images/instagram.svg"
                      alt="instagram"
                      class="h-4 w-4 transition-all duration-300 group-hover:invert group-hover:scale-125"
                    />
                  </a>

                  <!-- Telegram -->
                  <a
                    href="https://t.me/esys_uz"
                    target="_blank"
                    class="group w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#e0e0e0] transition-all duration-300 hover:bg-[#27a8e8] hover:border-white"
                  >
                    <img
                      src="/images/telegram.svg"
                      alt="telegram"
                      class="h-4 w-4 transition-all duration-300 group-hover:invert group-hover:scale-125"
                    />
                  </a>
                </div>
              </div>
            </div>
            <div class="mt-[-100px]">
              <hr />
              <div
                class="flex flex-col md:flex-row justify-between mt-6 items-center"
              >
                <p class="text-[14px] text-[#080808]">
                  2025 © Evolution Systems — Все права защищены.
                </p>
                <p
                  class="font-semibold text-[14px] text-[#080808] flex items-center gap-1 text-center"
                >
                  Design by
                  <span class="opacity-50 font-normal">Crave Studio</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
