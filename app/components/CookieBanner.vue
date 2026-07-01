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
    /* storage unavailable — dismiss for this session only */
  }
  visible.value = false;
};

const accept = () => persist("accepted");
const decline = () => persist("declined");
</script>

<template>
  <Transition name="cookie">
    <div v-if="visible" class="cookie" role="dialog" aria-live="polite">
      <button class="cookie__close" :aria-label="t('cookie.decline')" @click="decline">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>

      <p class="cookie__text">
        <strong class="cookie__title">{{ t("cookie.title") }}</strong>
        {{ t("cookie.text") }}
      </p>

      <div class="cookie__actions">
        <button class="cookie__btn cookie__btn--accept" @click="accept">
          {{ t("cookie.accept") }}
        </button>
        <button class="cookie__btn cookie__btn--decline" @click="decline">
          {{ t("cookie.decline") }}
        </button>
        <NuxtLink :to="localePath('/privacy')" class="cookie__more">
          {{ t("cookie.more") }}
        </NuxtLink>
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
  width: 320px;
  max-width: calc(100vw - 32px);
  padding: 16px 18px;
  background: linear-gradient(
    150deg,
    rgba(255, 255, 255, 0.62),
    rgba(255, 255, 255, 0.42)
  );
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(17, 24, 39, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    inset 0 -1px 0 rgba(17, 24, 39, 0.04);
  -webkit-backdrop-filter: blur(22px) saturate(190%);
  backdrop-filter: blur(22px) saturate(190%);
  font-family: inherit;
  overflow: hidden;
  isolation: isolate;
}
/* liquid sheen: soft diagonal light sweeping the top-left */
.cookie::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(
    120% 80% at 0% 0%,
    rgba(255, 255, 255, 0.35),
    transparent 60%
  );
  pointer-events: none;
}

.cookie__close {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.cookie__close:hover {
  color: #1f2937;
  background: rgba(255, 255, 255, 0.5);
}

.cookie__text {
  margin: 0 0 12px;
  padding-right: 16px;
  font-size: 12.5px;
  line-height: 1.45;
  color: #4b5563;
}
.cookie__title {
  color: #111827;
  font-weight: 600;
}

.cookie__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cookie__btn {
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s, border-color 0.15s,
    box-shadow 0.15s, color 0.15s;
}
.cookie__btn:active {
  transform: translateY(1px);
}
.cookie__btn--accept {
  border: 1px solid rgba(47, 109, 246, 0.9);
  background: linear-gradient(180deg, #4480ff, #2f6df6);
  color: #fff;
  box-shadow: 0 6px 16px rgba(47, 109, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
.cookie__btn--accept:hover {
  background: linear-gradient(180deg, #3a76ff, #2560e0);
  box-shadow: 0 8px 20px rgba(47, 109, 246, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
.cookie__btn--decline {
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.4);
  color: #374151;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
.cookie__btn--decline:hover {
  background: rgba(255, 255, 255, 0.66);
}

.cookie__more {
  margin-left: auto;
  font-size: 12.5px;
  color: #4b5563;
  text-decoration: underline;
  text-underline-offset: 2px;
  white-space: nowrap;
}
.cookie__more:hover {
  color: #111827;
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
  .cookie__btn,
  .cookie__close {
    transition: none;
  }
}
</style>
