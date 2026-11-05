<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({ active: Boolean, greeting: Number });
const host = ref(null);
const ready = ref(false);
let disposed = false;
let cleanup = () => {};
let sync = () => {};
let greet = () => {};
watch(() => props.active, () => sync());
watch(() => props.greeting, () => greet());

onMounted(async () => {
  let renderer;
  const geometries = new Set();
  const materials = new Set();
  let texture;
  const release = () => {
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    texture?.dispose();
    renderer?.dispose();
    renderer?.domElement.remove();
  };
  try {
    const THREE = await import('three');
    const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js');
    if (disposed) return;
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.value.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1.65, 1.65, 1.925, -1.925, 0.1, 20);
    camera.position.set(0, 0.25, 7);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x518c89, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(-3, 5, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x70ffdf, 1.6);
    rim.position.set(3, 1, -2);
    scene.add(rim);
    const material = (color, extra = {}) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.28, metalness: 0.12, ...extra });
      materials.add(m);
      return m;
    };
    const white = material(0xf4f8fa);
    const teal = material(0x1aab9a);
    const dark = material(0x071c28);
    const glow = material(0x79ffe2, { emissive: 0x39d9b6, emissiveIntensity: 1.3 });
    const robot = new THREE.Group();
    scene.add(robot);
    const mesh = (geometry, mat, x, y, z, parent = robot) => {
      geometries.add(geometry);
      const part = new THREE.Mesh(geometry, mat);
      part.position.set(x, y, z);
      parent.add(part);
      return part;
    };
    const box = (w, h, d, radius, mat, x, y, z, parent) =>
      mesh(new RoundedBoxGeometry(w, h, d, 3, radius), mat, x, y, z, parent);
    const ball = (r, mat, x, y, z, parent) => mesh(new THREE.SphereGeometry(r, 20, 16), mat, x, y, z, parent);
    box(1.2, 1, 0.75, 0.22, white, 0, -0.45, 0);
    box(0.9, 0.15, 0.65, 0.07, teal, 0, -0.95, 0);
    box(0.42, 0.28, 0.65, 0.12, white, -0.33, -1.17, 0.08);
    box(0.42, 0.28, 0.65, 0.12, white, 0.33, -1.17, 0.08);
    box(0.45, 0.23, 0.4, 0.08, teal, 0, 0.13, 0);
    // Separate joints let the face follow the pointer without turning the whole body.
    const head = new THREE.Group();
    head.position.set(0, 0.2, 0);
    robot.add(head);
    const headPartsStart = robot.children.length;
    box(1.65, 1.08, 0.9, 0.25, white, 0, 0.7, 0);
    box(1.36, 0.73, 0.15, 0.17, dark, 0, 0.69, 0.46);
    const eyes = [-0.32, 0.32].map(x => box(0.19, 0.27, 0.07, 0.08, glow, x, 0.74, 0.56));
    const smile = mesh(new THREE.TorusGeometry(0.16, 0.022, 8, 24, Math.PI), glow, 0, 0.51, 0.56);
    smile.rotation.z = Math.PI;
    for (const side of [-1, 1]) {
      ball(0.18, teal, side * 0.86, 0.69, 0);

    }
    robot.children.slice(headPartsStart).forEach(part => head.attach(part));
    const antenna = new THREE.Group();
    antenna.position.set(0, 1.2, 0);
    robot.add(antenna);
    const antennaPartsStart = robot.children.length;
    box(0.08, 0.25, 0.08, 0.035, teal, 0, 1.32, 0);
    ball(0.13, glow, 0, 1.49, 0);
    robot.children.slice(antennaPartsStart).forEach(part => antenna.attach(part));
    head.attach(antenna);
    for (const side of [-1, 1]) ball(0.17, teal, side * 0.66, -0.22, 0);
    const restingArm = box(0.26, 0.62, 0.3, 0.12, white, -0.79, -0.57, 0);
    const arm = new THREE.Group();
    arm.position.set(0.7, -0.22, 0);
    robot.add(arm);
    box(0.27, 0.56, 0.3, 0.12, white, 0, -0.28, 0, arm);
    ball(0.18, teal, 0, -0.62, 0, arm);
    const label = document.createElement('canvas');
    label.width = 256;
    label.height = 96;
    const ctx = label.getContext('2d');
    ctx.fillStyle = '#073c38';
    ctx.font = 'bold 66px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ESYS', 128, 70);
    texture = new THREE.CanvasTexture(label);
    texture.colorSpace = THREE.SRGBColorSpace;
    mesh(new THREE.PlaneGeometry(0.84, 0.315), material(0xffffff, { map: texture, transparent: true }), 0, -0.43, 0.385);

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let contextAvailable = true;
    let frame = 0;
    let elapsed = 0;
    let last = 0;
    let greetingStart = 0;
    const pointer = { x: 0, y: 0, present: false, dirty: false, movedAt: 0 };
    const target = { x: 0, y: 0, near: 0 };
    const follow = { x: 0, y: 0, near: 0 };
    const resetPointer = () => {
      pointer.present = false;
      target.x = target.y = target.near = 0;
    };
    const onPointerMove = (event) => {
      if (event.pointerType !== 'mouse' || motion.matches || !props.active || document.hidden) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.present = pointer.dirty = true;
      pointer.movedAt = elapsed;
    };
    const onPointerOut = (event) => { if (!event.relatedTarget) resetPointer(); };
    const updatePointer = (dt) => {
      if (pointer.present && elapsed - pointer.movedAt > 2.5) resetPointer();
      if (pointer.present && pointer.dirty) {
        // Read layout once per frame, even when a mouse emits several events.
        const bounds = host.value.getBoundingClientRect();
        const dx = pointer.x - (bounds.left + bounds.width / 2);
        const dy = pointer.y - (bounds.top + bounds.height * 0.38);
        target.x = Math.tanh(dx / 280);
        target.y = -Math.tanh(dy / 240);
        target.near = Math.max(0, 1 - Math.hypot(dx, dy) / 200);
        pointer.dirty = false;
      }
      const ease = 1 - Math.exp(-dt * 7);
      for (const key of ['x', 'y', 'near']) follow[key] += (target[key] - follow[key]) * ease;
    };
    const pose = () => {
      const staticPose = motion.matches;
      const progress = staticPose ? 1 : Math.min((elapsed - greetingStart) / 2.2, 1);
      const wave = progress < 1 ? Math.sin(progress * Math.PI) : 0;
      const x = staticPose ? 0 : follow.x;
      const y = staticPose ? 0 : follow.y;
      const near = staticPose ? 0 : follow.near;
      robot.rotation.y = staticPose ? -0.12 : -0.12 - 0.65 * (1 - progress) ** 3 + x * 0.13;
      head.rotation.y = x * 0.42;
      head.rotation.x = -y * 0.24;
      head.rotation.z = -x * near * 0.1;
      antenna.rotation.z = staticPose ? 0 : Math.sin(elapsed * 5) * (0.025 + near * 0.08);
      restingArm.rotation.z = -near * 0.18;
      robot.rotation.z = staticPose ? 0 : Math.sin(elapsed * 1.7) * 0.025 - x * 0.045;
      robot.position.y = staticPose ? 0 : Math.sin(elapsed * 2) * 0.045 + near * 0.06;
      arm.rotation.z = 0.2 + near * 0.55 * (1 - wave) + wave * (2.25 + 0.3 * Math.sin(progress * Math.PI * 10));
      const blink = !staticPose && elapsed % 4.5 > 4.32;
      eyes.forEach((eye, index) => {
        eye.position.x = (index === 0 ? -0.32 : 0.32) + x * 0.075;
        eye.position.y = 0.54 + y * 0.045;
        eye.scale.y = blink ? 0.12 : 1 + near * 0.16;
      });
    };
    const render = () => { pose(); renderer.render(scene, camera); ready.value = true; };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; last = 0; };
    const tick = (now) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      elapsed += dt;
      updatePointer(dt);
      last = now;
      render();
      frame = requestAnimationFrame(tick);
    };
    sync = () => {
      stop();
      resetPointer();
      if (motion.matches || !props.active || document.hidden) follow.x = follow.y = follow.near = 0;
      if (!props.active || document.hidden || !contextAvailable) return;
      render();
      if (!motion.matches) frame = requestAnimationFrame(tick);
    };
    greet = () => { if (!motion.matches) greetingStart = elapsed; };
    const resize = new ResizeObserver(() => {
      if (!props.active || document.hidden || !contextAvailable) return;
      const { width, height } = host.value.getBoundingClientRect();
      if (width && height) { renderer.setSize(width, height, false); sync(); }
    });
    resize.observe(host.value);
    const contextLost = (event) => { event.preventDefault(); contextAvailable = false; stop(); ready.value = false; };
    const contextRestored = () => { contextAvailable = true; sync(); };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerout', onPointerOut, { passive: true });
    window.addEventListener('blur', resetPointer);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    cleanup = () => {
      stop();
      resize.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('blur', resetPointer);
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
      release();
    };
    sync();
  } catch {
    release();
    ready.value = false;
  }
});
onBeforeUnmount(() => { disposed = true; cleanup(); });
</script>

