<script setup>
import { pricingCopy, serviceLinkText } from './copy.js';
import { consultantServiceKey } from '../../utils/estimate.js';
const props = defineProps({ preview: Boolean });
const { locale, t } = useI18n();
const { suggestedService, startEstimate } = useConsultant();
const route = useRoute();
const localePath = useLocalePath();
const track = useTrackEvent();
const { api } = useApiService();
const siteUrl = (useRuntimeConfig().public.siteUrl || 'https://esys.pro').replace(/\/$/, '');
const copy = computed(() => pricingCopy[locale.value]);
const { data, error } = await useAsyncData(`pricing-${props.preview ? 'preview' : 'live'}-${locale.value}`, () => api.get(props.preview ? `pricing/preview?token=${encodeURIComponent(String(route.query.token || ''))}` : 'pricing'), { watch: [locale] });
if (error.value || !data.value?.data) throw createError({ statusCode: error.value?.statusCode || 503, statusMessage: 'Pricing unavailable', fatal: true });
const page = computed(() => data.value?.data);
const content = computed(() => page.value.content);
const items = computed(() => [...page.value.items].sort((a,b) => a.sort_order-b.sort_order));

const selectedId = ref(null);
const selectedService = computed(() => consultantServiceKey(items.value.find(item => item.id === selectedId.value)?.service_key));
watch(selectedService, value => { suggestedService.value = value; }, { immediate: true });
onBeforeRouteLeave(() => { suggestedService.value = null; });
const price = formatPricingNumber;
const suffix = item => formatPricingSuffix(item, copy.value);
// "from X" when open-ended, "X–Y" when the item has an upper bound.
const amount = formatPricingAmount;
function select(id) { selectedId.value = id; track('pricing_service_selected', { pricing_item_id: id }); }
function cta(item, location) {
    if (item) select(item.id);
    track('pricing_cta_click', { pricing_item_id: item?.id, location });
}
function faqOpened(n) { track('pricing_faq_open', { index: n }); }
const pathFor = (l) => `${l === 'ru' ? '' : `/${l}`}/pricing`;
usePageAlternates(() => props.preview ? {} : Object.fromEntries(page.value.locales.map(l => [l,pathFor(l)])));
useSeoMeta({ title: () => content.value.title, description: () => content.value.description, ogTitle: () => content.value.title,
    ogDescription: () => content.value.description, ogType: 'website', ogUrl: () => `${siteUrl}${pathFor(locale.value)}`, robots: () => props.preview ? 'noindex, nofollow' : 'index, follow' });
