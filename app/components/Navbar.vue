<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const route = useRoute();
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const localePath = useLocalePath();
const { open: openContact } = useContactModal();

const SCROLL_THRESHOLD = 24;
const scrolled = ref(false);
const langOpen = ref(false);
const mobileMenuOpen = ref(false);
const langRef = ref(null);
const nav = ref(null);
const cta = ref(null);
let scope = null;

useMagnetic(cta, 0.4);

// Labels are i18n keys - rendered via $t() in the template.
const links = [
  { label: "nav.services", to: "/services" },
  { label: "nav.portfolio", to: "/portfolio" },
  { label: "nav.blog", to: "/blog" },
  { label: "nav.about", to: "/about" },
];

const LANG = {
  en: { name: "English", flag: "/images/en.webp" },
  ru: { name: "Русский", flag: "/images/ru.webp" },
  uz: { name: "O'zbekcha", flag: "/images/uz.webp" },
};

const toggleLang = () => {
  langOpen.value = !langOpen.value;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const onClickOutside = (e) => {
  if (langRef.value && !langRef.value.contains(e.target)) {
    langOpen.value = false;
  }
};

const onKeydown = (e) => {
  if (e.key === "Escape") {
    mobileMenuOpen.value = false;
    langOpen.value = false;
  }
};

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false;
    langOpen.value = false;
  }
);

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  window.addEventListener("keydown", onKeydown);

  // ScrollTrigger drives the compact-pill toggle instead of a manual scroll
  // listener. `is-scrolled`/`is-compact` classes + their CSS stay unchanged.
  // Functional (not motion), so it runs regardless of reduced-motion.
  scope = useGsapScope(({ ScrollTrigger }) => {
    ScrollTrigger.create({
      start: SCROLL_THRESHOLD,
      onEnter: () => (scrolled.value = true),
      onLeaveBack: () => (scrolled.value = false),
    });
  });
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("keydown", onKeydown);
  scope?.revert();
  scope = null;
});
</script>

<template>
  <header ref="nav" class="navbar" :class="{ 'is-scrolled': scrolled }">
    <div class="navbar__inner" :class="{ 'is-compact': scrolled }">
      <NuxtLink :to="localePath('/')" class="navbar__logo">
        <img src="/images/logo.webp" alt="Evolution Systems" />
      </NuxtLink>

      <div class="navbar__right">
        <nav class="navbar__nav">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="localePath(link.to)"
            class="navbar__link"
          >
            {{ $t(link.label) }}
          </NuxtLink>
        </nav>

        <button ref="cta" type="button" class="navbar__cta" @click="openContact">
          {{ $t("hero.cta_contact") }}
        </button>

        <div ref="langRef" class="lang">
          <button
            class="lang__toggle"
            type="button"
            aria-label="Change language"
            :aria-expanded="langOpen"
            @click="toggleLang"
          >
            <svg
              class="lang__globe"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
            </svg>
            <span class="lang__current">{{ LANG[locale]?.name }}</span>
          </button>

          <transition name="lang-fade">
            <ul v-if="langOpen" class="lang__menu">
              <li v-for="l in locales" :key="l.code">
                <NuxtLink
                  :to="switchLocalePath(l.code)"
                  class="lang__item"
                  :class="{ 'is-active': l.code === locale }"
                  @click="langOpen = false"
                >
                  <span class="lang__name">{{ LANG[l.code]?.name }}</span>
                  <svg
                    v-if="l.code === locale"
                    class="lang__check"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </NuxtLink>
              </li>
            </ul>
          </transition>
        </div>

        <button
          type="button"
          class="navbar__burger"
          :class="{ 'is-open': mobileMenuOpen }"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-nav"
          :aria-label="mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'"
          @click="toggleMobileMenu"
        >
          <span class="navbar__burger-line" />
          <span class="navbar__burger-line" />
        </button>
      </div>
    </div>

    <transition name="mobile-nav">
      <div
        v-if="mobileMenuOpen"
        id="mobile-nav"
        class="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Навигация"
      >
        <div class="mobile-nav__backdrop" @click="closeMobileMenu" />
        <nav class="mobile-nav__panel">
          <ul class="mobile-nav__list">
            <li v-for="link in links" :key="link.to">
              <NuxtLink
                :to="localePath(link.to)"
                class="mobile-nav__link"
                @click="closeMobileMenu"
              >
                <span>{{ $t(link.label) }}</span>
                <svg
                  class="mobile-nav__arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </li>
          </ul>

          <div class="mobile-nav__footer">
            <button
              type="button"
              class="mobile-nav__cta"
              @click="closeMobileMenu(); openContact()"
            >
              {{ $t("hero.cta_contact") }}
            </button>
          </div>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  transition:
    background 0.3s ease,
    backdrop-filter 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
  background: transparent;
  border-bottom: 1px solid transparent;
}

