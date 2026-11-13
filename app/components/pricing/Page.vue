<script setup>
import { pricingCopy } from './copy.js';
const props = defineProps({ preview: Boolean });
const { locale } = useI18n();
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
const cases = computed(() => [...new Map(items.value.flatMap(i => i.cases || []).map(c => [c.id,c])).values()].slice(0,4));
const selectedId = ref(null);
const price = formatPricingNumber;
const suffix = item => formatPricingSuffix(item, copy.value);
// "from X" when open-ended, "X–Y" when the item has an upper bound.
const amount = formatPricingAmount;
function select(id) { selectedId.value = id; track('pricing_service_selected', { pricing_item_id: id }); }
function cta(item, location) {
    if (item) select(item.id);
    track('pricing_cta_click', { pricing_item_id: item?.id, location });
}
function faqOpened(event, n) { if (event.target.open) track('pricing_faq_open', { index: n }); }
const pathFor = (l) => `${l === 'ru' ? '' : `/${l}`}/pricing`;
usePageAlternates(() => props.preview ? {} : Object.fromEntries(page.value.locales.map(l => [l,pathFor(l)])));
useSeoMeta({ title: () => content.value.title, description: () => content.value.description, ogTitle: () => content.value.title,
    ogDescription: () => content.value.description, ogType: 'website', ogUrl: () => `${siteUrl}${pathFor(locale.value)}`, robots: () => props.preview ? 'noindex, nofollow' : 'index, follow' });
