<script setup>
const { t } = useI18n();

const email = "hi@esys.pro";
const phone = "+998 71 200 00 00";

useSeoMeta({
  title: () => t("contact.title"),
  description: () => t("contact.subtitle"),
});
</script>

<template>
  <main class="contact page--dark">
    <UiPageHeader
      :eyebrow="$t('contact.eyebrow')"
      :title="$t('contact.title')"
      :subtitle="''"
    >
      <template #aside>
        <p class="contact__subtitle">{{ $t("contact.subtitle") }}</p>
      </template>
    </UiPageHeader>

    <div class="contact__inner">
      <div class="contact__form-card">
        <ContactForm />
      </div>

      <aside class="contact__info">
        <a :href="`mailto:${email}`" class="contact__info-item">
          <span class="contact__info-label">{{ $t("contact.infoEmail") }}</span>
          <span class="contact__info-value">{{ email }}</span>
        </a>
        <a :href="`tel:${phone.replace(/\s/g, '')}`" class="contact__info-item">
          <span class="contact__info-label">{{ $t("contact.infoPhone") }}</span>
          <span class="contact__info-value">{{ phone }}</span>
        </a>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.page--dark {
  background: #05051a;
  color: #eef1f7;
  min-height: 100vh;
}

.contact__subtitle {
  margin: 0;
  max-width: 50ch;
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.5;
  color: #c3cad8;
}

.contact__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem 6rem;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 3rem;
  align-items: start;
}

@media (max-width: 900px) {
  .contact__inner {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}

.contact__form-card {
  padding: 2.5rem 2.25rem;
  background: rgba(238, 241, 247, 0.04);
  border: 1px solid rgba(238, 241, 247, 0.08);
  border-radius: 1.5rem;
}

.contact__info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact__info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.75rem;
  text-decoration: none;
  background: rgba(238, 241, 247, 0.04);
  border: 1px solid rgba(238, 241, 247, 0.08);
  border-radius: 1.25rem;
  transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
}

.contact__info-item:hover {
  border-color: rgba(169, 214, 229, 0.45);
  background: rgba(238, 241, 247, 0.07);
  transform: translateY(-3px);
}

.contact__info-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(169, 214, 229, 0.5);
}

.contact__info-value {
  font-size: 1.125rem;
  font-weight: 500;
  color: #eef1f7;
}

@media (max-width: 640px) {
  .contact__inner {
    padding-bottom: 4rem;
  }
  .contact__form-card {
    padding: 2rem 1.5rem;
  }
}
</style>