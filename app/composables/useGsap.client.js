// Single source of truth for GSAP + ScrollTrigger on the client.
// `.client.js` → skipped during SSR, so `window`/`gsap` are safe to touch.
//
// Components import this instead of `gsap` directly so plugin registration,
// scope cleanup, and the reduced-motion contract live in one place.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Run a GSAP setup function inside a `gsap.matchMedia()` context.
 *
 * Why matchMedia (not gsap.context + manual matchMedia): matchMedia is the
 * documented best practice — it creates its own context internally, scopes
 * selector text to the root element, and **auto-reverts** the animations +
 * ScrollTriggers created in each branch when the query stops matching
 * (e.g. user toggles prefers-reduced-motion mid-session).
 *
 * @param {(api: { gsap, ScrollTrigger, isReducedMotion: boolean }) => void} setup - called once per matching branch
 * @param {import('vue').Ref|Element} [elOrRef] - scope root (ref or DOM node). Defaults to document.
 * @returns {{ revert: () => void, kill: () => void }} cleanup handle
 *
 * Example:
 *   const root = ref(null);
 *   onMounted(() => useGsapScope(({ gsap }) => {
 *     gsap.from(root.value, { opacity: 0, y: 32 });
 *   }, root));
 *   onBeforeUnmount(() => scope.revert());
 */
export function useGsapScope(setup, elOrRef) {
  // matchMedia's scope arg expects a DOM element (or selector) — a Vue ref
  // is neither, so unwrap. Falls back to document when nothing passed.
  const scopeEl =
    !elOrRef || typeof elOrRef === "string"
      ? elOrRef
      : "value" in elOrRef
        ? elOrRef.value
        : elOrRef;

  const mm = gsap.matchMedia();

  mm.add(
    {
      full: "(prefers-reduced-motion: no-preference)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (ctx) => {
      const isReducedMotion = ctx.conditions.reduceMotion;
      setup({ gsap, ScrollTrigger, isReducedMotion });
    },
    scopeEl || document,
  );

  return {
    revert: () => mm.revert(),
    kill: () => mm.kill(),
  };
}

export function useGsap() {
  return { gsap, ScrollTrigger };
}
