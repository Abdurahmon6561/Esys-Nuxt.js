// Helpers to keep heavy client-side work (WebGL, analytics, big libs) off
// the critical path. Hydration and first paint finish first; the deferred
// work runs when the main thread goes idle.

const INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"];

// Runs `callback` once, on the first of: browser idle, `timeout` elapsed,
// or first user interaction. Interaction counts because analytics must be
// live before the user does anything measurable. Returns a cancel function.
export function onIdleOrInteraction(callback, { timeout = 3000 } = {}) {
  if (typeof window === "undefined") return () => {};

  let fired = false;
  let idleId;

  const cleanup = () => {
    INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, fire));
    if (idleId === undefined) return;
    if ("cancelIdleCallback" in window) cancelIdleCallback(idleId);
    else clearTimeout(idleId);
  };

  const fire = () => {
    if (fired) return;
    fired = true;
    cleanup();
    callback();
  };

  INTERACTION_EVENTS.forEach((e) =>
    window.addEventListener(e, fire, { once: true, passive: true }),
  );
  idleId =
    "requestIdleCallback" in window
      ? requestIdleCallback(fire, { timeout })
      : setTimeout(fire, timeout); // Safari has no requestIdleCallback

  return () => {
    fired = true;
    cleanup();
  };
}

// Resolves when the browser is idle (or after `timeout`). Unlike
// onIdleOrInteraction, user input does NOT resolve early — decorative
// visuals must not compete with the user's first interaction.
export function waitForIdle({ timeout = 2500 } = {}) {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    if ("requestIdleCallback" in window) {
      requestIdleCallback(resolve, { timeout });
    } else {
      setTimeout(resolve, timeout);
    }
  });
}

// Resolves when `el` scrolls near the viewport. Falls back to immediate
// resolve when IntersectionObserver is unavailable.
export function waitForVisible(el, rootMargin = "200px") {
  return new Promise((resolve) => {
    if (
      typeof window === "undefined" ||
      !el ||
      !("IntersectionObserver" in window)
    ) {
      return resolve();
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        resolve();
      },
      { rootMargin },
    );
    io.observe(el);
  });
}
