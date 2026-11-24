// Magnetic-hover effect for CTA buttons: element drifts toward the cursor
// while hovered, snaps back on leave. GSAP quickTo keeps it smooth + cheap.
// `.client.js` → SSR-safe. Skipped entirely under prefers-reduced-motion.
import { onMounted, onBeforeUnmount } from "vue";
import { loadGsap } from "../utils/gsap.js";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * @param {import('vue').Ref<HTMLElement|null>} elRef - template ref of the target
 * @param {number} [strength=0.35] - 0..1, how far the element follows the cursor
 */
export function useMagnetic(elRef, strength = 0.35) {
  let xTo = null;
  let yTo = null;
  let el = null;
  let target = null;
  let disposed = false;
  let hovered = false;
  let loading = false;
  let latestPointer = null;
  let xTween = null;
  let yTween = null;

  const onMove = (e) => {
    latestPointer = e;
    if (!el || !hovered) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    xTo(x * strength);
    yTo(y * strength);
  };

  const onLeave = () => {
    hovered = false;
    latestPointer = null;
    xTo?.(0);
    yTo?.(0);
  };

  const bind = (node, gsap) => {
    el = node;
    xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    xTween = xTo.tween;
    yTween = yTo.tween;
    if (latestPointer) onMove(latestPointer);
  };

  const onEnter = async (event) => {
    hovered = true;
    latestPointer = event;
    if (el || loading || window.matchMedia(MOTION_QUERY).matches) return;
    loading = true;
    try {
      const gsap = await loadGsap();
      if (!disposed && !window.matchMedia(MOTION_QUERY).matches) bind(target, gsap);
    } catch {
      // Keep the button usable if its optional animation chunk is unavailable.
    } finally {
      loading = false;
    }
  };

  const unbind = () => {
    disposed = true;
    target?.removeEventListener("pointerenter", onEnter);
    target?.removeEventListener("pointermove", onMove);
    target?.removeEventListener("pointerleave", onLeave);
    xTween?.kill();
    yTween?.kill();
    target = null;
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
    target = node;
    node.addEventListener("pointerenter", onEnter);
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
  });

  onBeforeUnmount(unbind);
}
