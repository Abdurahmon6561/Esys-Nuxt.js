<script setup>
// Accessible full-screen image lightbox with keyboard navigation.
// Expects an array of image objects { src, alt } and an initial index.
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps({
  images: { type: Array, required: true },
  initialIndex: { type: Number, default: 0 },
  labels: {
    type: Object,
    default: () => ({
      close: "Close",
      previous: "Previous image",
      next: "Next image",
      counter: (current, total) => `${current} / ${total}`,
    }),
  },
});
const emit = defineEmits(["close"]);

const currentIndex = ref(props.initialIndex);
const closeButtonRef = ref(null);
const overlayRef = ref(null);

const total = computed(() => props.images.length);
const currentImage = computed(() => props.images[currentIndex.value] ?? null);
const hasMultiple = computed(() => total.value > 1);

const close = () => emit("close");
const next = () => {
  if (!hasMultiple.value) return;
  currentIndex.value = (currentIndex.value + 1) % total.value;
};
const previous = () => {
  if (!hasMultiple.value) return;
  currentIndex.value = (currentIndex.value - 1 + total.value) % total.value;
};

const onKeyDown = (event) => {
  if (event.key === "Escape") {
    close();
  } else if (event.key === "ArrowRight") {
    next();
  } else if (event.key === "ArrowLeft") {
    previous();
  }
};

const onBackdropClick = (event) => {
  if (event.target === overlayRef.value) {
    close();
  }
};

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
  document.body.classList.add("overflow-hidden");
  closeButtonRef.value?.focus();
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  document.body.classList.remove("overflow-hidden");
});

// Reset to the requested initial index if the lightbox re-opens.
watch(
  () => props.initialIndex,
  (value) => {
    currentIndex.value = value;
  }
);
</script>

<template>
  <Teleport to="body">
    <div
      ref="overlayRef"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      @click="onBackdropClick"
    >
      <button
        ref="closeButtonRef"
        type="button"
        class="lightbox__close"
        :aria-label="labels.close"
        @click="close"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            d="M18 6L6 18M6 6l12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        v-if="hasMultiple"
        type="button"
        class="lightbox__nav lightbox__nav--prev"
        :aria-label="labels.previous"
        @click="previous"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path
            d="M15 18l-6-6 6-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <figure class="lightbox__figure">
        <img
          v-if="currentImage"
          :src="currentImage.src"
          :alt="currentImage.alt || ''"
          loading="eager"
          class="lightbox__img"
        />
        <figcaption v-if="hasMultiple" class="lightbox__counter">
          {{ labels.counter(currentIndex + 1, total) }}
        </figcaption>
      </figure>

      <button
        v-if="hasMultiple"
        type="button"
        class="lightbox__nav lightbox__nav--next"
        :aria-label="labels.next"
        @click="next"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path
            d="M9 18l6-6-6-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(5, 5, 26, 0.94);
  backdrop-filter: blur(6px);
}

.lightbox__figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 90vw;
  max-height: 90vh;
}

.lightbox__img {
  max-width: 100%;
  max-height: 82vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 0.75rem;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.lightbox__counter {
  font-size: 0.875rem;
  color: #a9d6e5;
  letter-spacing: 0.02em;
}

.lightbox__close,
.lightbox__nav {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  color: #eef1f7;
  background: rgba(238, 241, 247, 0.1);
  border: 1px solid rgba(238, 241, 247, 0.14);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, color 0.2s ease;
}

.lightbox__close:hover,
.lightbox__nav:hover {
  background: rgba(238, 241, 247, 0.2);
  transform: scale(1.05);
}

.lightbox__close:focus-visible,
.lightbox__nav:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 2px;
}

.lightbox__close {
  top: 1.25rem;
  right: 1.25rem;
}

.lightbox__nav--prev {
  left: 1rem;
}

.lightbox__nav--next {
  right: 1rem;
}

@media (min-width: 768px) {
  .lightbox__nav--prev {
    left: 2rem;
  }

  .lightbox__nav--next {
    right: 2rem;
  }
}
</style>
