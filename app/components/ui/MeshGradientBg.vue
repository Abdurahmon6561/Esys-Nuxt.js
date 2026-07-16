<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// Ported from @paper-design/shaders-react <MeshGradient/> to Vue using the
// framework-agnostic core (`@paper-design/shaders`). WebGL → client-only.

const props = defineProps({
  colors: {
    type: Array,
    default: () => ["#000000", "#1a1a1a", "#333333", "#ffffff"],
  },
  speed: { type: Number, default: 1.0 },
  distortion: { type: Number, default: 0.8 },
  swirl: { type: Number, default: 0.6 },
});

const host = ref(null);
let mount = null;

onMounted(async () => {
  // Footer background — below the fold. Load the shader lib only when the
  // element approaches the viewport, and never before the thread is idle.
  await waitForVisible(host.value);
  await waitForIdle();
  if (!host.value) return; // unmounted while waiting

  const {
    ShaderMount,
    meshGradientFragmentShader,
    getShaderColorFromString,
    defaultObjectSizing,
    ShaderFitOptions,
  } = await import("@paper-design/shaders");

  const colors = props.colors.map((c) => getShaderColorFromString(c));
  const s = defaultObjectSizing;

  const uniforms = {
    u_colors: colors,
    u_colorsCount: colors.length,
    u_distortion: props.distortion,
    u_swirl: props.swirl,
    u_grainMixer: 0,
    u_grainOverlay: 0,
    u_fit: ShaderFitOptions.cover,
    u_scale: s.scale,
    u_rotation: s.rotation,
    u_offsetX: s.offsetX,
    u_offsetY: s.offsetY,
    u_originX: s.originX,
    u_originY: s.originY,
    u_worldWidth: s.worldWidth,
    u_worldHeight: s.worldHeight,
  };

  mount = new ShaderMount(
    host.value,
    meshGradientFragmentShader,
    uniforms,
    undefined,
    props.speed,
  );
});

onBeforeUnmount(() => mount?.dispose());
</script>

<template>
  <div ref="host" class="mesh-bg" aria-hidden="true" />
</template>

<style scoped>
.mesh-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.mesh-bg :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