const schema = computed(() => buildPricingPageSchema({
    page: page.value, items: items.value, locale: locale.value, siteUrl, navLabel: copy.value.nav, pathFor,
}));
useHead(() => ({ titleTemplate: null, script: props.preview ? [] : [{ key:'pricing-schema', type:'application/ld+json', innerHTML:JSON.stringify(schema.value).replace(/</g,'\\u003c') }] }));
let observer;
onMounted(() => {
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
                <div class="hero-bottom"><p>{{ content.subtitle }}</p><div class="hero-actions"><a class="button primary" href="#estimate" @click="cta(null,'hero')">{{ copy.estimate }}</a><a class="text-link" href="https://t.me/esys_pro" @click="track('pricing_telegram_click'); cta(null,'discuss')">{{ copy.discuss }}</a></div></div>
                <ul class="benefits"><li v-for="benefit in copy.benefits" :key="benefit">{{ benefit }}</li></ul>
            </header>
            <nav class="anchors" :aria-label="copy.service"><a v-for="item in items" :key="item.id" :href="`#${item.service_key}`">{{ item.title }}</a></nav>
            <section class="overview" aria-labelledby="pricing-overview">
                <h2 id="pricing-overview">{{ copy.overview }}</h2>
                <table><thead><tr><th scope="col">{{ copy.service }}</th><th scope="col">{{ copy.price }}</th><th scope="col">{{ copy.timeline }}</th><th scope="col">{{ copy.scope }}</th><th scope="col"><span class="visually-hidden">{{ copy.estimate }}</span></th></tr></thead>
                    <tbody><tr v-for="item in items" :key="item.id"><th scope="row"><a :href="`#${item.service_key}`">{{ item.title }}</a></th><td class="table-price">{{ amount(item) }} {{ copy.currency }}{{ suffix(item) }}</td><td>{{ item.timeline }}</td><td>{{ item.included[0] }}</td><td><a href="#estimate" @click="cta(item,'table')">{{ item.cta }}</a></td></tr></tbody>
                </table>
                <p class="disclaimer">{{ content.disclaimer }}</p>
            </section>
            <section class="packages" aria-labelledby="pricing-packages">
                <h2 id="pricing-packages">{{ copy.packages }}</h2>
                <div class="package-grid"><article v-for="item in items" :id="item.service_key" :key="item.id" class="package" :data-pricing-id="item.id" :data-price="item.price_from">
                    <div class="package-heading"><h3><NuxtLink v-if="item.service_url" :to="item.service_url">{{ item.title }}</NuxtLink><template v-else>{{ item.title }}</template></h3><span class="timeline">{{ item.timeline }}</span></div>
                    <p class="package-price"><span v-if="!item.price_to && copy.fromPre">{{ copy.fromPre }}</span> {{ amount(item) }} <span>{{ item.price_to ? copy.currency : copy.fromPost }}{{ suffix(item) }}</span></p>
                    <p class="typical">{{ copy.typical }}: {{ price(item.typical_from) }}–{{ price(item.typical_to) }} {{ copy.currency }}{{ suffix(item) }}</p>
                    <p class="audience">{{ item.short_text }}</p>
                    <h4>{{ copy.included }}</h4><ul class="included"><li v-for="line in item.included" :key="line">{{ line }}</li></ul>
                    <div class="excluded"><h4>{{ copy.excluded }}</h4><p>{{ item.excluded }}</p></div>
                    <div class="package-actions"><a class="button primary" :href="item.cta_route.startsWith('/') ? localePath(item.cta_route) : item.cta_route" @click="cta(item,'card')">{{ item.cta }}</a><NuxtLink v-if="item.service_url" :to="item.service_url" class="text-link">{{ copy.more }}</NuxtLink></div>
                </article></div>
            </section>
            <section class="factors"><h2>{{ copy.factorsTitle }}</h2><ul><li v-for="factor in copy.factors" :key="factor">{{ factor }}</li></ul></section>
            <section class="process"><h2>{{ copy.processTitle }}</h2><ol><li v-for="(step,n) in copy.steps" :key="step[0]"><span class="step-number">{{ n+1 }}</span><div><h3>{{ step[0] }}</h3><p>{{ step[1] }}</p></div></li></ol></section>
            <section v-if="cases.length" class="cases"><h2>{{ copy.cases }}</h2><div class="case-grid"><NuxtLink v-for="project in cases" :key="project.id" :to="project.url"><img :src="project.image" :alt="project.title" loading="lazy" /><h3>{{ project.title }}</h3><p>{{ project.summary }}</p><p v-if="project.task"><strong>{{ copy.task }}:</strong> {{ project.task }}</p><p v-if="project.solution"><strong>{{ copy.solution }}:</strong> {{ project.solution }}</p><ul v-if="project.features?.length"><li v-for="feature in project.features" :key="feature">{{ feature }}</li></ul><span>{{ copy.caseLink }}</span></NuxtLink></div></section>
            <section class="faq" data-pricing-faq><h2>{{ copy.faq }}</h2><details v-for="(faq,n) in content.faq" :key="faq.question" @toggle="faqOpened($event,n)"><summary>{{ faq.question }}</summary><p>{{ faq.answer }}</p></details></section>
            <PricingEstimateForm :items="items" :selected-id="selectedId" :copy="copy" :preview="preview" @select="select" />
        </div>
    </main>
</template>

<style scoped>
.pricing-page { background:#05051a; color:#eef1f7; min-height:100vh; }
.pricing-inner { max-width:1200px; padding:10rem 1.5rem 6rem; margin:auto; }
.hero h1 { max-width:1050px; font-size:clamp(2.4rem,6.2vw,5.4rem); line-height:1.06; letter-spacing:-.045em; font-weight:600; margin:0 0 2.5rem; }
.hero-bottom { display:flex; align-items:center; justify-content:space-between; gap:3rem; } .hero-bottom p { font-size:1.1rem; line-height:1.7; max-width:540px; color:#bdc9dc; margin:0; } .hero-actions { display:flex; flex-direction:column; align-items:flex-start; gap:1rem; flex-shrink:0; }
a { color:#b6e7fa; text-decoration:none; } a:hover { text-decoration:underline; } .button { display:inline-flex; justify-content:center; padding:1rem 1.25rem; border-radius:9px; font-weight:600; text-align:center; } .primary { background:#b6e7fa; color:#09172c; } .primary:hover { background:#d6f1fc; text-decoration:none; }
.benefits { list-style:none; display:flex; flex-wrap:wrap; gap:1rem 2rem; padding:2rem 0; margin:2rem 0 0; color:#b4c6df; font-size:.9rem; border-top:1px solid #2b3750; } .benefits li::before { content:'✓'; margin-right:.6rem; color:#b6e7fa; }
.anchors { display:flex; gap:.75rem; overflow-x:auto; padding:1rem 0; margin:0 0 3rem; } .anchors a { border:1px solid #34415c; padding:.6rem 1rem; border-radius:30px; white-space:nowrap; font-size:.85rem; }
section { margin-top:5rem; } h2 { font-size:clamp(1.8rem,3.5vw,2.75rem); letter-spacing:-.025em; line-height:1.15; font-weight:600; margin:0 0 2rem; } table { width:100%; border-collapse:collapse; text-align:left; } th,td { padding:1.2rem .8rem; border-bottom:1px solid #2b3750; font-size:.9rem; vertical-align:top; line-height:1.6; } thead th { color:#aabbd4; font-weight:400; padding-top:0; } tbody th { font-weight:500; font-size:1rem; width:20%; } td { color:#bdc9dc; } .table-price { color:white; width:21%; font-weight:600; } .disclaimer { color:#aebdd5; line-height:1.7; max-width:900px; margin-top:1.5rem; }
.package-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; } .package { border:1px solid #303c56; background:#0d1328; padding:2rem; border-radius:20px; scroll-margin-top:110px; display:flex; flex-direction:column; min-width:0; } .package-heading { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:baseline; gap:.75rem; } h3 { font-size:1.35rem; font-weight:600; margin:0; } .timeline { color:#b6c5db; font-size:.85rem; } .package-price { font-size:clamp(1.6rem,2.8vw,2.4rem); font-weight:600; letter-spacing:-.03em; margin:1.5rem 0 .5rem; } .package-price span { font-size:1rem; font-weight:400; letter-spacing:0; } .typical { font-size:.8rem; color:#aabbd4; margin:0; } .audience { color:#bdc9dc; line-height:1.7; margin:1.5rem 0; } h4 { font-size:.85rem; font-weight:600; margin:0 0 .75rem; color:#dbe7fa; } .included { list-style:none; padding:0; margin:0 0 1.5rem; } .included li { position:relative; padding-left:1.25rem; line-height:1.65; color:#bdc9dc; font-size:.9rem; margin:.5rem 0; } .included li::before { content:'✓'; position:absolute; left:0; color:#b6e7fa; } .excluded { border-top:1px solid #303c56; padding-top:1.25rem; margin-top:auto; } .excluded p { color:#aabbd4; font-size:.85rem; line-height:1.7; margin:0; } .package-actions { display:flex; flex-wrap:wrap; align-items:center; gap:1rem; margin-top:1.5rem; font-size:.85rem; }
.factors { display:grid; grid-template-columns:1fr 1fr; gap:2rem; border-top:1px solid #34415c; padding-top:3rem; } .factors ul { margin:0; padding:0; list-style:none; display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; color:#bdc9dc; line-height:1.6; } .process ol { display:grid; grid-template-columns:repeat(3,1fr); gap:2rem; list-style:none; padding:0; } .process li { display:flex; gap:1rem; } .step-number { color:#b6e7fa; border:1px solid #34415c; border-radius:50%; width:2rem; height:2rem; display:grid; place-items:center; flex-shrink:0; } .process h3 { font-size:1rem; margin-top:.3rem; } .process p,.case-grid p { color:#aabbd4; line-height:1.7; font-size:.9rem; }
.case-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:2rem; } .case-grid img { width:100%; aspect-ratio:16/10; object-fit:cover; border-radius:12px; margin-bottom:1rem; } .case-grid a { color:inherit; } .case-grid span { color:#b6e7fa; } .faq { max-width:900px; margin-left:auto; margin-right:auto; } .faq details { border-bottom:1px solid #34415c; } .faq summary { cursor:pointer; padding:1.4rem 0; font-size:1.05rem; font-weight:500; } .faq p { color:#bdc9dc; line-height:1.75; margin:0 0 1.5rem; } .preview-note { border:1px solid #f6c975; padding:1rem; color:#f6c975; } .visually-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
:focus-visible { outline:3px solid #b6e7fa; outline-offset:4px; }
.package-heading h3 a { color:inherit; }
@media(max-width:900px) { .hero-bottom { flex-direction:column; align-items:flex-start; gap:1.5rem; } .hero-actions { flex-direction:row; flex-wrap:wrap; align-items:center; gap:1.5rem; } .process ol { grid-template-columns:1fr 1fr; } th,td { padding:1rem .4rem; } }
@media(max-width:700px) { .pricing-inner { padding:8rem 1rem 4rem; } section { margin-top:3.5rem; } .package-grid,.factors,.case-grid { grid-template-columns:1fr; } .package { padding:1.5rem; } table,tbody,tr,th,td { display:block; width:auto; } thead { display:none; } tbody tr { border:1px solid #34415c; border-radius:12px; padding:1rem; margin:1rem 0; } tbody th,td,.table-price { width:auto; padding:.3rem 0; border:0; } tbody th { font-size:1.2rem; } .table-price { font-size:1.1rem; } .process ol { grid-template-columns:1fr; } .benefits { gap:1rem; } }
@media(prefers-reduced-motion:reduce) { * { scroll-behavior:auto; } }
</style>
