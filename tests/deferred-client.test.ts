import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { onInteraction, onIdleOrInteraction } from "../app/composables/deferredInit.js";
import { shouldDeferMascot } from "../app/utils/mascot.js";

test("mascot waits for input on small, coarse-pointer, or reduced-motion clients", () => {
  for (const smallScreen of [false, true]) {
    for (const coarsePointer of [false, true]) {
      for (const reducedMotion of [false, true]) {
        assert.equal(
          shouldDeferMascot({ smallScreen, coarsePointer, reducedMotion }),
          smallScreen || coarsePointer || reducedMotion,
        );
      }
    }
  }
});

test("interaction-only initialization runs once, never on idle, and can be cancelled", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const target = new EventTarget();
  Object.defineProperty(globalThis, "window", { configurable: true, value: target });
  try {
    let calls = 0;
    const cancel = onInteraction(() => { calls++; });
    assert.equal(calls, 0, "registering the mascot must not load three");
    target.dispatchEvent(new Event("pointerdown"));
    target.dispatchEvent(new Event("touchstart"));
    target.dispatchEvent(new Event("keydown"));
    assert.equal(calls, 1, "touch/pointer compatibility events must not initialize twice");
    cancel();
    const cancelBeforeInput = onInteraction(() => { calls++; });
    cancelBeforeInput();
    target.dispatchEvent(new Event("wheel"));
    assert.equal(calls, 1, "unmounting removes pending interaction listeners");
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else delete (globalThis as any).window;
  }
});

test("idle-or-interaction initialization cleans up the losing idle callback", () => {
  const keys = ["window", "requestIdleCallback", "cancelIdleCallback"];
  const previous = keys.map(key => Object.getOwnPropertyDescriptor(globalThis, key));
  const target = new EventTarget() as any;
  let idle: () => void = () => {};
  let cancellations = 0;
  const request = (callback: () => void) => { idle = callback; return 42; };
  const cancel = (id: number) => { assert.equal(id, 42); cancellations++; };
  target.requestIdleCallback = request;
  target.cancelIdleCallback = cancel;
  Object.assign(globalThis, { window: target, requestIdleCallback: request, cancelIdleCallback: cancel });
  try {
    let calls = 0;
    const cleanup = onIdleOrInteraction(() => { calls++; });
    target.dispatchEvent(new Event("keydown"));
    idle();
    assert.equal(calls, 1);
    assert.equal(cancellations, 1);
    cleanup();
    const pending = onIdleOrInteraction(() => { calls++; });
    pending();
    idle();
    target.dispatchEvent(new Event("pointerdown"));
    assert.equal(calls, 1);
  } finally {
    keys.forEach((key, index) => {
      if (previous[index]) Object.defineProperty(globalThis, key, previous[index]!);
      else delete (globalThis as any)[key];
    });
  }
});

test("a deferred GSAP scope preserves motion branches and synchronous cleanup during navigation", async () => {
  // Substitute only the network boundary, exercising the real composable.
  const loader = `data:text/javascript,${encodeURIComponent(
    "export function loadGsapWithScrollTrigger() { return globalThis.__testGsapLoad(); }",
  )}`;
  const source = readFileSync(new URL("../app/composables/useGsap.client.js", import.meta.url), "utf8")
    .replace('"../utils/gsap.js"', JSON.stringify(loader));
  const { useGsapScope } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  let resolve: (value: any) => void = () => {};
  let revertCount = 0;
  let killCount = 0;
  let setupCount = 0;
  let mediaCallback: (context: any) => void = () => {};
  const root = {};
  const ScrollTrigger = {};
  const gsap = {
    matchMedia: () => ({
      add: (queries: any, callback: typeof mediaCallback, scope: unknown) => {
        assert.equal(scope, root);
        assert.equal(queries.reduceMotion, "(prefers-reduced-motion: reduce)");
        mediaCallback = callback;
        callback({ conditions: { reduceMotion: false } });
      },
      revert: () => { revertCount++; },
      kill: () => { killCount++; },
    }),
  };
  const previous = Object.getOwnPropertyDescriptor(globalThis, "__testGsapLoad");
  (globalThis as any).__testGsapLoad = () => new Promise(done => { resolve = done; });
  try {
    const abandoned = useGsapScope(() => { setupCount++; }, { value: root });
    abandoned.revert();
    resolve({ gsap, ScrollTrigger });
    await Promise.resolve();
    assert.equal(setupCount, 0, "a chunk arriving after unmount must not animate detached content");

    const branches: boolean[] = [];
    const scope = useGsapScope((api: any) => {
      assert.equal(api.gsap, gsap);
      assert.equal(api.ScrollTrigger, ScrollTrigger);
      branches.push(api.isReducedMotion);
    }, { value: root });
    resolve({ gsap, ScrollTrigger });
    await Promise.resolve();
    mediaCallback({ conditions: { reduceMotion: true } });
    assert.deepEqual(branches, [false, true]);
    scope.revert();
    assert.equal(revertCount, 1);

    const killed = useGsapScope(() => { setupCount++; }, root);
    killed.kill();
    resolve({ gsap, ScrollTrigger });
    await Promise.resolve();
    assert.equal(setupCount, 0);
    assert.equal(killCount, 0, "cancelled imports must not even create a media context");
  } finally {
    if (previous) Object.defineProperty(globalThis, "__testGsapLoad", previous);
    else delete (globalThis as any).__testGsapLoad;
  }
});
