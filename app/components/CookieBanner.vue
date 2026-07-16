<script setup>
import { ref, onMounted } from "vue";

const { t } = useI18n();
const localePath = useLocalePath();

const STORAGE_KEY = "cookie_consent";
const visible = ref(false);

onMounted(() => {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) visible.value = true;
  } catch {
    visible.value = true;
  }
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
    <div v-if="visible" class="cookie" role="dialog" aria-live="polite">
      <span class="cookie__icon" aria-hidden="true">🍪</span>

      <i18n-t keypath="cookie.text" tag="p" class="cookie__text" scope="global">
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
  text-decoration: none;
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
</style>
