<script setup>
import { buildConsultantContext, estimateAnalyticsParams, formatEstimatePrice } from "../../utils/estimate.js";

const props = defineProps({
  estimate: { type: Object, required: true },
  sessionId: String,
  sent: Boolean,
  busy: Boolean,
});
const emit = defineEmits(["sent", "change", "restart"]);
const { t, locale } = useI18n();
const route = useRoute();
const config = useRuntimeConfig();
const track = useTrackEvent();
const id = useId();
const formElement = ref(null);
const nameElement = ref(null);
const contactButton = ref(null);
const formOpen = ref(false);
const sending = ref(false);
const error = ref("");
const fieldErrors = ref({});
const fallback = ref(false);
const form = reactive({ name: "", contact: "", contact_type: "telegram", consent: false });
// Match type=email validity so the submit button stays disabled for invalid addresses.
const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const price = computed(() => formatEstimatePrice(props.estimate, locale.value) || props.estimate.price_text);
const contactInputType = computed(() => ({ telegram: "text", phone: "tel", email: "email" })[form.contact_type]);
const valid = computed(() => Boolean(
  props.sessionId && props.estimate.estimate_id &&
  form.name.trim() && form.name.length <= 100 &&
  form.contact.trim() && form.contact.length <= 200 &&
  ["telegram", "phone", "email"].includes(form.contact_type) &&
  (form.contact_type !== "email" || emailPattern.test(form.contact.trim())) &&
  form.consent
));
const errorsFor = (field) => {
  const value = fieldErrors.value[field];
  return Array.isArray(value) ? value.join(" ") : typeof value === "string" ? value : "";
};
const analyticsParams = () => estimateAnalyticsParams(props.estimate, {
  locale: locale.value,
  ...buildConsultantContext({
    routeName: route.name, path: route.path, query: route.query,
    origin: import.meta.client ? window.location.origin : undefined,
  }),
});
const openForm = async () => {
  formOpen.value = true;
  track("consultant_estimate_contact_started", analyticsParams());
  await nextTick();
  nameElement.value?.focus();
};
const closeForm = async () => {
  formOpen.value = false;
  await nextTick();
  contactButton.value?.focus();
};
const submit = async () => {
  if (sending.value || props.sent || !valid.value || !formElement.value?.reportValidity()) return;
  sending.value = true;
  error.value = "";
  fieldErrors.value = {};
  fallback.value = false;
  const params = analyticsParams();
  try {
    const result = await $fetch(`${config.public.apiUrl}consultant/estimate-lead`, {
      method: "POST",
      headers: { "X-Widget-Key": config.public.consultantKey },
      body: {
        session_id: props.sessionId,
        estimate_id: props.estimate.estimate_id,
        name: form.name.trim(),
        contact: form.contact.trim(),
        contact_type: form.contact_type,
        consent: true,
        locale: locale.value,
      },
    });
    if (result?.success !== true) throw new Error("Unexpected lead response");
    emit("sent");
    formOpen.value = false;
    form.name = "";
    form.contact = "";
    form.consent = false;
    track("consultant_estimate_lead_submitted", params);
  } catch (err) {
    const status = err?.statusCode ?? err?.status ?? err?.response?.status;
    if (status === 422) {
      fieldErrors.value = err?.data?.errors || {};
      error.value = err?.data?.message || t("consultant.estimate.validationError");
    } else {
      error.value = t(status === 429 ? "consultant.estimate.throttled" : "consultant.estimate.leadError");
      fallback.value = true;
    }
  } finally {
    sending.value = false;
  }
};
</script>

