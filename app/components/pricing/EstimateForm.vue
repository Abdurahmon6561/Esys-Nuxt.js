<script setup>
const props = defineProps({ items: Array, selectedId: Number, copy: Object, preview: Boolean });
const emit = defineEmits(['select']);
const { locale } = useI18n();
const localePath = useLocalePath();
const { api } = useApiService();
const track = useTrackEvent();
const formElement = ref(null);
const selectedItem = computed(() => props.items.find(item => item.id === props.selectedId));
const estimateVisible = useState('pricing-estimate-visible', () => false);
const sectionElement = ref(null);
let visibilityObserver;
onMounted(() => {
    visibilityObserver = new IntersectionObserver(entries => {
        estimateVisible.value = entries[0].isIntersecting;
    });
    if (sectionElement.value) visibilityObserver.observe(sectionElement.value);
});
onBeforeUnmount(() => { visibilityObserver?.disconnect(); estimateVisible.value = false; });
const started = ref(false);
const sending = ref(false);
const sent = ref(false);
const failed = ref(false);
const form = reactive({ name: '', contact: '', description: '', budget: '', timeline: '', languages: [], website: '', integrations: '', materials: '' });
const budgetKeys = ['under10','10-30','30-70','70-150','over150','undecided'];
function start() { if (!started.value) { started.value = true; track('pricing_form_start'); } }
async function submit() {
    if (props.preview || sending.value || !formElement.value.reportValidity()) return;
    const item = props.items.find(i => i.id === props.selectedId);
    if (!item) return;
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
    <section id="estimate" ref="sectionElement" class="estimate">
        <div><h2>{{ copy.formTitle }}</h2><p>{{ copy.formIntro }}</p><div class="channels">
            <a href="tel:+998712001133" @click="track('pricing_phone_click')">+998 71 200 11 33</a>
            <a href="https://t.me/esys_pro" target="_blank" rel="noopener" @click="track('pricing_telegram_click')">Telegram</a>
        </div></div>
        <p v-if="sent" class="success" role="status">{{ copy.success }}</p>
        <form v-else ref="formElement" @focusin="start" @submit.prevent="submit">
            <p class="required-note">{{ copy.requiredNote }}</p>
            <div class="form-grid">
                <label><span>{{ copy.name }} <span aria-hidden="true">*</span></span><input v-model="form.name" autocomplete="name" maxlength="100" required /></label>
                <label><span>{{ copy.contact }} <span aria-hidden="true">*</span></span><input v-model="form.contact" autocomplete="tel" maxlength="200" required /></label>
                <label class="full"><span>{{ copy.project }} <span aria-hidden="true">*</span></span><select :value="selectedId || ''" required @change="emit('select', Number($event.target.value))"><option disabled value="">{{ copy.select }}</option><option v-for="item in items" :key="item.id" :value="item.id">{{ item.title }}</option></select></label>
                <label class="full"><span>{{ copy.description }} <span aria-hidden="true">*</span></span><textarea :placeholder="copy.descriptionHint" v-model="form.description" maxlength="4000" rows="4" required /></label>
            </div>
            <div v-if="selectedItem" class="selection-summary" role="status">
                <strong>{{ selectedItem.title }}</strong>
                <p>{{ !selectedItem.price_to ? copy.fromPre : '' }} {{ formatPricingAmount(selectedItem) }} {{ selectedItem.price_to ? copy.currency : copy.fromPost }}{{ formatPricingSuffix(selectedItem, copy) }}</p>
                <p>{{ copy.typical }}: {{ formatPricingNumber(selectedItem.typical_from) }}–{{ formatPricingNumber(selectedItem.typical_to) }} {{ copy.currency }}{{ formatPricingSuffix(selectedItem, copy) }}</p>
                <p>{{ copy.scope }}: {{ selectedItem.included.join('; ') }}</p>
            </div>
            <details class="extra-details" @invalid.capture="$event.currentTarget.open = true">
                <summary>{{ copy.optional }}</summary>
                <div class="form-grid">
                    <label>{{ copy.budget }}<select v-model="form.budget" @change="track('pricing_budget_selected', { budget: form.budget })"><option value="">—</option><option v-for="(budget,n) in copy.budgets" :key="budget" :value="budgetKeys[n]">{{ budget }}</option></select></label>
                    <label>{{ copy.desired }}<input v-model="form.timeline" maxlength="250" /></label>
                    <fieldset class="full"><legend>{{ copy.languages }}</legend><label v-for="lang in ['ru','uz','en']" :key="lang" class="check"><input v-model="form.languages" type="checkbox" :value="lang" />{{ {ru: locale === 'ru' ? 'Русский' : locale === 'uz' ? 'Ruscha' : 'Russian',uz:'O‘zbekcha',en:'English'}[lang] }}</label></fieldset>
                    <label>{{ copy.website }}<input v-model="form.website" type="url" maxlength="1000" placeholder="https://" /></label>
                    <label>{{ copy.materials }}<input v-model="form.materials" type="url" maxlength="1000" placeholder="https://" /></label>
                    <label class="full">{{ copy.integrations }}<textarea v-model="form.integrations" maxlength="2000" rows="3" /></label>
                </div>
            </details>
            <p v-if="failed" role="alert" class="error">{{ copy.error }}</p>
            <div class="actions"><button class="primary" type="submit" :disabled="sending || preview">{{ sending ? copy.sending : copy.submit }}</button></div>
            <p class="privacy">{{ copy.privacy }} <NuxtLink :to="localePath('/privacy')">{{ copy.privacyLink }}</NuxtLink></p>
        </form>
    </section>
</template>

<style scoped>
.estimate { scroll-margin-top: 110px; display: grid; grid-template-columns: 1fr 1.3fr; gap: 4rem; border-top: 1px solid #34415c; padding-top: 4rem; }
h2 { font-size: clamp(2rem,4vw,3rem); line-height: 1.1; margin: 0 0 1.5rem; } p { color: #bcc8dc; line-height: 1.7; } .channels { display: grid; gap: .5rem; margin-top: 2rem; } a { color: #b6e7fa; text-underline-offset: 4px; } .channels a { display:flex; align-items:center; min-height:44px; width:fit-content; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; } label { display: grid; gap: .6rem; font-size: .9rem; } .full { grid-column: 1/-1; } input,select,textarea { caret-color:#b6e7fa; width: 100%; min-width: 0; box-sizing: border-box; font: inherit; padding: .9rem; color: #fff; background: #131c31; border: 1px solid #50617f; border-radius: 8px; } option { background: #131c31; } textarea { resize: vertical; } fieldset { border: 1px solid #50617f; border-radius: 8px; padding: 1rem; } .check { display: inline-flex; align-items: center; margin-right: 1.5rem; margin-top: .5rem; } .check input { width: 1.1rem; height: 1.1rem; }
.required-note { margin:0 0 1rem; font-size:.85rem; }
.selection-summary { border-top:1px solid #34415c; padding-top:1rem; margin-top:1.5rem; }
.selection-summary p { margin:.5rem 0; font-size:.85rem; font-variant-numeric:tabular-nums; }
.extra-details { margin-top:1.5rem; }
.extra-details summary { cursor:pointer; color:#b6e7fa; padding:.75rem 0; min-height:44px; box-sizing:border-box; }
.extra-details .form-grid { margin-top:1rem; }
input::placeholder,textarea::placeholder { color:#b4c6df; opacity:1; }
select {
    appearance: none;
    padding-inline-end: 2.75rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right .9rem center;
    background-size: 1rem;
}
@media (forced-colors: active) {
    select { appearance: auto; background-image: none; }
}
.actions { display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap; } button { font: inherit; padding: 1rem 1.3rem; border-radius: 9px; border: 0; cursor: pointer; } .primary { background: #b6e7fa; color: #09172c; font-weight: 600; } button:disabled { opacity: .5; cursor: default; } .privacy { font-size: .8rem; } .error { color: #ffbdc2; } .success { border: 1px solid #93c9b8; padding: 2rem; border-radius: 10px; } :focus-visible { outline: 3px solid #b6e7fa; outline-offset: 3px; }
@media(max-width:750px) { .estimate { grid-template-columns: 1fr; gap: 2rem; } } @media(max-width:450px) { .form-grid { grid-template-columns: 1fr; } }
</style>
