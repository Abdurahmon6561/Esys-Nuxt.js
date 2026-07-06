<script setup>
const props = defineProps({
  error: { type: Object, default: null },
});

const { t } = useI18n();
const localePath = useLocalePath();

const statusCode = computed(() => props.error?.statusCode || 500);
const isNotFound = computed(() => statusCode.value === 404);
const title = computed(() =>
  isNotFound.value ? t("errorPage.notFound") : t("errorPage.serverError")
);

useSeoMeta({
  title: () => title.value,
  robots: "noindex",
});

const goHome = () => clearError({ redirect: localePath("/") });
</script>

<template>
  <main class="error-page">
    <p class="error-page__code">{{ statusCode }}</p>
    <h1 class="error-page__title">{{ title }}</h1>
    <p class="error-page__text">{{ $t("errorPage.text") }}</p>
    <button type="button" class="error-page__btn" @click="goHome">
      {{ $t("errorPage.home") }}
    </button>
  </main>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 1.5rem;
  text-align: center;
  background: #05051a;
  color: #eef1f7;
  font-family: "Montserrat", sans-serif;
}

.error-page__code {
  margin: 0;
  font-size: clamp(5rem, 16vw, 9rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #46e6e1, #6d7cff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.error-page__title {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.error-page__text {
  margin: 0;
  max-width: 32rem;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: #c3cad8;
}

.error-page__btn {
  margin-top: 1.5rem;
  padding: 0.85rem 1.75rem;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0a0a2e;
  background: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.error-page__btn:hover {
  transform: translateY(-2px);
  background: #f0f3f7;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
}
</style>
