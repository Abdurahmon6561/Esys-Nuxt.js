<script setup>
// Global contact modal - teleported to <body>, opened via useContactModal().
// Esc closes, backdrop click closes, body scroll locked while open.
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";

const { isOpen, close } = useContactModal();
const { t } = useI18n();

const formRef = ref(null);

const onKeydown = (e) => {
  if (e.key === "Escape" && isOpen.value) close();
};

const lockScroll = () => {
  document.body.style.overflow = "hidden";
};
const unlockScroll = () => {
  document.body.style.overflow = "";
};

watch(isOpen, (open) => {
  if (open) {
    lockScroll();
  } else {
    unlockScroll();
    // Reset the form for the next open.
    nextTick(() => formRef.value?.reset?.());
  }
});

onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  unlockScroll();
});

const onSubmitted = () => {
  // Close shortly after the success state renders.
  setTimeout(() => close(), 2000);
};
</script>

<template>
  <Teleport to="body">
    <transition name="cmodal">
      <div
        v-if="isOpen"
        class="cmodal"
        role="dialog"
        aria-modal="true"
        :aria-label="t('contact.title')"
      >
        <div class="cmodal__backdrop" @click="close" />

        <div class="cmodal__panel" role="document">
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
  z-index: 100;
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
  overflow-y: auto;
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
  width: 2.5rem;
  height: 2.5rem;
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