<template>
  <span ref="host" class="mascot" aria-hidden="true">
    <svg v-show="!ready" viewBox="0 0 120 140" class="mascot__fallback">
      <ellipse cx="60" cy="132" rx="32" ry="5" fill="#052e2a" opacity=".18" />
      <g stroke="#12897b" stroke-width="2">
        <path d="M60 19V10" /><circle cx="60" cy="8" r="5" fill="#65e4cb" />
        <rect x="38" y="79" width="44" height="39" rx="12" fill="#e9f2f5" />
        <rect x="37" y="114" width="19" height="12" rx="5" fill="white" />
        <rect x="64" y="114" width="19" height="12" rx="5" fill="white" />
        <rect x="23" y="82" width="11" height="29" rx="5" fill="white" transform="rotate(12 28 82)" />
        <path d="M86 88Q103 83 102 62" fill="none" stroke="#e9f2f5" stroke-width="12" stroke-linecap="round" />
        <circle cx="102" cy="60" r="7" fill="#1aab9a" />
        <rect x="53" y="72" width="14" height="12" rx="4" fill="#1aab9a" />
        <rect x="20" y="22" width="80" height="54" rx="17" fill="#f4f8fa" />
        <rect x="27" y="30" width="66" height="37" rx="12" fill="#071c28" />
      </g>
      <g fill="#79ffe2"><rect x="40" y="40" width="8" height="13" rx="4" /><rect x="72" y="40" width="8" height="13" rx="4" /></g>
      <path d="M54 56Q60 62 66 56" fill="none" stroke="#79ffe2" stroke-width="2" stroke-linecap="round" />
      <text x="60" y="103" text-anchor="middle" fill="#073c38" font-size="12" font-weight="800" font-family="sans-serif">ESYS</text>
    </svg>
  </span>
</template>

<style scoped>
.mascot { display: block; width: 100%; height: 100%; pointer-events: none; }
.mascot__fallback, .mascot :deep(canvas) { position: absolute; inset: 0; width: 100%; height: 100%; }
</style>
