<script setup>
import { computed } from "vue";

const props = defineProps({
  block: {
    type: Object,
    default: () => ({}),
  },
  context: {
    type: Object,
    default: () => ({}),
  },
});

const { open: openContact } = useContactModal();
const localePath = useLocalePath();

const payload = computed(() => props.block?.payload || {});

const hasContent = computed(() => {
  const p = payload.value;
  return !!(p && (p.title || p.text || p.button_label));
});

const isExternalLink = computed(() => {
  const link = payload.value?.link || "";
  return /^https?:\/\/|^mailto:|^tel:/.test(link);
});
</script>

<template>
  <section v-if="hasContent" class="sblock sblock--cta">
    <div class="sblock__inner">
      <UiReveal tag="div" class="scard cta__card">
        <UiSectionHead
          level="h2"
          :title="payload.title || $t('services.blocks.cta')"
          :subtitle="payload.text"
        />

        <div v-if="payload.button_label" class="cta__actions">
          <button
            v-if="payload.button_action === 'contact' || !payload.button_action"
            type="button"
            class="cta__btn"
            @click="openContact"
          >
            {{ payload.button_label }}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
          <a
            v-else-if="isExternalLink"
            :href="payload.link"
            target="_blank"
            rel="noopener noreferrer"
            class="cta__btn"
          >
            {{ payload.button_label }}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
          <NuxtLink
            v-else-if="payload.link"
            :to="localePath(payload.link)"
            class="cta__btn"
          >
            {{ payload.button_label }}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </UiReveal>
    </div>
  </section>
</template>

<style scoped>
.sblock {
  background: #05051a;
  color: #eef1f7;
  padding: 4rem 0;
}

.sblock__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.cta__card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 3rem 2.5rem;
  border-radius: 24px;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transition:
    transform 0.35s ease,
    border-color 0.35s ease,
    background 0.35s ease;
}

.cta__card:hover {
  border-color: rgba(169, 214, 229, 0.32);
  background: rgba(24, 34, 58, 0.55);
}

.cta__card :deep(.shead) {
  margin: 0 0 2rem;
  padding-bottom: 1.5rem;
}

.cta__actions {
  display: flex;
  align-items: center;
}

.cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 2rem;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: #05051a;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  transition:
    transform 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.cta__btn svg {
  width: 1.125rem;
  height: 1.125rem;
  transition: transform 0.25s ease;
}

.cta__btn:hover {
  transform: translateY(-2px);
  background: #f0f3f7;
  box-shadow: 0 10px 28px rgba(70, 230, 225, 0.2);
}

.cta__btn:hover svg {
  transform: translateX(3px);
}

.cta__btn:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .sblock {
    padding: 2.5rem 0;
  }
  .cta__card {
    padding: 2rem 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta__card,
  .cta__btn,
  .cta__btn svg {
    transition: none;
  }
  .cta__btn:hover {
    transform: none;
  }
}
</style>
