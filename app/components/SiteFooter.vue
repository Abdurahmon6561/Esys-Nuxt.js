<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// Contact values — placeholders until real ones are provided.
const email = "hello@evolution-systems.uz"; // TODO: real contact value
const phoneDisplay = "+998 (00) 000-00-00";  // TODO: real contact value
const phoneHref = "+998000000000";           // TODO: real contact value

const TILT_MAX = 6; // degrees

const sectionRef = ref(null);
const cardRef = ref(null);

const onPointerMove = (e) => {
  const el = sectionRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Spotlight follows cursor (percent of section).
  el.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
  el.style.setProperty("--my", `${(y / rect.height) * 100}%`);

  // Card tilts toward cursor.
  const card = cardRef.value;
  if (!card) return;
  const ry = ((x - rect.width / 2) / (rect.width / 2)) * TILT_MAX;
  const rx = -((y - rect.height / 2) / (rect.height / 2)) * TILT_MAX;
  card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
};

const onPointerLeave = () => {
  const el = sectionRef.value;
  if (el) {
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  }
  const card = cardRef.value;
  if (card) {
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  }
};

onMounted(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reduceMotion) return;

  const el = sectionRef.value;
  if (!el) return;
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerleave", onPointerLeave);
});

onBeforeUnmount(() => {
  const el = sectionRef.value;
  if (!el) return;
  el.removeEventListener("pointermove", onPointerMove);
  el.removeEventListener("pointerleave", onPointerLeave);
});
</script>

<template>
  <section ref="sectionRef" class="footer">
    <ClientOnly>
      <UiMeshGradientBg
        :colors="['#0a0a2e', '#1b3a6b', '#2a6f97', '#a9d6e5']"
        :speed="0.25"
        :distortion="1.0"
        :swirl="0.7"
      />
    </ClientOnly>

    <div class="footer__noise" aria-hidden="true" />
    <div class="footer__spotlight" aria-hidden="true" />

    <div ref="cardRef" class="footer__card">
      <p class="footer__eyebrow">{{ $t("footer.prompt") }}</p>
      <a
        class="footer__email"
        :href="`mailto:${email}`"
        :aria-label="$t('footer.email')"
      >
        {{ email }}
      </a>
      <a
        class="footer__phone"
        :href="`tel:${phoneHref}`"
        :aria-label="$t('footer.phone')"
      >
        {{ phoneDisplay }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.footer {
  position: relative;
  width: 100%;
  min-height: 70vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 1.5rem;
  background: #05051a;
  color: #eef1f7;
  --mx: 50%;
  --my: 50%;
}

.footer__noise {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: url("/images/noise-bg.png");
  background-size: 200px;
  background-repeat: repeat;
  opacity: 0.22;
  mix-blend-mode: overlay;
}

.footer__spotlight {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(
    340px circle at var(--mx) var(--my),
    rgba(169, 214, 229, 0.25),
    rgba(169, 214, 229, 0) 70%
  );
  mix-blend-mode: screen;
  transition: background 0.12s ease-out;
}

.footer__card {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 560px;
  padding: 2.75rem 2.5rem;
  text-align: center;
  border-radius: 1.5rem;
  background: rgba(16, 22, 40, 0.45);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transform: perspective(900px) rotateX(0deg) rotateY(0deg);
  transform-style: preserve-3d;
  transition: transform 0.3s ease-out;
}

.footer__eyebrow {
  margin: 0 0 1.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #a9d6e5;
}

.footer__email {
  display: inline-block;
  position: relative;
  font-size: clamp(1.75rem, 5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #eef1f7;
  text-decoration: none;
  background-image: linear-gradient(#a9d6e5, #a9d6e5);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 2px;
  transition: background-size 0.35s ease, color 0.35s ease;
}

.footer__email:hover,
.footer__email:focus-visible {
  color: #a9d6e5;
  background-size: 100% 2px;
}

.footer__phone {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 500;
  color: #c3cad8;
  text-decoration: none;
  transition: color 0.25s ease;
}

.footer__phone:hover,
.footer__phone:focus-visible {
  color: #eef1f7;
}

.footer__email:focus-visible,
.footer__phone:focus-visible {
  outline: 2px solid #a9d6e5;
  outline-offset: 4px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .footer__spotlight {
    display: none;
  }
  .footer__card {
    transition: none;
  }
}
</style>