/* Liquid glass - only on the compact pill (after scroll) */
.navbar.is-scrolled {
  background: transparent;
  border-bottom-color: transparent;
  box-shadow: none;
}

.navbar__inner {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  will-change: max-width, padding, border-radius;
  transition:
    max-width 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    padding 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    border-radius 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    gap 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    margin 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.45s ease,
    border-color 0.45s ease,
    box-shadow 0.45s ease;
}

/* Scrolled: compact centered pill - Portfolio/Blog hidden, rest stay put */
.navbar__inner.is-compact {
  max-width: 540px;
  margin: 10px auto 0;
  padding: 8px 16px;
  gap: 16px;
  border-radius: 999px;
  background: rgba(20, 28, 48, 0.5);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

.navbar__inner.is-compact .navbar__nav {
  opacity: 0;
  max-width: 0;
  margin-left: -28px; /* collapse the parent gap too */
  pointer-events: none;
  transition: none; /* hide instantly - no competing animation */
}

.navbar__inner.is-compact .navbar__right {
  gap: 16px;
}

.navbar__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.navbar__logo img {
  height: 32px;
  width: auto;
  display: block;
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: 28px;
}

.navbar__nav {
  display: flex;
  gap: 28px;
  max-width: 560px;
  overflow: hidden;
  white-space: nowrap;
  opacity: 1;
  transition:
    opacity 0.5s ease,
    max-width 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    margin 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: 28px;
  transition: gap 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.navbar__link {
  color: rgba(255, 255, 255, 0.82);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.navbar__link:hover {
  color: #fff;
}

/* Language globe dropdown */
.lang {
  position: relative;
}

.lang__toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.lang__toggle:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.lang__globe {
  width: 18px;
  height: 18px;
}

.lang__menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 150px;
  width: max-content;
  margin: 0;
  padding: 6px;
  list-style: none;
  border-radius: 16px;
  background: rgba(16, 22, 40, 0.7);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.lang__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    padding-left 0.18s ease;
}

.lang__item:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
  padding-left: 18px;
}

.lang__item.is-active {
  color: #fff;
  background: rgba(169, 214, 229, 0.12);
}

.lang__name {
  flex: 1;
}

.lang__check {
  width: 16px;
  height: 16px;
  color: #a9d6e5;
  flex-shrink: 0;
}

.lang-fade-enter-active,
.lang-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.lang-fade-enter-from,
.lang-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Contact us CTA */
.navbar__cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 10px 22px;
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: #0a0a2e;
  text-decoration: none;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.navbar__cta:hover {
  transform: translateY(-2px);
  background: #f0f3f7;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
}

.navbar__cta:active {
  transform: translateY(0);
}

/* Mobile burger button */
.navbar__burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  color: #fff;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.navbar__burger:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.navbar__burger-line {
  display: block;
  width: 18px;
  height: 2px;
  background-color: currentColor;
  border-radius: 2px;
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.25s ease;
  transform-origin: center;
}

.navbar__burger.is-open .navbar__burger-line:first-child {
  transform: translateY(3.5px) rotate(45deg);
}

.navbar__burger.is-open .navbar__burger-line:last-child {
  transform: translateY(-3.5px) rotate(-45deg);
}

/* Mobile nav drawer */
.mobile-nav {
  position: fixed;
  inset: 0;
  top: 68px;
  z-index: 45;
  display: flex;
  flex-direction: column;
}

.mobile-nav__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(3, 4, 15, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.mobile-nav__panel {
  position: relative;
  z-index: 2;
  margin: 8px 16px 0;
  padding: 18px 20px 24px;
  border-radius: 24px;
  background: rgba(14, 20, 38, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.mobile-nav__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-nav__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.88);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.mobile-nav__link:hover,
.mobile-nav__link:active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.mobile-nav__arrow {
  width: 18px;
  height: 18px;
  color: rgba(169, 214, 229, 0.7);
  transition: transform 0.2s ease;
}

.mobile-nav__link:hover .mobile-nav__arrow {
  transform: translateX(4px);
  color: #a9d6e5;
}

.mobile-nav__footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.mobile-nav__cta {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 999px;
  background: #fff;
  color: #0a0a2e;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: background 0.2s ease;
}

.mobile-nav__cta:hover {
  background: #f0f3f7;
}

.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .navbar__nav {
    display: none;
  }
  .navbar__burger {
    display: flex;
  }
}

@media (max-width: 640px) {
  .navbar__inner {
    padding: 12px 16px;
  }
  .navbar__right {
    gap: 12px;
  }
  .navbar__cta {
    padding: 9px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .navbar__cta {
    display: none;
  }
}
</style>
