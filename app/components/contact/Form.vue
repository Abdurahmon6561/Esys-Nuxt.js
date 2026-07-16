<script setup>
// Contact form - posts to the backend `feedback` endpoint
// (PageController@feedback → { name, email, subject, message }).
// Used both inside ContactModal and on the /contact page.
import { ref, reactive, computed } from "vue";

const { api } = useApiService();
const { t } = useI18n();
const track = useTrackEvent();

// Emits `submitted` so a parent modal can close itself on success.
const emit = defineEmits(["submitted"]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const touched = reactive({
  name: false,
  email: false,
});

const status = ref("idle"); // idle | sending | success | error
const errorMsg = ref("");

const errors = computed(() => ({
  name: !form.name.trim(),
  email: !EMAIL_RE.test(form.email.trim()),
}));

const isInvalid = computed(() => errors.value.name || errors.value.email);

const handleSubmit = async () => {
  touched.name = true;
  touched.email = true;
  if (isInvalid.value) return;

  status.value = "sending";
  errorMsg.value = "";

  try {
    await api.post("feedback", {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    status.value = "success";
    track("form_submit");
    emit("submitted");
  } catch (e) {
    status.value = "error";
    errorMsg.value = e?.data?.message || t("contact.error");
  }
};

const reset = () => {
  form.name = "";
  form.email = "";
  form.subject = "";
  form.message = "";
  touched.name = false;
  touched.email = false;
  status.value = "idle";
};

defineExpose({ reset });
</script>

<template>
  <div class="cform">
    <!-- Success state replaces the form -->
    <div v-if="status === 'success'" class="cform__success" role="status">
      <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
        <path
          d="M20 6L9 17l-5-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p>{{ t("contact.success") }}</p>
    </div>

    <form v-else class="cform__form" novalidate @submit.prevent="handleSubmit">
      <div class="cform__row">
        <label class="cform__field">
          <span class="cform__label">{{ t("contact.name") }}</span>
          <input
            v-model="form.name"
            type="text"
            class="cform__input"
            :class="{ 'is-invalid': touched.name && errors.name }"
            :placeholder="t('contact.namePlaceholder')"
            autocomplete="name"
            @blur="touched.name = true"
          />
        </label>

        <label class="cform__field">
          <span class="cform__label">{{ t("contact.email") }}</span>
          <input
            v-model="form.email"
            type="email"
            class="cform__input"
            :class="{ 'is-invalid': touched.email && errors.email }"
            :placeholder="t('contact.emailPlaceholder')"
            autocomplete="email"
            @blur="touched.email = true"
          />
        </label>
      </div>

      <label class="cform__field">
        <span class="cform__label">{{ t("contact.subject") }}</span>
        <input
          v-model="form.subject"
          type="text"
          class="cform__input"
          :placeholder="t('contact.subjectPlaceholder')"
        />
      </label>

      <label class="cform__field">
        <span class="cform__label">{{ t("contact.message") }}</span>
        <textarea
          v-model="form.message"
          rows="4"
          class="cform__input cform__textarea"
          :placeholder="t('contact.messagePlaceholder')"
        />
      </label>

      <p v-if="status === 'error'" class="cform__error" role="alert">
        {{ errorMsg }}
      </p>

      <button
        type="submit"
        class="cform__submit"
        :disabled="status === 'sending'"
      >
        {{ status === "sending" ? t("contact.sending") : t("contact.submit") }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.cform__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cform__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 560px) {
  .cform__row {
    grid-template-columns: 1fr;
  }
}

.cform__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cform__label {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(238, 241, 247, 0.7);
}

.cform__input {
  width: 100%;
  padding: 0.85rem 1rem;
  font-family: inherit;
  font-size: 0.9375rem;
  color: #eef1f7;
  background: rgba(238, 241, 247, 0.05);
  border: 1px solid rgba(238, 241, 247, 0.14);
  border-radius: 0.75rem;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.cform__input::placeholder {
  color: rgba(238, 241, 247, 0.35);
}

.cform__input:focus {
  outline: none;
  border-color: rgba(70, 230, 225, 0.55);
  background: rgba(238, 241, 247, 0.08);
}

.cform__input.is-invalid {
  border-color: rgba(255, 180, 180, 0.6);
}

.cform__textarea {
  resize: vertical;
  min-height: 120px;
}

.cform__error {
  margin: 0;
  font-size: 0.875rem;
  color: #ffb4b4;
}

.cform__submit {
  align-self: flex-start;
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

.cform__submit:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #f0f3f7;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
}

.cform__submit:disabled {
  opacity: 0.6;
  cursor: progress;
}

.cform__success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1rem;
  text-align: center;
  color: #46e6e1;
}

.cform__success p {
  margin: 0;
  font-size: 1.0625rem;
  color: #eef1f7;
}
</style>