const schema = computed(() => buildPricingPageSchema({
    page: page.value, items: items.value, locale: locale.value, siteUrl, navLabel: copy.value.nav, pathFor,
}));
useHead(() => ({ titleTemplate: null, script: props.preview ? [] : [{ key:'pricing-schema', type:'application/ld+json', innerHTML:JSON.stringify(schema.value).replace(/</g,'\\u003c') }] }));
function openHashPackage() {
    const key = route.hash.slice(1);
    if (!items.value.some(item => item.service_key === key)) return;
    const disclosure = document.getElementById(key)?.querySelector('details');
    if (disclosure) disclosure.open = true;
}
watch(() => route.hash, () => nextTick(openHashPackage));
let observer;
onMounted(() => {
    openHashPackage();
    if (props.preview) return;
    track('pricing_page_view', { locale: locale.value });
    observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
            track('pricing_card_view',{ pricing_item_id:Number(entry.target.dataset.pricingId) });
            observer.unobserve(entry.target);
        }
    }, { threshold:.15 });
    document.querySelectorAll('[data-pricing-id]').forEach(el => observer.observe(el));
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
    <main class="pricing-page">
        <div class="pricing-inner">
            <p v-if="preview" class="preview-note">{{ copy.preview }}</p>
            <header class="hero">
                <h1>{{ content.h1 }}</h1>
                <div class="hero-bottom"><p>{{ content.subtitle }}</p><div class="hero-actions"><a class="button primary" href="#estimate" @click="cta(null,'hero')">{{ copy.estimate }}</a><button type="button" class="hero-discuss consultant-cta" @click="startEstimate(selectedService)">{{ t('consultant.estimate.pricingCta') }}</button><a class="hero-discuss" href="https://t.me/esys_pro" @click="track('pricing_telegram_click'); cta(null,'discuss')">{{ copy.discuss }}</a></div></div>

            </header>
            <section class="overview" aria-labelledby="pricing-overview">
                <h2 id="pricing-overview">{{ copy.overview }}</h2>
                <p class="overview-intro">{{ copy.compareIntro }}</p>
                <div class="package-list">
                    <article v-for="item in items" :id="item.service_key" :key="item.id" class="package" :data-pricing-id="item.id" :data-price="item.price_from">
                        <details>
                            <summary>
                                <span class="package-heading"><span class="package-title">{{ item.title }}</span><span class="timeline">{{ copy.timeline }}: {{ item.timeline }}</span></span>
                                <span class="package-budget"><span class="package-price"><span v-if="!item.price_to && copy.fromPre">{{ copy.fromPre }}&nbsp;</span>{{ amount(item) }} <span>{{ item.price_to ? copy.currency : copy.fromPost }}{{ suffix(item) }}</span></span><span class="typical">{{ copy.typical }}: {{ price(item.typical_from) }}–{{ price(item.typical_to) }} {{ copy.currency }}{{ suffix(item) }}</span></span>
                                <span class="disclosure-label">{{ copy.packageDetails }}<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.5" /></svg></span>
                            </summary>
                            <div class="package-body">
                                <p class="audience">{{ item.short_text }}</p>
                                <div class="scope-grid"><div><h3>{{ copy.included }}</h3><ul class="included"><li v-for="line in item.included" :key="line">{{ line }}</li></ul></div><div class="excluded"><h3>{{ copy.excluded }}</h3><p>{{ item.excluded }}</p></div></div>
                                <div v-if="item.cases?.length" class="related-cases"><h3>{{ copy.cases }}</h3><div class="case-grid"><NuxtLink v-for="project in item.cases" :key="project.id" :to="project.url"><img :src="project.image" :alt="project.title" loading="lazy" /><h4>{{ project.title }}</h4><p>{{ project.summary }}</p><p v-if="project.task"><strong>{{ copy.task }}:</strong> {{ project.task }}</p><p v-if="project.solution"><strong>{{ copy.solution }}:</strong> {{ project.solution }}</p><ul v-if="project.features?.length"><li v-for="feature in project.features" :key="feature">{{ feature }}</li></ul><span>{{ copy.caseLink }}</span></NuxtLink></div></div>
                                <div class="package-actions"><a class="button primary" :href="item.cta_route.startsWith('/') ? localePath(item.cta_route) : item.cta_route" @click="cta(item,'card')">{{ item.cta }}</a><NuxtLink v-if="item.service_url" :to="item.service_url" class="text-link">{{ serviceLinkText(copy, item.title) }}</NuxtLink></div>
                            </div>
                        </details>
                    </article>
                </div>
                <ul class="benefits"><li v-for="benefit in copy.benefits" :key="benefit">{{ benefit }}</li></ul>
                <p class="disclaimer">{{ content.disclaimer }}</p>
                <details class="glossary"><summary>{{ copy.glossaryTitle }}</summary><dl><template v-for="[term, explanation] in copy.glossary" :key="term"><dt>{{ term }}</dt><dd>{{ explanation }}</dd></template></dl></details>
            </section>
            <PricingEstimateForm :items="items" :selected-id="selectedId" :copy="copy" :preview="preview" @select="select" />
            <section class="factors"><h2>{{ copy.factorsTitle }}</h2><ul><li v-for="factor in copy.factors" :key="factor">{{ factor }}</li></ul></section>
            <section class="process"><h2>{{ copy.processTitle }}</h2><ol><li v-for="(step,n) in copy.steps" :key="step[0]"><span class="step-number">{{ n+1 }}</span><div><h3>{{ step[0] }}</h3><p>{{ step[1] }}</p></div></li></ol></section>
            <Faq :items="content.faq" :title="copy.faq" subtitle="" :schema="false" data-pricing-faq @open="faqOpened" />

        </div>
    </main>
</template>

