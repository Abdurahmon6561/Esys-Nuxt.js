import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileScript, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";

test("a contact modal opened before its lazy mount locks and focuses only after render", async () => {
  const { descriptor } = parse(readFileSync(new URL("../app/components/contact/Modal.vue", import.meta.url), "utf8"));
  const code = compileScript(descriptor, { id: "contact-modal" }).content
    .replace('from "vue"', `from ${JSON.stringify(import.meta.resolve("vue"))}`);
  const component = (await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`)).default;
  const isOpen = Vue.ref(true);
  const route = Vue.reactive({ fullPath: "/about" });
  const background = { inert: false };
  let rendered = false;
  let prematureLock = false;
  let overflow = "auto";
  const style = {
    get overflow() { return overflow; },
    set overflow(value: string) {
      if (value === "hidden" && !rendered) prematureLock = true;
      overflow = value;
    },
  };
  const document = Object.assign(new EventTarget(), {
    body: { style },
    activeElement: null as any,
    getElementById: () => background,
  });
  const trigger = { isConnected: true, focus: () => { document.activeElement = trigger; } };
  const input = { focus: () => { document.activeElement = input; } };
  const panel = {
    scrollTop: 44,
    querySelector: () => input,
    querySelectorAll: () => [],
    focus: () => {},
  };
  document.activeElement = trigger;
  const globals = {
    document,
    useContactModal: () => ({ isOpen, close: () => { isOpen.value = false; } }),
    useI18n: () => ({ t: (key: string) => key }),
    useRoute: () => route,
  };
  const previous = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  component.render = function () {
    rendered = true;
    this.$.setupState.panel = panel;
    return null;
  };
  const renderer = Vue.createRenderer({
    createComment: () => ({}), insert: () => {}, remove: () => {},
    createElement: () => ({}), createText: () => ({}), setText: () => {},
    setElementText: () => {}, patchProp: () => {}, parentNode: () => null, nextSibling: () => null,
  } as any);
  const app = renderer.createApp(component);
  try {
    app.mount({});
    await Vue.nextTick();
    assert.equal(prematureLock, false, "lazy setup must not lock/focus before template refs exist");
    assert.equal(overflow, "hidden");
    assert.equal(background.inert, true);
    assert.equal(panel.scrollTop, 0);
    assert.equal(document.activeElement, input);

    const escape = Object.assign(new Event("keydown", { cancelable: true }), { key: "Escape" });
    document.dispatchEvent(escape);
    await Vue.nextTick();
    assert.equal(isOpen.value, false);
    assert.equal(overflow, "auto");
    assert.equal(background.inert, false);
    assert.equal(document.activeElement, trigger);

    isOpen.value = true;
    await Vue.nextTick();
    await Vue.nextTick();
    assert.equal(document.activeElement, input, "subsequent opens still focus the retained form");
    route.fullPath = "/privacy";
    await Vue.nextTick();
    assert.equal(isOpen.value, false, "navigation still closes the modal");
    assert.equal(background.inert, false);
  } finally {
    app.unmount();
    for (const key of Object.keys(globals)) {
      if (previous[key]) Object.defineProperty(globalThis, key, previous[key]!);
      else delete (globalThis as any)[key];
    }
  }
});
