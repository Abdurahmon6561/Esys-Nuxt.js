<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { gsap } from "gsap";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const { locale, locales, setLocale, t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

const mobileMenuOpen = ref(false);
const open = ref(false);
const menuOpen = ref(false);
const dropdownRef = ref(null);
const cardsRef = ref([]);

const currentLocaleName = computed(() => {
  const lang = locales.value.find((l) => l.code === locale.value);
  return lang ? lang.name : locale.value;
});

const switchLocale = (code) => {
  setLocale(code);
  if (process.client) {
    const lang = locales.value.find((l) => l.code === code);
    if (lang) localStorage.setItem("locale", lang.code);
  }
  open.value = false;
  menuOpen.value = false;
};

let smoother = null;

// Two states instead of one
const hasScrolled = ref(false);
const passedHero = ref(false);

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    open.value = false;
  }
};

onMounted(async () => {
  if (process.client) {
    const saved = localStorage.getItem("locale");
    if (saved) setLocale(saved);

    window.addEventListener("click", handleClickOutside);

    const { gsap } = await import("gsap");
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    const { ScrollSmoother } = await import("gsap/ScrollSmoother");

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.5,
      effects: true,
    });

    smoother.effects("header", { speed: 1, lag: 0 });

    // Detect if user has started scrolling
    ScrollTrigger.create({
      start: 1,
      onEnter: () => (hasScrolled.value = true),
      onLeaveBack: () => (hasScrolled.value = false),
    });

    // Detect if hero section is fully passed
    ScrollTrigger.create({
      trigger: ".hero-section",
      start: "bottom top",
      onEnter: () => (passedHero.value = true),
      onLeaveBack: () => (passedHero.value = false),
    });

    gsap.fromTo(
      "header",
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" }
    );
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener("click", handleClickOutside);
    if (smoother) smoother.kill();
    if (window.ScrollTrigger) {
      window.ScrollTrigger.getAll().forEach((t) => t.kill());
    }
  }
});

onMounted(async () => {
  await nextTick();

  cardsRef.value.forEach((btn) => {
    const cursor = btn.querySelector(".card-cursor");

    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(cursor, {
        x,
        y,
        duration: 0.2,
        ease: "power3.out",
      });
    });

    btn.addEventListener("mouseenter", () => {
      btn.classList.add("brightness-75");
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.2 });
    });

    btn.addEventListener("mouseleave", () => {
      btn.classList.remove("brightness-75");
      gsap.to(cursor, { scale: 0.5, opacity: 0, duration: 0.2 });
    });
  });
});
</script>

