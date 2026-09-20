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
  return !!(
    p &&
    (p.title || p.subtitle || p.eyebrow || p.image || p.cta_label)
  );
});

const isExternalLink = computed(() => {
  const link = payload.value?.link || "";
  return /^https?:\/\/|^mailto:|^tel:/.test(link);
});
</script>

<template>
  <section v-if="hasContent" class="sblock sblock--hero">
    <div class="sblock__inner">
      <UiSectionHead
        level="h2"
        :eyebrow="payload.eyebrow"
        :title="payload.title || $t('services.blocks.hero')"
        :subtitle="payload.subtitle"
      />

      <UiReveal tag="div" class="hero__content">
        <div v-if="payload.image" class="hero__media">
          <NuxtImg
            :src="payload.image"
            :alt="payload.image_alt || ''"
            loading="lazy"
            format="webp"
            sizes="100vw lg:1200px"
            class="hero__img"
          />
        </div>

        <div v-if="payload.cta_label" class="hero__actions">
          <button
            v-if="payload.cta_action === 'contact' || !payload.cta_action"
            type="button"
            class="hero__cta"
            @click="openContact"
          >
            {{ payload.cta_label }}
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
            class="hero__cta"
          >
            {{ payload.cta_label }}
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
            class="hero__cta"
          >
            {{ payload.cta_label }}
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

.hero__content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.hero__media {
  overflow: hidden;
  border-radius: 24px;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hero__img {
  width: 100%;
  max-height: 520px;
  object-fit: cover;
  display: block;
}

.hero__actions {
  display: flex;
  align-items: center;
}

.hero__cta {
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
  transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
}

.hero__cta svg {
  width: 1.125rem;
  height: 1.125rem;
  transition: transform 0.25s ease;
}

.hero__cta:hover {
  transform: translateY(-2px);
  background: #f0f3f7;
  box-shadow: 0 10px 28px rgba(70, 230, 225, 0.2);
}

.hero__cta:hover svg {
  transform: translateX(3px);
}

.hero__cta:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .sblock {
    padding: 2.5rem 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__cta,
  .hero__cta svg {
    transition: none;
  }
  .hero__cta:hover {
    transform: none;
  }
}
</style>
