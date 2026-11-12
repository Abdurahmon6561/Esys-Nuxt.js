<script setup>
// Global contact modal - teleported to <body>, opened via useContactModal().
// Esc closes, backdrop click closes, body scroll locked while open.
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";

const { isOpen, close } = useContactModal();
const { t } = useI18n();

const formRef = ref(null);
const panel = ref(null);
const route = useRoute();
let returnFocus;
let previousOverflow = "";
let background;
let previousInert = false;
let closeTimer;
let submitted = false;

const onKeydown = (e) => {
  if (!isOpen.value) return;
  if (e.key === "Escape") {
    e.preventDefault();
    close();
  }
  if (e.key !== "Tab") return;
  const controls = [...panel.value.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
    .filter((el) => el.getClientRects().length);
  const first = controls[0];
  const last = controls.at(-1);
  if (!first) {
    e.preventDefault();
    panel.value.focus();
  } else if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.value)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (document.activeElement === last || !panel.value.contains(document.activeElement))) {
    e.preventDefault();
    first.focus();
  }
};

const lockScroll = () => {
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  background = document.getElementById("__nuxt");
  previousInert = background?.inert ?? false;
  if (background) background.inert = true;
};
const unlockScroll = () => {
  document.body.style.overflow = previousOverflow;
  if (background) background.inert = previousInert;
};

watch(isOpen, async (open) => {
  if (open) {
    returnFocus = document.activeElement;
    lockScroll();
    await nextTick();
    if (isOpen.value) {
      panel.value.scrollTop = 0;
      panel.value.querySelector("input")?.focus({ preventScroll: true });
    }
  } else {
    clearTimeout(closeTimer);
    unlockScroll();
    if (submitted) formRef.value?.reset?.();
    submitted = false;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }
});
watch(() => route.fullPath, close);

onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
  clearTimeout(closeTimer);
  document.removeEventListener("keydown", onKeydown);
  if (isOpen.value) {
    unlockScroll();
    close();
  }
});

const onSubmitted = () => {
  submitted = true;
  if (!isOpen.value) {
    formRef.value?.reset?.();
    submitted = false;
    return;
  }
  // Close shortly after the success state renders.
  closeTimer = setTimeout(close, 2000);
};
</script>

<template>
  <Teleport to="body">
    <transition name="cmodal">
      <div
        v-show="isOpen"
        class="cmodal"
        role="dialog"
        aria-modal="true"
        :aria-label="t('contact.title')"
      >
        <div class="cmodal__backdrop" @click="close" />

        <div ref="panel" class="cmodal__panel" tabindex="-1">
          <button
            type="button"
            class="cmodal__close"
            :aria-label="t('contact.close')"
            @click="close"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <header class="cmodal__head">
            <p class="cmodal__eyebrow">{{ t("contact.eyebrow") }}</p>
            <h2 class="cmodal__title">{{ t("contact.title") }}</h2>
            <p class="cmodal__subtitle">{{ t("contact.subtitle") }}</p>
          </header>

          <ContactForm ref="formRef" @submitted="onSubmitted" />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.cmodal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.cmodal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(5, 5, 26, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.cmodal__panel {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 3rem);
  max-height: calc(100dvh - 3rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 2.5rem 2.25rem;
  background: rgba(16, 22, 40, 0.85);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.5rem;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.cmodal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  color: rgba(238, 241, 247, 0.65);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.cmodal__close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
}

.cmodal__close:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

@media (max-width: 560px) {
  .cmodal { padding: 0.75rem; }
  .cmodal__panel {
    max-height: calc(100dvh - 1.5rem);
    padding: 2rem 1.25rem;
  }
}

.cmodal__head {
  margin-bottom: 1.75rem;
  padding-right: 2.5rem;
}

.cmodal__eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #a9d6e5;
}

.cmodal__title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #eef1f7;
}

.cmodal__subtitle {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #c3cad8;
}

.cmodal-enter-active,
.cmodal-leave-active {
  transition: opacity 0.3s ease;
}

.cmodal-enter-active .cmodal__panel,
.cmodal-leave-active .cmodal__panel {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
}

.cmodal-enter-from,
.cmodal-leave-to {
  opacity: 0;
}

.cmodal-enter-from .cmodal__panel,
.cmodal-leave-to .cmodal__panel {
  transform: translateY(16px) scale(0.97);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .cmodal-enter-active,
  .cmodal-leave-active,
  .cmodal-enter-active .cmodal__panel,
  .cmodal-leave-active .cmodal__panel {
    transition: opacity 0.15s ease;
  }
  .cmodal-enter-from .cmodal__panel,
  .cmodal-leave-to .cmodal__panel {
    transform: none;
  }
}
</style>
