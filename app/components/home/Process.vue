<script setup>
// Homepage process section: 5 work stages + a timeline of typical project
// durations. Deliberately contains no prices - cost is communicated as
// "by estimate, free calculation" per the owner's decision.
const { open: openContact } = useContactModal();

const STEPS = ["s1", "s2", "s3", "s4", "s5"];
const TIMELINE = ["t1", "t2", "t3", "t4"];
</script>

<template>
  <section class="hprocess">
    <div class="hprocess__inner">
      <UiSectionHead
        :eyebrow="$t('homeProcess.eyebrow')"
        :title="$t('homeProcess.title')"
        :subtitle="$t('homeProcess.subtitle')"
      />

      <UiReveal tag="ol" class="hprocess__steps">
        <li v-for="(key, index) in STEPS" :key="key" class="hprocess__step">
          <span class="hprocess__num">{{ index + 1 }}</span>
          <h3 class="hprocess__step-title">
            {{ $t(`homeProcess.steps.${key}.title`) }}
          </h3>
          <p class="hprocess__step-text">
            {{ $t(`homeProcess.steps.${key}.text`) }}
          </p>
        </li>
      </UiReveal>

      <UiReveal class="hprocess__timeline-wrap">
        <h3 class="hprocess__timeline-title">
          {{ $t("homeProcess.timeline_title") }}
        </h3>
        <ul class="hprocess__timeline">
          <li
            v-for="key in TIMELINE"
            :key="key"
            class="hprocess__timeline-item"
          >
            <span class="hprocess__timeline-label">
              {{ $t(`homeProcess.timeline.${key}.label`) }}
            </span>
            <span class="hprocess__timeline-value">
              {{ $t(`homeProcess.timeline.${key}.value`) }}
            </span>
          </li>
        </ul>
        <p class="hprocess__price-note">{{ $t("homeProcess.price_note") }}</p>
      </UiReveal>

      <UiReveal class="hprocess__cta-wrap">
        <button
          type="button"
          class="hprocess__cta"
          @click="openContact"
        >
          {{ $t("homeProcess.cta") }}
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
      </UiReveal>
    </div>
  </section>
</template>

<style scoped>
.hprocess {
  background: var(--color-ground, #05051a);
  color: var(--color-text-primary, #eef1f7);
}

.hprocess__inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 6rem 1.5rem;
}

/* ── Steps ── */
.hprocess__steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: none;
}

.hprocess__step {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.75rem 1.5rem;
  border-radius: 1.25rem;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hprocess__num {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #05051a;
  background: linear-gradient(135deg, #a9d6e5, #46e6e1);
}

.hprocess__step-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #ffffff;
}

.hprocess__step-text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #aab2c4;
}

/* ── Timeline ── */
.hprocess__timeline-wrap {
  margin-top: 4rem;
  padding: 2rem;
  border-radius: 1.25rem;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hprocess__timeline-title {
  margin: 0 0 1.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #a9d6e5;
}

.hprocess__timeline {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.hprocess__timeline-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid rgba(169, 214, 229, 0.1);
}

.hprocess__timeline-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.hprocess__timeline-label {
  min-width: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #eef1f7;
}

.hprocess__timeline-value {
  flex-shrink: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #46e6e1;
  white-space: nowrap;
}

.hprocess__price-note {
  margin: 1.5rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #aab2c4;
}

/* ── CTA ── */
.hprocess__cta-wrap {
  margin-top: 3rem;
  text-align: center;
}

.hprocess__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.9375rem 2.25rem;
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  color: #0a0a2e;
  background: #eef1f7;
  cursor: pointer;
  transition: background 0.2s ease;
}

.hprocess__cta:hover {
  background: #fff;
}

.hprocess__cta:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

.hprocess__cta svg {
  width: 1.125rem;
  height: 1.125rem;
}

@media (max-width: 640px) {
  .hprocess__inner {
    padding: 4.5rem 1.5rem;
  }
  .hprocess__steps {
    grid-template-columns: 1fr;
  }
  .hprocess__timeline-item {
    flex-direction: column;
    gap: 0.25rem;
  }
  .hprocess__timeline-wrap {
    padding: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hprocess__cta {
    transition: none;
  }
}
</style>
