<script setup>
// Lightweight Vanta-style particle network (canvas 2D, no deps).
// Renders drifting dots connected by proximity lines. Used as a
// visual layer that obscures content behind it.
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  count: { type: Number, default: 90 },
  color: { type: String, default: "#9fd3ff" },
  maxRadius: { type: Number, default: 2.2 },
  linkDistance: { type: Number, default: 130 },
  speed: { type: Number, default: 0.35 },
});

const host = ref(null);
let canvas, ctx, raf, particles = [], dpr = 1;

function makeParticle(w, h) {
  const size = Math.max(6, Math.random() * props.maxRadius * 6);
  const shapes = ["cube", "triangle", "hexagon"];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * props.speed,
    vy: (Math.random() - 0.5) * props.speed,
    size,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.02,
  };
}

function resize() {
  const w = host.value.clientWidth;
  const h = host.value.clientHeight;
  dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(w * dpr));
  canvas.height = Math.max(1, Math.floor(h * dpr));
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Rebuild if count drift
  while (particles.length < props.count) particles.push(makeParticle(w, h));
  particles.length = props.count;
}

function step() {
  const w = host.value.clientWidth;
  const h = host.value.clientHeight;
  ctx.clearRect(0, 0, w, h);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vrot;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
  }

  // Shapes - outlined, rotating
  ctx.strokeStyle = props.color;
  ctx.lineWidth = 1.25;
  for (const p of particles) {
    drawShape(p);
  }

  raf = requestAnimationFrame(step);
}

function drawShape(p) {
  const s = p.size;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.beginPath();
  if (p.shape === "cube") {
    // 2D projection of a cube: square + offset square + connecting edges
    const half = s / 2;
    const off = s * 0.3;
    ctx.rect(-half, -half, s, s);
    ctx.moveTo(-half, -half);
    ctx.lineTo(-half + off, -half - off);
    ctx.moveTo(half, -half);
    ctx.lineTo(half + off, -half - off);
    ctx.moveTo(half, half);
    ctx.lineTo(half + off, half - off);
    ctx.moveTo(-half + off, -half - off);
    ctx.lineTo(half + off, -half - off);
    ctx.moveTo(half + off, -half - off);
    ctx.lineTo(half + off, half - off);
  } else if (p.shape === "triangle") {
    ctx.moveTo(0, -s / 2);
    ctx.lineTo(s / 2, s / 2);
    ctx.lineTo(-s / 2, s / 2);
    ctx.closePath();
  } else if (p.shape === "hexagon") {
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const x = Math.cos(a) * (s / 2);
      const y = Math.sin(a) * (s / 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  ctx.stroke();
  ctx.restore();
}

function hexToRgba(hex, alpha) {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

onMounted(() => {
  canvas = document.createElement("canvas");
  host.value.appendChild(canvas);
  ctx = canvas.getContext("2d");
  resize();
  step();
  window.addEventListener("resize", resize);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener("resize", resize);
  canvas?.remove();
});
</script>

<template>
  <div ref="host" class="particle-field" aria-hidden="true" />
</template>

<style scoped>
.particle-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.particle-field :deep(canvas) {
  display: block;
}
</style>