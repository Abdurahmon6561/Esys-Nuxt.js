<script setup>
// Animated background only. Mesh gradient (WebGL) is client-rendered.
const localePath = useLocalePath();
</script>

<template>
  <section class="hero">
    <!-- Animated mesh gradient background -->
    <ClientOnly>
      <UiMeshGradientBg
        :colors="['#05050f', '#0a0a2e', '#13244a', '#1b3a6b']"
        :speed="0.35"
      />
    </ClientOnly>

    <!-- Noise overlay -->
    <div class="noise" aria-hidden="true" />

    <!-- Bottom fade — melts hero into the Portfolio section below -->
    <div class="hero__fade" aria-hidden="true" />

    <!-- Content -->
    <div class="hero__content">
      <h1 class="hero__title">{{ $t("hero.title") }}</h1>
      <p class="hero__subtitle">{{ $t("hero.subtitle") }}</p>

      <div class="hero__actions">
        <NuxtLink :to="localePath('/projects')" class="btn btn--primary">
          {{ $t("hero.cta_projects") }}
        </NuxtLink>
        <NuxtLink :to="localePath('/contact')" class="btn btn--ghost">
          {{ $t("hero.cta_contact") }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  background: #000;
  color: #eef1f7;
}

/* Content */
.hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  min-height: 100vh;
  min-height: 100svh;
  padding: 6rem 1.5rem;
  text-align: center;
}

.hero__title {
  max-width: 24ch;
  margin: 0;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero__subtitle {
  max-width: 60ch;
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.375rem);
  line-height: 1.5;
  color: #c3cad8;
}

/* Actions */
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn--primary {
  background: #eef1f7;
  color: #0a0a2e;
}

.btn--primary:hover {
  background: #fff;
}

.btn--ghost {
  background: transparent;
  color: #eef1f7;
  border: 1px solid rgba(238, 241, 247, 0.4);
}

.btn--ghost:hover {
  border-color: #eef1f7;
  background: rgba(238, 241, 247, 0.08);
}

/* Bottom fade — blends mesh into Portfolio bg (#05051a) for a seamless seam */
.hero__fade {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 1;
  height: 30vh;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(5, 5, 26, 0) 0%, #05051a 100%);
}

/* Noise overlay — per spec */
.noise {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: url("/images/noise-bg.png");
  background-size: 200px;
  background-repeat: repeat;
  opacity: 0.25;
  mix-blend-mode: overlay;
}
</style>
