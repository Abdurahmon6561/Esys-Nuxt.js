// Magnetic-hover effect for CTA buttons: element drifts toward the cursor
// while hovered, snaps back on leave. GSAP quickTo keeps it smooth + cheap.
// `.client.js` → SSR-safe. Skipped entirely under prefers-reduced-motion.
import { onMounted, onBeforeUnmount } from "vue";
import { gsap } from "gsap";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * @param {import('vue').Ref<HTMLElement|null>} elRef - template ref of the target
 * @param {number} [strength=0.35] - 0..1, how far the element follows the cursor
 */
export function useMagnetic(elRef, strength = 0.35) {
  let xTo = null;
  let yTo = null;
  let el = null;

  const onMove = (e) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    xTo(x * strength);
    yTo(y * strength);
  };

  const onLeave = () => {
    xTo?.(0);
    yTo?.(0);
  };

  const bind = (node) => {
    el = node;
    xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
  };

  const unbind = () => {
    el?.removeEventListener("pointermove", onMove);
    el?.removeEventListener("pointerleave", onLeave);
    el = null;
  };

  // Resolves a template ref to its DOM node. NuxtLink refs hand back a
  // component instance whose `$el` is the rendered <a>; plain elements come
  // through directly.
  const resolveEl = (v) => v?.$el ?? v ?? null;

  onMounted(() => {
    const node = resolveEl(elRef.value);
    if (!node) return;
    if (window.matchMedia(MOTION_QUERY).matches) return; // no magnetic under reduced motion
    bind(node);
  });

  onBeforeUnmount(unbind);
}