<template>
  <section class="estimate-card" :aria-label="t('consultant.estimate.cardTitle')">
    <h3>{{ estimate.service_title }}</h3>
    <p class="estimate-card__price">{{ price }}</p>
    <p v-if="estimate.timeline"><strong>{{ t("consultant.estimate.timeline") }}:</strong> {{ estimate.timeline }}</p>
    <template v-if="estimate.included?.length">
      <h4>{{ t("consultant.estimate.included") }}</h4>
      <ul><li v-for="(line, index) in estimate.included" :key="index">{{ line }}</li></ul>
    </template>
    <p v-if="estimate.excluded"><strong>{{ t("consultant.estimate.excluded") }}:</strong> {{ estimate.excluded }}</p>
    <div v-if="estimate.manual_review" class="estimate-card__notice">
      <p>{{ t("consultant.estimate.manualReview") }}</p>
      <ul v-if="estimate.manual_review_reasons?.length"><li v-for="(reason, index) in estimate.manual_review_reasons" :key="index">{{ reason }}</li></ul>
    </div>
    <p class="estimate-card__disclaimer">{{ t("consultant.estimate.disclaimer") }}</p>
    <a :href="estimate.pricing_url">{{ t("consultant.estimate.packageLink") }}</a>

    <p v-if="sent" class="estimate-card__success" role="status">{{ t("consultant.estimate.success") }}</p>
    <div class="estimate-card__actions">
      <button v-if="!sent && !formOpen" ref="contactButton" type="button" class="estimate-card__primary" @click="openForm">{{ t("consultant.estimate.accept") }}</button>
      <button type="button" :disabled="busy || sending" @click="emit('change')">{{ t("consultant.estimate.change") }}</button>
      <button type="button" :disabled="busy || sending" @click="emit('restart')">{{ t("consultant.estimate.restart") }}</button>
    </div>

    <form v-if="formOpen && !sent" ref="formElement" @submit.prevent="submit">
      <fieldset :disabled="sending">
        <legend>{{ t("consultant.estimate.leadTitle") }}</legend>
        <label :for="`${id}-name`">{{ t("consultant.estimate.name") }}</label>
        <input :id="`${id}-name`" ref="nameElement" v-model="form.name" autocomplete="name" maxlength="100" required :aria-invalid="Boolean(errorsFor('name'))" :aria-describedby="errorsFor('name') ? `${id}-name-error` : undefined" />
        <p v-if="errorsFor('name')" :id="`${id}-name-error`" class="estimate-card__error">{{ errorsFor("name") }}</p>
        <label :for="`${id}-type`">{{ t("consultant.estimate.contactType") }}</label>
        <select :id="`${id}-type`" v-model="form.contact_type" :aria-invalid="Boolean(errorsFor('contact_type'))" :aria-describedby="errorsFor('contact_type') ? `${id}-type-error` : undefined">
          <option value="telegram">{{ t("consultant.estimate.telegram") }}</option>
          <option value="phone">{{ t("consultant.estimate.phone") }}</option>
          <option value="email">{{ t("consultant.estimate.email") }}</option>
        </select>
        <p v-if="errorsFor('contact_type')" :id="`${id}-type-error`" class="estimate-card__error">{{ errorsFor("contact_type") }}</p>
        <label :for="`${id}-contact`">{{ t("consultant.estimate.contact") }}</label>
        <input :id="`${id}-contact`" v-model="form.contact" :type="contactInputType" :autocomplete="form.contact_type === 'telegram' ? 'off' : form.contact_type === 'phone' ? 'tel' : 'email'" maxlength="200" required :aria-invalid="Boolean(errorsFor('contact'))" :aria-describedby="errorsFor('contact') ? `${id}-contact-error` : undefined" />
        <p v-if="errorsFor('contact')" :id="`${id}-contact-error`" class="estimate-card__error">{{ errorsFor("contact") }}</p>
        <label class="estimate-card__consent" :for="`${id}-consent`">
          <input :id="`${id}-consent`" v-model="form.consent" type="checkbox" required :aria-invalid="Boolean(errorsFor('consent'))" :aria-describedby="errorsFor('consent') ? `${id}-consent-error` : undefined" />
          <span>{{ t("consultant.estimate.consent") }}</span>
        </label>
        <p v-if="errorsFor('consent')" :id="`${id}-consent-error`" class="estimate-card__error">{{ errorsFor("consent") }}</p>
      </fieldset>
      <div v-if="error" class="estimate-card__error" role="alert">
        <p>{{ error }}</p>
        <template v-for="field in Object.keys(fieldErrors)" :key="field">
          <p v-if="!['name', 'contact', 'contact_type', 'consent'].includes(field)">{{ errorsFor(field) }}</p>
        </template>
        <div v-if="fallback" class="estimate-card__channels">
          <a href="tel:+998712001133">+998 71 200 11 33</a>
          <a href="https://t.me/esys_pro" target="_blank" rel="noopener">Telegram</a>
        </div>
      </div>
      <div class="estimate-card__actions">
        <button type="submit" class="estimate-card__primary" :disabled="!valid || sending">{{ t(sending ? "consultant.estimate.sending" : "consultant.estimate.submit") }}</button>
        <button type="button" @click="closeForm">{{ t("consultant.estimate.decline") }}</button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.estimate-card {
  align-self: stretch;
  min-width: 0;
  padding: .875rem;
  border: 1px solid rgba(var(--consultant-accent-rgb), .45);
  border-radius: 1rem;
  background: rgba(var(--consultant-accent-rgb), .07);
  color: #eef1f7;
  font-size: .8125rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
}
h3 { margin: 0 0 .5rem; font-size: 1rem; font-weight: 600; }
h4 { margin: .75rem 0 .25rem; font-size: inherit; font-weight: 600; }
p { margin: .5rem 0; }
ul { margin: .25rem 0 .75rem; padding-left: 1.125rem; }
li + li { margin-top: .25rem; }
.estimate-card__price { font-size: 1.125rem; font-weight: 600; color: var(--consultant-accent-hi); }
.estimate-card__notice, .estimate-card__success { padding: .625rem; border-radius: .5rem; background: rgba(var(--consultant-accent-rgb), .12); }
.estimate-card__disclaimer { color: #bdc9dc; font-size: .75rem; }
a { color: #a6eddf; text-decoration: underline; text-underline-offset: 2px; }
.estimate-card__actions, .estimate-card__channels { display: grid; gap: .5rem; margin-top: .75rem; }
button { width: 100%; padding: .625rem .5rem; border: 1px solid rgba(var(--consultant-accent-rgb), .5); border-radius: .625rem; background: transparent; color: inherit; font: inherit; line-height: 1.4; cursor: pointer; }
button:hover:not(:disabled) { background: rgba(var(--consultant-accent-rgb), .16); }
button.estimate-card__primary { background: var(--consultant-accent); color: var(--consultant-ink); font-weight: 600; }
button.estimate-card__primary:hover:not(:disabled) { background: var(--consultant-accent-hi); }
button:disabled { opacity: .5; cursor: not-allowed; }
form { margin-top: 1rem; border-top: 1px solid rgba(var(--consultant-accent-rgb), .3); padding-top: .75rem; }
fieldset { min-width: 0; border: 0; margin: 0; padding: 0; }
legend { font-weight: 600; margin-bottom: .5rem; }
label { display: block; margin: .5rem 0 .25rem; }
input, select { box-sizing: border-box; min-width: 0; width: 100%; border: 1px solid #50617f; border-radius: .5rem; padding: .625rem; background: #131c31; color: #eef1f7; font: inherit; }
.estimate-card__consent { display: flex; align-items: flex-start; gap: .5rem; margin-top: .75rem; }
.estimate-card__consent input { flex: 0 0 1rem; width: 1rem; height: 1rem; margin-top: .2rem; accent-color: var(--consultant-accent); }
.estimate-card__error { color: #ffbdc2; }
:focus-visible { outline: 2px solid var(--consultant-accent-hi); outline-offset: 2px; }
</style>
