<script setup>
// Reusable media card for portfolio items, blog posts, and "similar" lists.
// Variants in data differ: portfolio items carry `services`, blogs carry `tags`
// + `published_at`. This card renders whichever fields are present.
import { computed } from "vue";

const props = defineProps({
  item: { type: Object, required: true },
  // Route path WITHOUT locale prefix - localePath() resolves it.
  to: { type: String, required: true },
  featured: { type: Boolean, default: false },
  showDate: { type: Boolean, default: false },
  // Show the short_text body line (portfolio list has it, blog list does not).
  showText: { type: Boolean, default: true },
});

const localePath = useLocalePath();

const target = computed(() => localePath(props.to));
const tags = computed(() => props.item.tags?.length ? props.item.tags : props.item.services ?? []);
</script>

<template>
  <NuxtLink :to="target" class="ucard" :class="{ 'ucard--featured': featured }">
    <div class="ucard__media">
      <NuxtImg
        :src="item.image"
        :alt="item.title"
        loading="lazy"
        format="webp"
        sizes="100vw md:50vw lg:33vw"
        class="ucard__img"
      />
      <div class="ucard__overlay" aria-hidden="true" />
    </div>

    <div class="ucard__body">
      <div class="ucard__top">
        <h3 class="ucard__title">{{ item.title }}</h3>
        <span class="ucard__arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </div>

      <p v-if="showText && item.short_text" class="ucard__text">
        {{ item.short_text }}
      </p>
      <p v-if="showDate && item.published_at" class="ucard__date">
        {{ item.published_at }}
      </p>

      <ul v-if="tags.length" class="ucard__tags">
        <UiTag v-for="t in tags" :key="t" :text="t" />
      </ul>
    </div>
  </NuxtLink>
</template>

<style scoped>
.ucard {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(238, 241, 247, 0.04);
  border: 1px solid rgba(238, 241, 247, 0.08);
  border-radius: 1.25rem;
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.4s ease,
    border-color 0.4s ease,
    background 0.4s ease,
    box-shadow 0.4s ease,
    opacity 0.4s ease;
}

/* Cyan hairline sweep - signature accent on hover */
.ucard::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
  height: 2px;
  transform: scaleX(0);
  transform-origin: left;
  background: linear-gradient(90deg, #46e6e1, rgba(70, 230, 225, 0));
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.ucard:hover::before {
  transform: scaleX(1);
}

.ucard:hover {
  transform: translateY(-6px);
  border-color: rgba(169, 214, 229, 0.45);
  background: rgba(238, 241, 247, 0.07);
  box-shadow: 0 18px 40px -24px rgba(42, 111, 151, 0.6);
}

/* ---------- Media ---------- */
.ucard__media {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #0a0a2e;
}

.ucard--featured .ucard__media {
  aspect-ratio: 21 / 9;
}

.ucard__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.ucard:hover .ucard__img {
  transform: scale(1.05);
}

.ucard__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(5, 5, 26, 0.55) 0%,
    rgba(5, 5, 26, 0) 45%
  );
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.ucard:hover .ucard__overlay {
  opacity: 1;
}

/* ---------- Body ---------- */
.ucard__body {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.75rem;
}

.ucard--featured .ucard__body {
  gap: 1.25rem;
  padding: 2.25rem;
}

.ucard__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.ucard__title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.ucard--featured .ucard__title {
  font-size: clamp(1.6rem, 2.4vw, 2rem);
}

.ucard__arrow {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  color: #a9d6e5;
  background: rgba(42, 111, 151, 0.18);
  border: 1px solid rgba(42, 111, 151, 0.3);
  transform: translate(4px, -2px);
  opacity: 0.55;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease,
    background 0.3s ease;
}

.ucard:hover .ucard__arrow {
  transform: translate(0, 0);
  opacity: 1;
  background: rgba(42, 111, 151, 0.35);
}

.ucard__text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #c3cad8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ucard--featured .ucard__text {
  -webkit-line-clamp: 2;
  line-clamp: 2;
  font-size: 1.0625rem;
}

.ucard__date {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: rgba(169, 214, 229, 0.75);
}

.ucard__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.25rem 0 0;
  padding: 0;
  list-style: none;
}

@media (prefers-reduced-motion: reduce) {
  .ucard,
  .ucard__img,
  .ucard__arrow,
  .ucard::before {
    transition: none;
  }
  .ucard:hover {
    transform: none;
  }
  .ucard:hover .ucard__img {
    transform: none;
  }
}
</style>