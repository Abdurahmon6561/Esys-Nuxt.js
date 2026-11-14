import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileScript, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { useConsultant } from "../app/composables/useConsultant.js";

// Exercise the real SFC setup functions and Vue watchers without adding a DOM/test dependency.
async function loadComponent(path: string) {
  const url = new URL(`../${path}`, import.meta.url);
  const { descriptor } = parse(readFileSync(url, "utf8"));
  const script = compileScript(descriptor, { id: path });
  const code = script.content
    .replace(/from (["'])([^"']+)\1/g, (_, quote, specifier) =>
      `from ${quote}${specifier.startsWith(".") ? new URL(specifier, url).href : import.meta.resolve(specifier)}${quote}`)
    .replaceAll("import.meta.client", "true");
  const component = (await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`)).default;
  component.render = () => null;
  return component;
}

const renderer = Vue.createRenderer({
  createComment: () => ({}), insert: () => {}, remove: () => {},
  createElement: () => ({}), createText: () => ({}), setText: () => {},
  setElementText: () => {}, patchProp: () => {}, parentNode: () => null, nextSibling: () => null,
} as any);
const translations = Object.fromEntries(["ru", "en", "uz"].map(locale => [
  locale, JSON.parse(readFileSync(new URL(`../i18n/locales/${locale}.json`, import.meta.url), "utf8")),
]));
const estimate = {
  estimate_id: "est_fixture", service_key: "landing", service_title: "Landing", currency: "UZS",
  price_from: 4500000, price_to: 6000000, billing_period: "project", timeline: "2 weeks",
  included: ["Design"], excluded: "Hosting", manual_review: true, manual_review_reasons: ["Integration"],
  factors: [], pricing_version: 1, pricing_url: "/pricing#landing", price_text: "Do not display this",
};

async function fixture(component: any, initialProps = {}, stored?: unknown) {
  const states = new Map();
  const storage = new Map(stored ? [["consultant_state", JSON.stringify(stored)]] : []);
  const locale = Vue.ref("ru");
  const route = { name: "pricing___ru", path: "/pricing", query: { utm_source: "search" } };
  const calls: any[] = [];
  const events: any[] = [];
  let respond = async (_url: string, _options: any): Promise<any> => ({ reply: "Reply", session_id: "session_fixture", estimate });
  const globals: Record<string, any> = {
    ...Vue,
    useState: (key: string, init: () => unknown) => {
      if (!states.has(key)) states.set(key, Vue.ref(init()));
      return states.get(key);
    },
    useI18n: () => ({ locale, t: (key: string, _params: any, options: any) =>
      key.split(".").reduce((value, part) => value?.[part], translations[options?.locale || locale.value]) || key }),
    useRuntimeConfig: () => ({ public: { apiUrl: "https://api.example.test/api/", consultantKey: "test-widget-key" } }),
    useContactModal: () => ({ isOpen: Vue.ref(false), open: () => {} }),
    useConsultant, useRoute: () => route, useLocalePath: () => (path: string) => path,
    useTrackEvent: () => (event: string, params: any) => events.push({ event, params }),
    $fetch: async (url: string, options: any) => { calls.push({ url, ...options }); return respond(url, options); },
    window: { location: { origin: "https://esys.pro" } },
    localStorage: { getItem: (key: string) => storage.get(key), setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) },
    sessionStorage: { getItem: () => "seen" },
  };
  const previous = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  const props = Vue.reactive(initialProps);
  const app = renderer.createApp({ render: () => Vue.h(component, props) });
  app.mount({});
  const state = (app as any)._instance.subTree.component.setupState;
  return {
    state, calls, events, props, storage, locale,
    respond: (callback: typeof respond) => { respond = callback; },
    cleanup: () => {
      app.unmount();
      for (const key of Object.keys(globals)) {
        if (previous[key]) Object.defineProperty(globalThis, key, previous[key]!);
        else delete (globalThis as any)[key];
      }
    },
  };
}

async function settle() {
  for (let i = 0; i < 12; i++) await Vue.nextTick();
}

test("consultant widget contract, estimate lifecycle, queue and persistence", async () => {
  const component = await loadComponent("app/components/ConsultantWidget.vue");
  const f = await fixture(component);
  try {
    const shared = useConsultant();
    shared.startEstimate("landing");
    await settle();
    assert.equal(shared.isOpen.value, true);
    assert.equal(f.calls[0].url, "https://api.example.test/api/consultant/chat");
    assert.deepEqual(f.calls[0].headers, { "X-Widget-Key": "test-widget-key" });
    assert.equal(f.calls[0].body.message, translations.ru.consultant.estimate.starter);
    assert.equal(f.calls[0].body.locale, "ru");
    assert.equal(f.calls[0].body.context.suggested_service, "landing");
    assert.equal(f.calls[0].body.context.entry_point, "pricing");
    assert.deepEqual(f.state.messages.at(-1).estimate, estimate);
    assert.deepEqual(f.events.map(item => item.event), [
      "consultant_estimate_started", "consultant_estimate_shown", "consultant_estimate_manual_review",
    ]);
    f.state.markEstimateSent(estimate.estimate_id);
    await Vue.nextTick();
    const persisted = JSON.parse(f.storage.get("consultant_state")!);
    assert.deepEqual(Object.keys(persisted).sort(), ["messages", "session_id", "ts"]);
    assert.equal(persisted.messages.at(-1).sent, true);
    assert.deepEqual(persisted.messages.at(-1).estimate, estimate);

    await f.state.send("More features");
    assert.equal(f.calls[1].body.session_id, "session_fixture");
    assert.equal(f.events.filter(item => item.event === "consultant_estimate_recalculated").length, 1);
    f.respond(async () => { throw { data: { error: "Unavailable" }, statusCode: 503 }; });
    await f.state.send("Retry estimate");
    assert.equal(f.state.messages.at(-1).role, "error");
    assert.equal(f.events.at(-1).event, "consultant_estimate_error");
    assert.ok(f.events.every(item => !("message" in item.params) && !("session_id" in item.params)));

    f.state.newSession();
    assert.equal(shared.estimateStarted.value, false);
    f.respond(async () => ({ reply: "Old backend", session_id: "legacy" }));
    f.locale.value = "uz";
    await f.state.send("Salom");
    assert.equal(f.calls.at(-1).body.locale, "uz");
    assert.equal(f.state.messages.at(-1).estimate, null);

    let release: (value: unknown) => void = () => {};
    f.respond(() => new Promise(resolve => { release = resolve; }));
    const pending = f.state.send("Pending");
    await Vue.nextTick();
    shared.startEstimate("store");
    assert.equal(shared.estimateRequests.value.length, 1);
    f.respond(async () => ({ reply: "Queued reply", session_id: "legacy" }));
    release({ reply: "First reply", session_id: "legacy" });
    await pending;
    await settle();
    assert.equal(f.calls.at(-1).body.message, translations.uz.consultant.estimate.starter);
    assert.equal(f.calls.at(-1).body.context.suggested_service, "store");
    assert.equal(shared.estimateRequests.value.length, 0);
  } finally { f.cleanup(); }
});

test("restored estimate cards retain sent state and estimate-flow error tracking", async () => {
  const component = await loadComponent("app/components/ConsultantWidget.vue");
  const f = await fixture(component, {}, {
    session_id: "restored", messages: [{ role: "assistant", content: "Estimate", estimate, sent: true }], ts: Date.now(),
  });
  try {
    assert.equal(f.state.messages[0].sent, true);
    f.respond(async () => { throw new Error("offline"); });
    await f.state.send("Continue");
    assert.equal(f.events.at(-1).event, "consultant_estimate_error");
    assert.equal(f.events.at(-1).params.estimate_from, 4500000);
    f.state.newSession();
    const count = f.events.length;
    await f.state.send("General question");
    assert.equal(f.events.length, count, "ordinary chat errors are not estimate errors");
  } finally { f.cleanup(); }
});

test("estimate lead form validates consent, handles errors, and submits the exact lead contract", async () => {
  const component = await loadComponent("app/components/consultant/EstimateCard.vue");
  let sent = 0;
  const f = await fixture(component, { estimate, sessionId: "session_fixture", onSent: () => { sent++; } });
  try {
    assert.equal(f.state.price, "от 4 500 000 до 6 000 000 сум");
    await f.state.openForm();
    assert.equal(f.events[0].event, "consultant_estimate_contact_started");
    assert.equal(f.state.valid, false);
    f.state.form.name = "Test person";
    f.state.form.contact = "test-handle";
    assert.equal(f.state.valid, false, "consent is required");
    f.state.form.consent = true;
    assert.equal(f.state.valid, true);
    f.state.formElement = { reportValidity: () => true };
    f.state.form.contact_type = "email";
    assert.equal(f.state.contactInputType, "email");
    assert.equal(f.state.valid, false);
    f.state.form.contact = "test@.";
    assert.equal(f.state.valid, false);
    f.state.form.contact = "test@example.test";
    assert.equal(f.state.valid, true);
    f.state.form.contact = "test-handle";
    f.state.form.contact_type = "phone";
    assert.equal(f.state.contactInputType, "tel");
    f.state.form.contact_type = "telegram";

    f.respond(async () => { throw { statusCode: 422, data: { message: "Invalid", errors: { contact: ["Fix contact"] } } }; });
    await f.state.submit();
    assert.equal(f.state.errorsFor("contact"), "Fix contact");
    assert.equal(sent, 0);
    f.respond(async () => { throw { statusCode: 429 }; });
    await f.state.submit();
    assert.equal(f.state.fallback, true);
    assert.equal(f.state.error, translations.ru.consultant.estimate.throttled);
    f.respond(async () => { throw { statusCode: 404 }; });
    await f.state.submit();
    assert.equal(f.state.error, translations.ru.consultant.estimate.leadError);
    await f.state.closeForm();
    assert.equal(f.state.formOpen, false);
    assert.equal(sent, 0, "declining does not submit");
    await f.state.openForm();
    f.respond(async () => ({ success: true, id: 1 }));
    await f.state.submit();
    assert.equal(sent, 1);
    assert.equal(f.state.formOpen, false);
    assert.equal(f.calls.at(-1).url, "https://api.example.test/api/consultant/estimate-lead");
    assert.deepEqual(f.calls.at(-1).headers, { "X-Widget-Key": "test-widget-key" });
    assert.deepEqual(f.calls.at(-1).body, {
      session_id: "session_fixture", estimate_id: "est_fixture", name: "Test person",
      contact: "test-handle", contact_type: "telegram", consent: true, locale: "ru",
    });
    assert.equal(f.events.at(-1).event, "consultant_estimate_lead_submitted");
    assert.ok(f.events.every(item => !JSON.stringify(item.params).includes("test-handle")));
    (f.props as any).sent = true;
    await Vue.nextTick();
    const count = f.calls.length;
    await f.state.submit();
    assert.equal(f.calls.length, count, "a sent card cannot submit again");
  } finally { f.cleanup(); }
});

test("estimate lead submission survives collapsing the form and blocks overlapping submissions", async () => {
  const component = await loadComponent("app/components/consultant/EstimateCard.vue");
  let sent = 0;
  const f = await fixture(component, { estimate, sessionId: "session_fixture", onSent: () => { sent++; } });
  try {
    await f.state.openForm();
    Object.assign(f.state.form, { name: "Test", contact: "test-handle", consent: true });
    f.state.formElement = { reportValidity: () => true };
    let release: (value: unknown) => void = () => {};
    f.respond(() => new Promise(resolve => { release = resolve; }));
    const pending = f.state.submit();
    await f.state.submit();
    assert.equal(f.calls.length, 1);
    await f.state.closeForm();
    assert.equal(f.state.formOpen, false);
    release({ success: true, id: 1 });
    await pending;
    assert.equal(sent, 1);
    assert.equal(f.state.form.name, "");
    assert.equal(f.state.form.contact, "");
  } finally { f.cleanup(); }
});
