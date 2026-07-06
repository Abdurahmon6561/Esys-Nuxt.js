<script setup>
const { reviewsApi } = useApiService();
const { locale } = useI18n();

// Refetches when locale changes - API returns content in the active language.
const { data, pending, error } = await useAsyncData(
  "reviews",
  () => reviewsApi.getReviews(),
  { watch: [locale] }
);

const items = computed(() => data.value?.data ?? []);

const SKELETON_COUNT = 3;
const STAGGER_MS = 90;

const initials = (name) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
</script>

<template>
  <section
    v-if="!error && (pending || items.length)"
    class="reviews"
    id="reviews"
  >
    <div class="reviews__inner">
      <UiSectionHead
        :eyebrow="$t('reviews.eyebrow')"
        :title="$t('reviews.title')"
        :subtitle="$t('reviews.subtitle')"
      />

      <div v-if="pending" class="reviews__grid">
        <div v-for="n in SKELETON_COUNT" :key="n" class="reviews__skeleton" />
      </div>

      <div v-else class="reviews__grid">
        <UiReveal
          v-for="(item, index) in items"
          :key="`${item.name}-${index}`"
          :delay="index * STAGGER_MS"
        >
          <figure class="review">
            <svg
              class="review__mark"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M10 7 6.5 17H3l2.8-10H10Zm11 0-3.5 10H14l2.8-10H21Z"
                fill="currentColor"
              />
            </svg>
            <div class="review__stars" aria-hidden="true">
              <svg
                v-for="s in 5"
                :key="s"
                viewBox="0 0 24 24"
                width="15"
                height="15"
              >
                <path
                  d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 18l-6 3.4 1.4-6.8L2.3 9.1l6.9-.8L12 2z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <blockquote class="review__text">{{ item.text }}</blockquote>
            <figcaption class="review__author">
              <img
                v-if="item.avatar"
                :src="item.avatar"
                :alt="item.name"
                class="review__avatar"
                loading="lazy"
              />
              <span v-else class="review__avatar review__avatar--fallback">
                {{ initials(item.name) }}
              </span>
              <span class="review__meta">
                <span class="review__name">{{ item.name }}</span>
                <span v-if="item.company" class="review__company">
                  {{ item.company }}
                </span>
              </span>
            </figcaption>
          </figure>
        </UiReveal>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reviews {
  position: relative;
  width: 100%;
  padding: 6rem 1.5rem;
  background: #05051a;
  color: #eef1f7;
}

.reviews__inner {
  max-width: 1200px;
  margin: 0 auto;
}

/* auto-fit + centered so 1–2 reviews don't leave the row lopsided */
.reviews__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 380px));
  justify-content: center;
  gap: 1.5rem;
  align-items: stretch;
}

.reviews__grid > * {
  min-width: 0;
}

/* ── Card ── */
.review {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;
  padding: 2rem;
  border-radius: 1.25rem;
  overflow: hidden;
  background: rgba(20, 28, 50, 0.45);
  border: 1px solid rgba(169, 214, 229, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: border-color 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease;
}

/* Cyan hairline sweep - signature accent shared with portfolio cards */
.review::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  transform: scaleX(0);
  transform-origin: left;
  background: linear-gradient(90deg, #46e6e1, rgba(70, 230, 225, 0));
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.review:hover::before {
  transform: scaleX(1);
}

.review:hover {
  border-color: rgba(169, 214, 229, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 18px 40px -24px rgba(42, 111, 151, 0.5);
}

/* Oversized watermark quote - sits behind the text, top-right */
.review__mark {
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
  width: 4.5rem;
  height: 4.5rem;
  color: rgba(169, 214, 229, 0.08);
  pointer-events: none;
}

.review__stars {
  display: flex;
  gap: 0.2rem;
  margin-bottom: 1rem;
  color: #46e6e1;
}

.review__stars svg {
  filter: drop-shadow(0 0 6px rgba(70, 230, 225, 0.35));
}

.review__text {
  position: relative;
  flex: 1;
  margin: 0 0 1.75rem;
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(238, 241, 247, 0.9);
}

.review__author {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.review__author {
  padding-top: 1.25rem;
  border-top: 1px solid rgba(169, 214, 229, 0.1);
}

.review__avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid rgba(169, 214, 229, 0.35);
  box-shadow: 0 0 0 3px rgba(169, 214, 229, 0.08);
}

.review__avatar--fallback {
  display: grid;
  place-items: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: #05051a;
  background: linear-gradient(135deg, #a9d6e5, #46e6e1);
}

.review__meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.review__name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #ffffff;
}

.review__company {
  font-size: 0.8125rem;
  color: rgba(238, 241, 247, 0.55);
}

/* ── Skeleton ── */
.reviews__skeleton {
  height: 260px;
  border-radius: 1.25rem;
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0.04) 40%,
    rgba(255, 255, 255, 0.09) 50%,
    rgba(255, 255, 255, 0.04) 60%
  );
  background-size: 200% 100%;
  animation: reviews-shimmer 1.4s ease infinite;
}

@keyframes reviews-shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 960px) {
  .reviews__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .reviews {
    padding: 4.5rem 1.5rem;
  }
  .reviews__grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reviews__skeleton {
    animation: none;
  }
  .review,
  .review::before {
    transition: none;
  }
  .review:hover {
    transform: none;
  }
}
</style>