<template>
  <div id="smooth-wrapper">
    <header
      :class="[
        'fixed top-0 left-0 w-full z-50 transition-all duration-300',
        route.path.includes('/view') || route.path.includes('/blog-view')
          ? 'backdrop-blur-md bg-white/70 text-white p-2'
          : passedHero
          ? 'bg-white/80 backdrop-blur-md text-black shadow-sm p-2'
          : hasScrolled
          ? 'bg-white/10 backdrop-blur-md text-white shadow-sm p-2'
          : 'bg-transparent text-white py-7 px-6',
      ]"
    >
      <div class="flex justify-between items-center px-6 py-4 rounded-t-xl">
        <!-- Logo -->
        <NuxtLink
          :to="localePath('/')"
          class="transition-transform duration-300 hover:scale-105 w-[94px]"
        >
          <div v-if="passedHero || route.path.includes('/view') || route.path.includes('/blog-view')">
            <img src="/images/footer-logo.svg" alt="logo" class="h-8" />
          </div>
          <div v-else>
            <img
              src="/images/logo.webp"
              alt="logo"
              class="h-8"
              :class="passedHero ? 'invert' : ''"
            />
          </div>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav>
          <ul class="md:flex hidden gap-8 font-medium">
            <li>
              <NuxtLink
                to="#"
                class="relative pb-1 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full"
                :class="
                  passedHero || route.path.includes('/view') || route.path.includes('/blog-view')
                    ? 'text-black after:bg-black'
                    : 'text-white after:bg-white'
                "
              >
                {{ t("header.company") }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/projects')"
                class="relative pb-1 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full"
                :class="[
                  passedHero || route.path.includes('/view') || route.path.includes('/blog-view')
                    ? 'text-black after:bg-black'
                    : 'text-white after:bg-white',
                  route.path.includes('/projects')
                    ? 'font-semibold after:w-full'
                    : '',
                ]"
              >
                {{ t("header.projects") }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="localePath('/blog')"
                class="relative pb-1 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full"
                :class="[
                  passedHero || route.path.includes('/view') || route.path.includes('/blog-view')
                    ? 'text-black after:bg-black'
                    : 'text-white after:bg-white',
                  route.path.includes('/blog')
                    ? 'font-semibold after:w-full'
                    : '',
                ]"
              >
                {{ t("header.blog") }}
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
              passedHero || route.path.includes('/view') || route.path.includes('/blog-view')
                ? 'text-black border-gray-400 hover:border-black hover:bg-black/10'
                : 'text-white border-[#8198a6] hover:border-white hover:bg-white/10',
            ]"
          >
            <img
              src="/images/locale.svg"
              alt="locale"
              class="w-[22px]"
              :class="[
                passedHero || route.path.includes('/view') || route.path.includes('/blog-view') ? 'invert' : '',
              ]"
            />
            <span class="ml-1 text-[14px]">{{ currentLocaleName }}</span>
            <img
              src="/images/arrow-down.webp"
              alt="arrow"
              :class="[
                { 'rotate-180': open },
                passedHero || route.path.includes('/view') || route.path.includes('/blog-view') ? 'invert' : '',
              ]"
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
                passedHero || route.path.includes('/view') || route.path.includes('/blog-view')
                  ? 'bg-white/90 text-black'
                  : 'bg-white/30 text-white',
              ]"
            >
              <ul>
                <li
                  v-for="lang in locales.filter(
                    (l) => l.name !== currentLocaleName
                  )"
                  :key="lang.code"
                  @click="switchLocale(lang.code)"
                  :class="[
                    passedHero || route.path.includes('/view') || route.path.includes('/blog-view')
                      ? 'hover:bg-gray-200'
                      : 'hover:bg-gray-400',
                  ]"
                  class="gap-2 px-4 py-2 font-medium cursor-pointer text-center transition-colors duration-200"
                >
                  <span class="text-[14px]">{{ lang.name }}</span>
                </li>
              </ul>
            </div>
          </Transition>
        </div>

        <!-- Mobile Hamburger -->
        <button
          @click="mobileMenuOpen = true"
          class="md:hidden flex flex-col justify-center items-center space-y-1"
        >
          <span
            :class="[
              'block h-0.5 w-6 rounded transition-all',
              passedHero || hasScrolled ? 'bg-black' : 'bg-white',
            ]"
          ></span>
          <span
            :class="[
              'block h-0.5 w-6 rounded transition-all',
              passedHero || hasScrolled ? 'bg-black' : 'bg-white',
            ]"
          ></span>
          <span
            :class="[
              'block h-0.5 w-6 rounded transition-all',
              passedHero || hasScrolled ? 'bg-black' : 'bg-white',
            ]"
          ></span>
        </button>
      </div>
    </header>

    <!-- Mobile Fullscreen Menu -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-400 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl text-black p-8"
      >
        <!-- Close Button -->
        <div
          class="absolute top-6 left-6 right-6 flex items-center justify-between mt-[14px]"
        >
          <NuxtLink :to="localePath('/')">
            <img
              src="/images/footer-logo.svg"
              alt="Logo"
              class="h-8 object-contain ml-4"
            />
          </NuxtLink>

          <button
            @click="mobileMenuOpen = false"
            class="text-2xl font-light hover:rotate-90 transition-transform"
            style="margin-right: 29px"
          >
            ✕
          </button>
        </div>

        <!-- Menu Items -->
        <nav class="flex flex-col items-center gap-8 text-center">
          <NuxtLink
            @click="mobileMenuOpen = false"
            to="#"
            class="text-2xl font-medium tracking-wide relative after:absolute after:left-1/2 after:bottom-[-6px] after:h-[2px] after:w-0 after:bg-[#B88E2F] after:transition-all after:duration-300 hover:after:w-full after:-translate-x-1/2"
          >
            {{ t("header.company") }}
          </NuxtLink>

          <NuxtLink
            @click="mobileMenuOpen = false"
            :to="localePath('/projects')"
            class="text-2xl font-medium tracking-wide relative after:absolute after:left-1/2 after:bottom-[-6px] after:h-[2px] after:w-0 after:bg-[#B88E2F] after:transition-all after:duration-300 hover:after:w-full after:-translate-x-1/2"
          >
            {{ t("header.projects") }}
          </NuxtLink>

          <NuxtLink
            @click="mobileMenuOpen = false"
            to="#"
            class="text-2xl font-medium tracking-wide relative after:absolute after:left-1/2 after:bottom-[-6px] after:h-[2px] after:w-0 after:bg-[#B88E2F] after:transition-all after:duration-300 hover:after:w-full after:-translate-x-1/2"
          >
            {{ t("header.blog") }}
          </NuxtLink>
        </nav>

        <!-- Language Tabs -->
        <div
          class="mt-12 flex gap-3 bg-gray-100/70 rounded-full p-1 shadow-inner"
        >
          <button
            v-for="lang in locales"
            :key="lang.code"
            @click="
              switchLocale(lang.code);
              mobileMenuOpen = false;
            "
            :class="[
              'px-5 py-2 rounded-full text-sm font-medium transition-all',
              currentLocaleName === lang.name
                ? 'bg-[#1aab9a] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200',
            ]"
          >
            {{ lang.name }}
          </button>
        </div>
      </div>
    </Transition>

    <div id="smooth-content" class="flex flex-col md:p-6 p-3 bg-white">
      <div class="w-full top-0 left-0 right-0"></div>
      <main class="min-h-screen">
        <slot />
      </main>

      <footer>
        <div class="md:px-10 md:py-10 p-4 bg-[#e8e8e8]">
          <div class="bg-white rounded-xl md:p-6 p-2">
            <div
              class="md:flex justify-center gap-1 mb-[40px] mt-[20px] hidden"
            >
              <button
                v-for="(img, i) in [
                  '/images/women-footer.webp',
                  '/images/insayt.jpg',
                  '/images/soundBar.webp',
                  '/images/chair-footer.webp',
                  '/images/black_women-footer.webp',
                ]"
                :key="i"
                :ref="(el) => (cardsRef[i] = el)"
                class="relative transition duration-300"
              >
                <img
                  :src="img"
                  alt="footer-card"
                  class="md:h-[233px] md:w-[260px] object-cover"
                  :class="[
                    i === 0 ? 'rounded-l-md' : '',
                    i === 4 ? 'rounded-r-md' : '',
                  ]"
                />

                <!-- Eye cursor -->
                <div class="card-cursor">
                  <svg
                    class="eye-svg"
                    viewBox="0 0 64 64"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 32C10 16 22 8 32 8s22 8 30 24c-8 16-20 24-30 24S10 48 2 32Z"
                      fill="none"
                      stroke="white"
                      stroke-width="4"
                    />
                    <circle cx="32" cy="32" r="8" fill="white" />
                    <circle cx="32" cy="32" r="4" fill="black" />
                    <rect
                      class="eyelid"
                      x="0"
                      y="0"
                      width="64"
                      height="32"
                      fill="black"
                    />
                  </svg>
                </div>
              </button>
            </div>

            <hr class="hidden md:block" />
            <div class="md:px-10 md:py-[100px] p-8 rounded-xl">
              <div class="md:flex justify-between items-center gap-4 mb-[90px]">
                <NuxtLink :to="localePath('/')">
                  <img src="/images/footer-logo.svg" alt="logo" />
                </NuxtLink>
                <div
                  class="md:flex grid grid-cols-1 md:gap-5 mt-5 md:mt-0 gap-3"
                >
                  <NuxtLink
                    :to="localePath('index')"
                    class="relative text-[18px] pb-1 hover:after:w-full after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2"
                    >{{ t("footer.home") }}</NuxtLink
                  >
                  <NuxtLink
                    to="#"
                    class="relative text-[18px] pb-1 hover:after:w-full after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2"
                    >{{ t("footer.company") }}</NuxtLink
                  >
                  <NuxtLink
                    :to="localePath('/projects')"
                    :class="[
                      $route.path.includes('/projects')
                        ? 'after:w-full'
                        : 'after:w-0',
                    ]"
                    class="relative text-[18px] pb-1 hover:after:w-full after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2"
                  >
                    {{ t("footer.projects") }}
                  </NuxtLink>
                  <NuxtLink
                    :to="localePath('/blog')"
                    :class="[
                      $route.path.includes('/blog')
                        ? 'after:w-full'
                        : 'after:w-0',
                    ]"
                    class="relative text-[18px] pb-1 hover:after:w-full after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2"
                    >{{ t("footer.blog") }}</NuxtLink
                  >
                  <NuxtLink
                    :to="localePath('/contact')"
                    :class="[
                      $route.path.includes('/contact')
                        ? 'after:w-full'
                        : 'after:w-0',
                    ]"
                    class="relative text-[18px] pb-1 hover:after:w-full after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-black after:transition-all after:duration-300 after:-translate-x-1/2"
                    >{{ t("footer.contact") }}</NuxtLink
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
                  2025 © Evolution Systems — {{ t("footer.security") }}.
                </p>
                <p
                  class="font-semibold text-[14px] mt-3 mb-3 md:mt-0 md:mb-0 text-[#080808] flex items-center gap-1 text-center"
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

<style scoped>
.card-cursor {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%) scale(0.5);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0;
  z-index: 20;
}

@media (max-width: 768px) {
  .card-cursor {
    display: none;
  }
}

.eye-svg {
  width: 30px;
  height: 30px;
  animation: blink 2s infinite;
}

/* Eyelid moves up and down */
.eyelid {
  animation: closeEye 2s infinite;
  transform-origin: top;
}

@keyframes closeEye {
  0%,
  90%,
  100% {
    transform: translateY(-32px);
  }
  95% {
    transform: translateY(0);
  }
}

@keyframes blink {
  0%,
  90%,
  100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
}
</style>
