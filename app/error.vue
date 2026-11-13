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
  <div class="error-page">
    <header class="error-header">
      <a :href="localePath('/')" @click.prevent="goHome">
        <img src="/images/logo.webp" alt="Evolution Systems" width="147" height="47" />
      </a>
      <span>Evolution Systems</span>
    </header>

    <main class="error-main">
      <div class="error-art" aria-hidden="true">
        <template v-if="isNotFound">
          <span class="digit">4</span>
          <div class="planet"><div class="planet__sphere" /><div class="planet__ring" /><span class="planet__moon" /></div>
          <span class="digit">4</span>
        </template>
        <span v-else class="status-code">{{ statusCode }}</span>
      </div>
      <p class="error-status">{{ statusCode }} / {{ title }}</p>
      <h1>{{ isNotFound ? $t('errorPage.orbit') : title }}</h1>
      <p class="error-description">{{ $t(isNotFound ? 'errorPage.description' : 'errorPage.serverText') }}</p>
      <div class="error-actions">
        <a class="home-button" :href="localePath('/')" @click.prevent="goHome">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m12 3-9 8h3v10h12V11h3L12 3Z" /><path d="M10 21v-7h4v7" /></svg>
          {{ $t('errorPage.home') }}
        </a>
        <a class="projects-link" :href="localePath('/portfolio')" @click.prevent="clearError({ redirect: localePath('/portfolio') })">{{ $t('hero.cta_projects') }} <span aria-hidden="true">↗</span></a>
      </div>
    </main>
    <footer class="error-footer"><span>{{ $t('errorPage.footer') }}</span><a href="mailto:hi@esys.pro">hi@esys.pro</a></footer>
  </div>
</template>

<style scoped>
:global(body) { margin: 0; background: #05051a; }
.error-page, .error-page * { box-sizing: border-box; }
.error-page {
  min-height: 100svh; display: flex; flex-direction: column; overflow: hidden;
  padding: 0 clamp(24px, 5vw, 88px); color: #eef1f7; font-family: "Montserrat", sans-serif;
  background: radial-gradient(ellipse at 50% 40%, #102e40 0%, #0b142b 30%, #05051a 65%);
  position: relative; isolation: isolate;
}
.error-page::before {
  content: ''; position: absolute; inset: 0; z-index: -1; opacity: .5; pointer-events: none;
  background-image: radial-gradient(circle, #a9d6e5 1px, transparent 1.5px), radial-gradient(circle, #a9d6e5 1px, transparent 1.5px);
  background-size: 137px 151px, 229px 197px; background-position: 17px 23px, 83px 91px;
  mask-image: linear-gradient(transparent, black 25%, black 65%, transparent);
}
.error-header, .error-footer { display: flex; justify-content: space-between; align-items: center; gap: 24px; }
.error-header { min-height: 106px; }
.error-header img { display: block; object-fit: contain; }
.error-header > span, .error-footer { color: #aab2c4; font-size: 12px; }
.error-main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px 0 64px; }
.error-art { display: flex; justify-content: center; align-items: center; height: clamp(180px, 26vw, 330px); width: 100%; gap: clamp(0px, 1.5vw, 24px); user-select: none; }
.digit, .status-code { font-size: clamp(150px, 25vw, 320px); font-weight: 600; line-height: 1; letter-spacing: -.07em; color: #dcecf2; text-shadow: 0 0 80px #9ae2d622; }
.planet { position: relative; width: clamp(120px, 20vw, 250px); height: clamp(120px, 20vw, 250px); margin: 0 12px; }
.planet__sphere { position: absolute; inset: 8%; border-radius: 50%; background: radial-gradient(circle at 29% 24%, #b8fff0 0%, #46b8ad 18%, #176778 43%, #0b233c 65%, #061022 80%); box-shadow: inset 5px 3px 14px #b0fff866, 0 0 60px #1aab9a22; }
.planet__ring { position: absolute; inset: 29% -29%; border: 2px solid #9ae2d677; border-top-color: #9ae2d622; border-radius: 50%; transform: rotate(-29deg); box-shadow: 0 5px 0 -3px #9ae2d633, 0 13px 0 -10px #9ae2d633; }
.planet__moon { position: absolute; width: 12px; height: 12px; border-radius: 50%; right: -9%; top: 12%; background: #a9d6e5; box-shadow: 0 0 20px #a9d6e566; }
.error-status { margin: 24px 0 18px; color: #9ae2d6; font-size: 13px; }
h1 { font-size: clamp(28px, 4.2vw, 54px); letter-spacing: -.045em; font-weight: 500; line-height: 1.12; margin: 0; }
.error-description { color: #aab2c4; max-width: 500px; font-size: 15px; line-height: 1.8; margin: 22px 0 30px; text-wrap: pretty; }
.error-actions { display: flex; align-items: center; justify-content: center; gap: 30px; }
a { color: inherit; text-decoration: none; }
.home-button { display: inline-flex; gap: 12px; align-items: center; border-radius: 100px; background: #eef1f7; color: #05051a; padding: 17px 25px; font-size: 14px; font-weight: 600; transition: background .2s; }
.home-button:hover { background: #9ae2d6; }
.projects-link { font-size: 14px; padding: 14px 0; }
.projects-link span { margin-left: 10px; color: #9ae2d6; }
a:focus-visible { outline: 2px solid #9ae2d6; outline-offset: 6px; }
.projects-link:hover, .error-footer a:hover { color: #9ae2d6; }
.error-footer { padding: 24px 0; border-top: 1px solid #ffffff12; }
@media (max-width: 480px) {
  .error-header { min-height: 84px; }
  .error-header > span { display: none; }
  .error-main { padding-top: 30px; padding-bottom: 48px; }
  .error-actions { flex-direction: column; gap: 8px; }
  .error-footer { align-items: flex-start; font-size: 11px; }
  .error-footer > span { max-width: 170px; line-height: 1.6; }
}
</style>
