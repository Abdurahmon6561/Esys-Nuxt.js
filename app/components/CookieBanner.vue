<script setup>
import { ref, onBeforeUnmount, onMounted, nextTick, watch } from "vue";

const { t } = useI18n();
const localePath = useLocalePath();

const STORAGE_KEY = "cookie_consent";
const visible = useState("cookie-banner-visible", () => false);
const bannerHeight = useState("cookie-banner-height", () => 0);
const bannerEl = ref(null);
let resizeObserver;

const measureBanner = () => {
  bannerHeight.value = bannerEl.value?.getBoundingClientRect().height ?? 0;
};

onMounted(async () => {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) visible.value = true;
  } catch {
    visible.value = true;
  }

  if (!visible.value) return;

  await nextTick();
  measureBanner();

  if (typeof ResizeObserver !== "undefined" && bannerEl.value) {
    resizeObserver = new ResizeObserver(measureBanner);
    resizeObserver.observe(bannerEl.value);
  }
});

watch(visible, (isVisible) => {
  if (!isVisible) bannerHeight.value = 0;
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  bannerHeight.value = 0;
});

const persist = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* storage unavailable - dismiss for this session only */
  }
  visible.value = false;
};

const acceptAll = () => {
  persist("accepted");
  // Consent Mode v2 - lift the "denied" defaults set by gtag.client.js.
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
  }
};
</script>

<template>
  <Transition name="cookie">
    <div
      v-if="visible"
      ref="bannerEl"
      class="cookie"
      role="dialog"
      :aria-label="t('cookie.ariaLabel')"
      aria-live="polite"
    >
      <span class="cookie__icon" aria-hidden="true">🍪</span>

      <i18n-t keypath="cookie.text" tag="p" class="cookie__text cookie__text--full" scope="global">
        <template #privacy>
          <NuxtLink :to="localePath('/privacy')" class="cookie__link">
            {{ t("cookie.privacy") }}
          </NuxtLink>
        </template>
        <template #terms>
          <NuxtLink :to="localePath('/privacy')" class="cookie__link">
            {{ t("cookie.terms") }}
          </NuxtLink>
        </template>
      </i18n-t>

      <!-- Mobile variant: same links, shorter copy, so the slim bar stays
           ~2 lines tall while the privacy link stays visible and tappable. -->
      <i18n-t keypath="cookie.textShort" tag="p" class="cookie__text cookie__text--short" scope="global">
        <template #privacy>
          <NuxtLink :to="localePath('/privacy')" class="cookie__link">
            {{ t("cookie.privacy") }}
          </NuxtLink>
        </template>
        <template #terms>
          <NuxtLink :to="localePath('/privacy')" class="cookie__link">
            {{ t("cookie.terms") }}
          </NuxtLink>
        </template>
      </i18n-t>

      <div class="cookie__actions">
        <button class="cookie__btn cookie__btn--accept" @click="acceptAll">
          {{ t("cookie.acceptAll") }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 1000;
  width: 300px;
  max-width: calc(100vw - 32px);
  padding: 20px;
  background: #14161d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  font-family: inherit;
}

.cookie__icon {
  display: block;
  font-size: 22px;
  line-height: 1;
  margin-bottom: 14px;
}

.cookie__text {
  margin: 0 0 18px;
  font-size: 13px;
  line-height: 1.55;
  color: #9ca3af;
}

.cookie__link {
  color: #7c93ff;
  /* Underline: links must be distinguishable without relying on color (a11y). */
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s;
}
.cookie__link:hover {
  color: #a3b3ff;
}

.cookie__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cookie__btn {
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s, color 0.15s,
    border-color 0.15s;
}
.cookie__btn:active {
  transform: translateY(1px);
}

.cookie__btn--accept {
  border: 1px solid #ffffff;
  background: #ffffff;
  color: #111318;
}
.cookie__btn--accept:hover {
  background: #e9e9ee;
  border-color: #e9e9ee;
}

.cookie-enter-active {
  transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.cookie-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.cookie-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
.cookie-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .cookie-enter-active,
  .cookie-leave-active {
    transition: opacity 0.2s ease;
  }
  .cookie-enter-from {
    transform: none;
  }
  .cookie__btn {
    transition: none;
  }
}

/* ── Mobile: slim bar pinned to the bottom edge ──
   On small screens the floating card covered both hero CTA buttons, so
   below 640px it becomes a full-width bar of at most ~96px (a shorter
   cookie copy keeps the privacy/terms links inside the visible text
   instead of clamping them away). Desktop styling is untouched. */
@media (max-width: 639px) {
  .cookie {
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: none;
    padding: 10px 16px env(safe-area-inset-bottom);
    border-radius: 14px 14px 0 0;
    box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .cookie__icon {
    display: none;
  }

  .cookie__text {
    margin: 0 0 8px;
    font-size: 13px;
    line-height: 1.35;
  }

  .cookie__text--full {
    display: none;
  }

  .cookie__actions {
    justify-content: flex-end;
  }

  .cookie__btn {
    padding: 7px 16px;
  }
}

@media (min-width: 640px) {
  .cookie__text--short {
    display: none;
  }
}
</style>
