<script setup>
const props = defineProps({ items: Array, selectedId: Number, copy: Object, preview: Boolean });
const emit = defineEmits(['select']);
const { locale } = useI18n();
const localePath = useLocalePath();
const { api } = useApiService();
const track = useTrackEvent();
const formElement = ref(null);
const step = ref(1);
const started = ref(false);
const sending = ref(false);
const sent = ref(false);
const failed = ref(false);
const form = reactive({ name: '', contact: '', description: '', budget: '', timeline: '', languages: [], website: '', integrations: '', materials: '' });
const budgetKeys = ['under10','10-30','30-70','70-150','over150','undecided'];
function start() { if (!started.value) { started.value = true; track('pricing_form_start'); } }
function next() { if (formElement.value.reportValidity()) step.value = 2; }
async function submit() {
    if (props.preview || sending.value || !formElement.value.reportValidity()) return;
    const item = props.items.find(i => i.id === props.selectedId);
    if (!item) { step.value = 1; return; }
    sending.value = true; failed.value = false;
    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].filter(k => params.has(k)).map(k => [k, params.get(k).slice(0,250)]));
    try {
        await api.post('pricing/leads', { ...form, pricing_item_id: item.id, service_key: item.service_key, locale: locale.value,
            source: 'pricing', entry_url: window.location.href, utm });
        sent.value = true;
        track('pricing_form_submit', { pricing_item_id: item.id, service_key: item.service_key, budget: form.budget });
    } catch { failed.value = true; }
    finally { sending.value = false; }
}
</script>

<template>
    <section id="estimate" class="estimate">
        <div><h2>{{ copy.formTitle }}</h2><p>{{ copy.formIntro }}</p><div class="channels">
            <a href="tel:+998712001133" @click="track('pricing_phone_click')">+998 71 200 11 33</a>
            <a href="https://t.me/esys_pro" target="_blank" rel="noopener" @click="track('pricing_telegram_click')">Telegram</a>
        </div></div>
        <p v-if="sent" class="success" role="status">{{ copy.success }}</p>
        <form v-else ref="formElement" @focusin="start" @submit.prevent="step === 1 ? next() : submit()">
            <div v-show="step === 1" class="form-grid">
                <label>{{ copy.name }}<input v-model="form.name" autocomplete="name" maxlength="100" required /></label>
                <label>{{ copy.contact }}<input v-model="form.contact" autocomplete="tel" maxlength="200" required /></label>
                <label class="full">{{ copy.project }}<select :value="selectedId || ''" required @change="emit('select', Number($event.target.value))"><option disabled value="">{{ copy.select }}</option><option v-for="item in items" :key="item.id" :value="item.id">{{ item.title }}</option></select></label>
                <label class="full">{{ copy.description }}<textarea v-model="form.description" maxlength="4000" rows="4" required /></label>
            </div>
            <div v-show="step === 2" class="form-grid">
                <p class="full">{{ copy.optional }}</p>
                <label>{{ copy.budget }}<select v-model="form.budget" @change="track('pricing_budget_selected', { budget: form.budget })"><option value="">—</option><option v-for="(budget,n) in copy.budgets" :key="budget" :value="budgetKeys[n]">{{ budget }}</option></select></label>
                <label>{{ copy.desired }}<input v-model="form.timeline" maxlength="250" /></label>
                <fieldset class="full"><legend>{{ copy.languages }}</legend><label v-for="lang in ['ru','uz','en']" :key="lang" class="check"><input v-model="form.languages" type="checkbox" :value="lang" />{{ {ru: locale === 'ru' ? 'Русский' : locale === 'uz' ? 'Ruscha' : 'Russian',uz:'O‘zbekcha',en:'English'}[lang] }}</label></fieldset>
                <label>{{ copy.website }}<input v-model="form.website" type="url" maxlength="1000" placeholder="https://" /></label>
                <label>{{ copy.materials }}<input v-model="form.materials" type="url" maxlength="1000" placeholder="https://" /></label>
                <label class="full">{{ copy.integrations }}<textarea v-model="form.integrations" maxlength="2000" rows="3" /></label>
            </div>
            <p v-if="failed" role="alert" class="error">{{ copy.error }}</p>
            <div class="actions"><button v-if="step === 2" type="button" class="secondary" @click="step = 1">{{ copy.back }}</button><button class="primary" type="submit" :disabled="sending || preview">{{ step === 1 ? copy.next : sending ? copy.sending : copy.submit }}</button></div>
            <p class="privacy">{{ copy.privacy }} <NuxtLink :to="localePath('/privacy')">{{ copy.privacyLink }}</NuxtLink></p>
        </form>
    </section>
</template>

<style scoped>
.estimate { scroll-margin-top: 110px; display: grid; grid-template-columns: 1fr 1.3fr; gap: 4rem; border-top: 1px solid #34415c; padding-top: 4rem; }
h2 { font-size: clamp(2rem,4vw,3rem); line-height: 1.1; margin: 0 0 1.5rem; } p { color: #bcc8dc; line-height: 1.7; } .channels { display: grid; gap: 1rem; margin-top: 2rem; } a { color: #b6e7fa; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; } label { display: grid; gap: .6rem; font-size: .9rem; } .full { grid-column: 1/-1; } input,select,textarea { width: 100%; min-width: 0; box-sizing: border-box; font: inherit; padding: .9rem; color: #fff; background: #131c31; border: 1px solid #50617f; border-radius: 8px; } option { background: #131c31; } textarea { resize: vertical; } fieldset { border: 1px solid #50617f; border-radius: 8px; padding: 1rem; } .check { display: inline-flex; align-items: center; margin-right: 1.5rem; margin-top: .5rem; } .check input { width: 1.1rem; height: 1.1rem; }
.actions { display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap; } button { font: inherit; padding: 1rem 1.3rem; border-radius: 9px; border: 0; cursor: pointer; } .primary { background: #b6e7fa; color: #09172c; font-weight: 600; } .secondary { background: #26344e; color: white; } button:disabled { opacity: .5; cursor: default; } .privacy { font-size: .8rem; } .error { color: #ffbdc2; } .success { border: 1px solid #93c9b8; padding: 2rem; border-radius: 10px; } :focus-visible { outline: 3px solid #b6e7fa; outline-offset: 3px; }
@media(max-width:750px) { .estimate { grid-template-columns: 1fr; gap: 2rem; } } @media(max-width:450px) { .form-grid { grid-template-columns: 1fr; } }
</style>