<style scoped>
.pricing-page { background:#05051a; color:#eef1f7; min-height:100vh; color-scheme:dark; }
.pricing-page ::selection { background:#b6e7fa; color:#09172c; }
.pricing-inner { max-width:1200px; padding:8rem 1.5rem 5rem; margin:auto; }
.hero h1 { max-width:1000px; font-size:clamp(2rem,4.2vw,3.5rem); line-height:1.12; letter-spacing:-.035em; font-weight:600; margin:0 0 1.25rem; text-wrap:balance; }
.hero-bottom p { font-size:1rem; line-height:1.6; max-width:72ch; color:#bdc9dc; margin:0; }
.hero-actions { display:flex; flex-wrap:wrap; align-items:center; gap:.75rem; margin-top:1.5rem; }
a { color:#b6e7fa; text-decoration:none; text-underline-offset:4px; } a:hover { text-decoration:underline; }
.button,.hero-discuss { display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box; min-height:44px; padding:.8rem 1.1rem; border-radius:9px; font:inherit; font-weight:600; text-align:center; }
.primary { background:#b6e7fa; color:#09172c; } .primary:hover { background:#d6f1fc; text-decoration:none; }
.hero-discuss { border:1px solid #50617f; background:transparent; color:#eef1f7; cursor:pointer; font-size:.9rem; } .hero-discuss:hover { background:#131c31; text-decoration:none; }
section { margin-top:4rem; } .overview { margin-top:2.5rem; }
h2 { font-size:clamp(1.65rem,3vw,2.5rem); letter-spacing:-.025em; line-height:1.15; font-weight:600; margin:0 0 1.25rem; }
.overview-intro { color:#bdc9dc; line-height:1.6; margin:0 0 1.25rem; max-width:72ch; }
.package { border-top:1px solid #34415c; scroll-margin-top:100px; }
.package:last-child { border-bottom:1px solid #34415c; }
summary { display:grid; grid-template-columns:1fr 1fr auto; align-items:center; gap:1.5rem; padding:1.5rem 0; cursor:pointer; list-style:none; }
summary::-webkit-details-marker { display:none; } summary:hover .package-title { color:#b6e7fa; }
.package-heading,.package-budget { display:grid; gap:.5rem; min-width:0; }
.package-title { font-size:1.2rem; font-weight:600; }
.timeline,.typical { color:#b4c6df; font-size:.85rem; line-height:1.6; }
.package-price { font-size:1.35rem; font-weight:600; font-variant-numeric:tabular-nums; line-height:1.4; }
.package-price span { font-size:.9rem; font-weight:400; }
.disclosure-label { display:flex; align-items:center; gap:.75rem; color:#b6e7fa; font-size:.85rem; }
details[open] .disclosure-label svg { transform:rotate(180deg); }
.package-body { padding:0 0 2rem; } .audience { max-width:72ch; color:#bdc9dc; line-height:1.7; margin:0 0 1.5rem; }
.scope-grid { display:grid; grid-template-columns:1fr 1fr; gap:2rem; }
h3 { font-size:1rem; font-weight:600; margin:0 0 .75rem; } h4 { font-size:1rem; margin:0; }
.included { padding-left:1.25rem; margin:0; } .included li { line-height:1.7; color:#bdc9dc; font-size:.95rem; margin:.4rem 0; }
.excluded p { color:#b4c6df; font-size:.95rem; line-height:1.7; margin:0; max-width:65ch; }
.package-actions { display:flex; flex-wrap:wrap; align-items:center; gap:1rem; margin-top:1.5rem; font-size:.9rem; } .text-link { display:inline-flex; align-items:center; min-height:44px; }
.benefits { list-style:none; display:flex; flex-wrap:wrap; gap:.75rem 1.5rem; padding:0; margin:1.5rem 0; color:#b4c6df; font-size:.9rem; line-height:1.6; }
.disclaimer { color:#b4c6df; line-height:1.7; max-width:75ch; }
.factors { display:grid; grid-template-columns:1fr 1fr; gap:2rem; border-top:1px solid #34415c; padding-top:3rem; }
.factors ul { margin:0; padding:0; list-style:none; display:grid; grid-template-columns:1fr 1fr; gap:1rem; color:#bdc9dc; line-height:1.6; }
.process ol { display:grid; grid-template-columns:repeat(3,1fr); gap:2rem; list-style:none; padding:0; } .process li { display:flex; gap:1rem; }
.step-number { color:#b6e7fa; border:1px solid #34415c; border-radius:50%; width:2rem; height:2rem; display:grid; place-items:center; flex-shrink:0; } .process h3 { margin-top:.3rem; }
.process p,.case-grid p { color:#b4c6df; line-height:1.7; font-size:.9rem; }
.related-cases { margin-top:2rem; } .case-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1.5rem; }
.case-grid img { width:100%; aspect-ratio:16/10; object-fit:cover; border-radius:9px; margin-bottom:1rem; } .case-grid a { color:inherit; } .case-grid span { color:#b6e7fa; }
.glossary { margin-top:1.25rem; } .glossary summary { display:list-item; padding:.75rem 0; min-height:44px; color:#b6e7fa; } .glossary dl { max-width:72ch; line-height:1.7; } .glossary dt { font-weight:600; margin-top:1rem; } .glossary dd { margin:.25rem 0 0; color:#bdc9dc; }
.preview-note { border:1px solid #f6c975; padding:1rem; color:#f6c975; }
:focus-visible { outline:3px solid #b6e7fa; outline-offset:4px; }
@media(max-width:900px) { summary { grid-template-columns:1fr 1fr; } .disclosure-label { grid-column:1/-1; } .process ol { grid-template-columns:1fr 1fr; } }
@media(max-width:600px) {
    .pricing-inner { padding:6.5rem 1rem 3rem; } .hero h1 { font-size:1.85rem; } .hero-bottom p { font-size:.9rem; line-height:1.5; }
    .hero-actions { gap:.5rem; margin-top:1rem; } .hero-actions .primary { width:100%; } .hero-discuss { flex:1; font-size:.8rem; padding:.6rem; }
    .overview { margin-top:1.5rem; } .overview h2 { font-size:1.4rem; margin-bottom:.5rem; } .overview-intro { font-size:.85rem; margin-bottom:.5rem; }
    summary { grid-template-columns:1fr auto; gap:.75rem; padding:1.25rem 0; } .package-heading,.package-budget { grid-column:1; } .disclosure-label { grid-column:2; grid-row:1/3; font-size:0; gap:0; }
    .package-title { font-size:1.1rem; } .package-price { font-size:1.2rem; } .timeline,.typical { font-size:.8rem; }
    .scope-grid,.factors,.case-grid,.process ol { grid-template-columns:1fr; } section { margin-top:3rem; }
}
</style>
