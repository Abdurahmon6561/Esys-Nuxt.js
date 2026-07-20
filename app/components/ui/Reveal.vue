<script setup>
// Scroll-reveal wrapper: fades + rises its content once it enters the viewport.
// GSAP + ScrollTrigger via the shared useGsap client composable. Respects
// prefers-reduced-motion (shows immediately, no animation). API unchanged
// from the old IO+CSS version, so all call sites keep working.
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  tag: { type: String, default: "div" },
  // Viewport ratio at which the reveal fires (passed to ScrollTrigger start).
  threshold: { type: Number, default: 0.15 },
  // Delay (ms) before the tween runs - lets a grid stagger children.
  delay: { type: Number, default: 0 },
});

const root = ref(null);
let scope = null;

onMounted(() => {
  if (!root.value) return;

  scope = useGsapScope(({ gsap, ScrollTrigger, isReducedMotion }) => {
    if (isReducedMotion) {
      gsap.set(root.value, { opacity: 1, y: 0 });
      return;
    }

    // `start` maps the threshold prop to the scrollTrigger entry point:
    // threshold 0.15 → top 85% (enter when 15% past the top of viewport).
    const startPct = Math.round((1 - props.threshold) * 100);
    gsap.from(root.value, {
      opacity: 0,
      y: 32,
      duration: 0.7,
      ease: "power2.out",
      delay: props.delay / 1000,
      scrollTrigger: {
        trigger: root.value,
        start: `top ${startPct}%`,
        once: true,
      },
      // will-change promotes the element to its own compositor layer. The
      // reveal runs once, so holding the hint forever leaks a layer per
      // element — dozens on a long page — and the page degrades the longer
      // it stays open. Apply it only for the duration of the tween.
      onStart: () => {
        root.value.style.willChange = "opacity, transform";
      },
      onComplete: () => {
        root.value.style.willChange = "auto";
      },
    });
  }, root);
});

onBeforeUnmount(() => {
  scope?.revert();
  scope = null;
});
</script>

<template>
  <component :is="tag" ref="root" class="ui-reveal">
    <slot />
  </component>
</template>

<style scoped>
/* No transition styles here — GSAP owns the motion. The class is kept as a
   styling hook for consumers and so reduced-motion users see content (GSAP
   sets opacity:1 immediately in that branch).
   will-change is applied by the tween's onStart and cleared onComplete — it
   must NOT live here, or every revealed element keeps a compositor layer for
   the lifetime of the page. */
</style>