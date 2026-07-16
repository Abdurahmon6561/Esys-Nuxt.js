<script setup>
// Three.js cosmos: shader starfield (twinkle + slow drift), a rocket with the
// site logo flying bottom-left <-> top-right (ping-pong), and an ISS-style
// station with the logo drifting across the upper sky.
// Client-only: three is dynamically imported inside onMounted.

const containerRef = ref(null);

const STAR_COUNT = 1600;
const FLY_DURATION = 36; // seconds one way
const END_PAUSE = 2.5; // seconds hidden off-screen at bottom-left
const TOP_HOLD = 2.5; // seconds visible hold at the top-right destination
const STATION_DURATION = 70; // seconds for one station crossing
const STATION_PAUSE = 6;
const STATION_START_OFFSET = STATION_DURATION * 0.18; // begin mid-crossing so visible at load
const TRAIL_COUNT = 90;
const CAMERA_Z = 120;

let cleanup = null;

const STAR_VERTEX = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 0.62 + 0.38 * sin(uTime * aSpeed + aPhase);
    vAlpha = tw;
    vColor = aColor;
    gl_PointSize = aSize * uPixelRatio * (140.0 / -mv.z) * (0.85 + 0.3 * tw);
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAGMENT = `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const TRAIL_VERTEX = `
  attribute float aAlpha;
  attribute float aSize;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vAlpha = aAlpha;
    gl_PointSize = aSize * uPixelRatio * (140.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const TRAIL_FRAGMENT = `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(0.49, 0.91, 0.89, a * vAlpha);
  }
`;

function loadLogo() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/images/logo.webp";
  });
}

// Rocket pointing up. Cylindrical hull with metallic shading, panel lines,
// rivets, portholes, interstage rings, and a clustered bell-nozzle engine.
// Logo sits vertically (rotated 90°) on a dark body band so the light logo
// stays readable against the silver hull.
function drawRocketCanvas(logo) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext("2d");
  const cx = 128;

  const bodyL = cx - 60;
  const bodyR = cx + 60;

  // ---- Boattail / engine section flare ----
  ctx.fillStyle = "#cdd6de";
  ctx.beginPath();
  ctx.moveTo(bodyL, 404);
  ctx.lineTo(bodyR, 404);
  ctx.lineTo(cx + 40, 430);
  ctx.lineTo(cx - 40, 430);
  ctx.closePath();
  ctx.fill();

  // ---- Fins (carbon-fiber dark) ----
  const finGrad = ctx.createLinearGradient(cx - 110, 360, cx - 56, 418);
  finGrad.addColorStop(0, "#2a323d");
  finGrad.addColorStop(1, "#56636f");
  const drawFin = (side) => {
    const s = side;
    ctx.fillStyle = finGrad;
    ctx.beginPath();
    ctx.moveTo(cx + s * 56, 330);
    ctx.quadraticCurveTo(cx + s * 118, 400, cx + s * 100, 462);
    ctx.quadraticCurveTo(cx + s * 70, 430, cx + s * 56, 418);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(10,14,20,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  drawFin(-1);
  drawFin(1);

  // ---- Main hull (metallic cylinder with specular streak) ----
  const bodyGrad = ctx.createLinearGradient(bodyL, 0, bodyR, 0);
  bodyGrad.addColorStop(0, "#9aa6b2");
  bodyGrad.addColorStop(0.12, "#d6dde4");
  bodyGrad.addColorStop(0.28, "#f7fbfd");
  bodyGrad.addColorStop(0.42, "#e3eaef");
  bodyGrad.addColorStop(0.7, "#c2ccd5");
  bodyGrad.addColorStop(1, "#8895a1");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(cx, 18);
  ctx.bezierCurveTo(cx + 66, 90, cx + 62, 250, cx + 48, 430);
  ctx.lineTo(cx - 48, 430);
  ctx.bezierCurveTo(cx - 62, 250, cx - 66, 90, cx, 18);
  ctx.closePath();
  ctx.fill();

  // Edge shadow lines on hull sides
  ctx.strokeStyle = "rgba(30,38,48,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 58, 80);
  ctx.lineTo(cx - 46, 420);
  ctx.moveTo(cx + 58, 80);
  ctx.lineTo(cx + 46, 420);
  ctx.stroke();

  // ---- Nose cone (teal, glossy) ----
  const noseGrad = ctx.createLinearGradient(cx - 60, 0, cx + 60, 0);
  noseGrad.addColorStop(0, "#1d8c93");
  noseGrad.addColorStop(0.4, "#46e6e1");
  noseGrad.addColorStop(0.55, "#aef7f4");
  noseGrad.addColorStop(0.7, "#46e6e1");
  noseGrad.addColorStop(1, "#1d8c93");
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.moveTo(cx, 18);
  ctx.bezierCurveTo(cx + 52, 74, cx + 58, 108, cx + 60, 130);
  ctx.lineTo(cx - 60, 130);
  ctx.bezierCurveTo(cx - 58, 108, cx - 52, 74, cx, 18);
  ctx.closePath();
  ctx.fill();
  // Cone-body junction ring
  ctx.fillStyle = "#2fb4bd";
  ctx.fillRect(cx - 60, 128, 120, 6);
  ctx.strokeStyle = "rgba(10,40,42,0.5)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - 60, 128, 120, 6);

  // ---- Interstage rings + panel lines ----
  ctx.strokeStyle = "rgba(40,50,60,0.28)";
  ctx.lineWidth = 1.5;
  for (const y of [138, 248, 348, 404]) {
    ctx.beginPath();
    ctx.moveTo(cx - 58, y);
    ctx.quadraticCurveTo(cx, y + 4, cx + 58, y);
    ctx.stroke();
  }
  // Rivets along the body edges
  ctx.fillStyle = "rgba(60,72,84,0.5)";
  for (let y = 160; y < 400; y += 18) {
    const r = Math.max(0, Math.min(1, (y - 18) / 412));
    const halfW = 58 * (1 - r * 0.22);
    ctx.beginPath();
    ctx.arc(cx - halfW + 5, y, 1.4, 0, Math.PI * 2);
    ctx.arc(cx + halfW - 5, y, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- Porthole windows (above logo band) ----
  for (const wy of [172, 206]) {
    const halfW = 58 * (1 - (wy - 18) / 412 * 0.22);
    const winGrad = ctx.createRadialGradient(cx, wy - 2, 1, cx, wy, 8);
    winGrad.addColorStop(0, "#cdeef0");
    winGrad.addColorStop(0.5, "#2fb4bd");
    winGrad.addColorStop(1, "#0b3a3c");
    ctx.fillStyle = winGrad;
    ctx.beginPath();
    ctx.arc(cx, wy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a4552";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ---- Dark band along the body with the logo laid out vertically ----
  const bandTop = 238;
  const bandBottom = 388;
  const bandGrad = ctx.createLinearGradient(cx - 42, 0, cx + 42, 0);
  bandGrad.addColorStop(0, "#05080f");
  bandGrad.addColorStop(0.5, "#0b1220");
  bandGrad.addColorStop(1, "#05080f");
  ctx.fillStyle = bandGrad;
  ctx.beginPath();
  ctx.roundRect(cx - 42, bandTop, 84, bandBottom - bandTop, 20);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#2fb4bd";
  ctx.stroke();
  // Inner bevel highlight
  ctx.strokeStyle = "rgba(70,230,225,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(cx - 39, bandTop + 3, 78, bandBottom - bandTop - 6, 17);
  ctx.stroke();

  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - 38, bandTop + 6, 76, bandBottom - bandTop - 12, 16);
    ctx.clip();
    // Rotate 90° CCW so the logo reads tail-to-nose along the hull
    // (left-to-right on screen while the rocket climbs to the top-right).
    ctx.translate(cx, (bandTop + bandBottom) / 2);
    ctx.rotate(-Math.PI / 2);
    const maxW = bandBottom - bandTop - 28; // logo width runs along body height
    const maxH = 68; // logo height runs across body width
    const s = Math.min(maxW / logo.width, maxH / logo.height);
    const w = logo.width * s;
    const h = logo.height * s;
    ctx.drawImage(logo, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // ---- Engine section: clustered bell nozzles ----
  const drawNozzle = (nx, r) => {
    const top = 430;
    const bottom = 430 + r * 1.25;
    const bellGrad = ctx.createLinearGradient(nx - r, 0, nx + r, 0);
    bellGrad.addColorStop(0, "#2a323c");
    bellGrad.addColorStop(0.5, "#6b7682");
    bellGrad.addColorStop(1, "#1c222a");
    ctx.fillStyle = bellGrad;
    ctx.beginPath();
    ctx.moveTo(nx - r * 0.55, top);
    ctx.lineTo(nx + r * 0.55, top);
    ctx.lineTo(nx + r, bottom);
    ctx.lineTo(nx - r, bottom);
    ctx.closePath();
    ctx.fill();
    // Inner throat shadow
    ctx.fillStyle = "#070b10";
    ctx.beginPath();
    ctx.ellipse(nx, bottom - 2, r * 0.78, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Rim highlight
    ctx.strokeStyle = "rgba(180,195,208,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(nx, bottom - 1, r * 0.85, r * 0.16, 0, 0, Math.PI * 2);
    ctx.stroke();
  };
  drawNozzle(cx, 20);
  drawNozzle(cx - 30, 11);
  drawNozzle(cx + 30, 11);

  return c;
}

function drawFlameCanvas() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext("2d");

  // Outer plume (teal, soft)
  const outer = ctx.createRadialGradient(64, 60, 6, 64, 90, 135);
  outer.addColorStop(0, "rgba(180, 245, 240, 0.85)");
  outer.addColorStop(0.4, "rgba(47, 180, 189, 0.5)");
  outer.addColorStop(1, "rgba(47, 180, 189, 0)");
  ctx.fillStyle = outer;
  ctx.beginPath();
  ctx.moveTo(64, 6);
  ctx.bezierCurveTo(116, 60, 100, 170, 64, 250);
  ctx.bezierCurveTo(28, 170, 12, 60, 64, 6);
  ctx.closePath();
  ctx.fill();

  // Inner hot core (white→pale-yellow)
  const core = ctx.createLinearGradient(0, 0, 0, 200);
  core.addColorStop(0, "rgba(255, 255, 255, 1)");
  core.addColorStop(0.25, "rgba(255, 246, 214, 0.95)");
  core.addColorStop(0.6, "rgba(255, 196, 120, 0.55)");
  core.addColorStop(1, "rgba(255, 140, 80, 0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.moveTo(64, 12);
  ctx.bezierCurveTo(92, 56, 84, 150, 64, 220);
  ctx.bezierCurveTo(44, 150, 36, 56, 64, 12);
  ctx.closePath();
  ctx.fill();

  // Mach-diamond shock diamonds down the jet
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 3; i++) {
    const cy = 70 + i * 55;
    const r = 9 - i * 1.5;
    const d = ctx.createRadialGradient(64, cy, 1, 64, cy, r);
    d.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    d.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = d;
    ctx.beginPath();
    ctx.arc(64, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  return c;
}

// ISS-style station: central truss with cross-braced girders, dark-blue
// solar wings with realistic cell grid, white habitation modules with
// window rows, radiator panels, logo on a dark plate on the core module.
function drawStationCanvas(logo) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");
  const cy = 128;

  // ---- Solar wings: dark-blue cells, gold substrate, multi-panel ----
  const drawSolarWing = (x) => {
    const drawPanel = (top, bottom) => {
      // Gold substrate backing
      const goldGrad = ctx.createLinearGradient(x, 0, x + 96, 0);
      goldGrad.addColorStop(0, "#8a6a34");
      goldGrad.addColorStop(0.5, "#c9a558");
      goldGrad.addColorStop(1, "#8a6a34");
      ctx.fillStyle = goldGrad;
      ctx.fillRect(x, top, 96, bottom - top);
      // Anti-reflective blue cell layer
      const cellGrad = ctx.createLinearGradient(x, top, x, bottom);
      cellGrad.addColorStop(0, "#1a2440");
      cellGrad.addColorStop(0.5, "#2c3e6b");
      cellGrad.addColorStop(1, "#16203a");
      ctx.fillStyle = cellGrad;
      ctx.fillRect(x + 2, top + 2, 92, bottom - top - 4);
      // Specular sheen streak
      ctx.fillStyle = "rgba(150,180,255,0.10)";
      ctx.fillRect(x + 2, top + 2, 22, bottom - top - 4);
      // Cell grid (4 cols x N rows)
      ctx.strokeStyle = "rgba(10,16,30,0.85)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const colW = 92 / 4;
      for (let gx = 1; gx < 4; gx++) {
        ctx.moveTo(x + 2 + gx * colW, top + 2);
        ctx.lineTo(x + 2 + gx * colW, bottom - 2);
      }
      const rows = Math.floor((bottom - top - 4) / 10);
      const rowH = (bottom - top - 4) / rows;
      for (let gy = 1; gy < rows; gy++) {
        ctx.moveTo(x + 2, top + 2 + gy * rowH);
        ctx.lineTo(x + 94, top + 2 + gy * rowH);
      }
      ctx.stroke();
      // Frame
      ctx.strokeStyle = "rgba(20,16,8,0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, top, 96, bottom - top);
      // Mast to truss
      const mastGrad = ctx.createLinearGradient(x, 0, x + 96, 0);
      mastGrad.addColorStop(0, "#6a7480");
      mastGrad.addColorStop(0.5, "#aab4be");
      mastGrad.addColorStop(1, "#6a7480");
      ctx.fillStyle = mastGrad;
      ctx.fillRect(x + 44, cy - 16, 8, 32);
    };
    drawPanel(26, cy - 12);
    drawPanel(cy + 12, 230);
  };

  drawSolarWing(18);
  drawSolarWing(398);

  // ---- Truss: twin rails with X cross-bracing girders ----
  const railGrad = ctx.createLinearGradient(0, cy - 8, 0, cy + 8);
  railGrad.addColorStop(0, "#c0cad4");
  railGrad.addColorStop(0.5, "#8a95a1");
  railGrad.addColorStop(1, "#5e6873");
  ctx.fillStyle = railGrad;
  ctx.fillRect(30, cy - 7, 452, 4);
  ctx.fillRect(30, cy + 3, 452, 4);
  // X-bracing
  ctx.strokeStyle = "rgba(120,132,146,0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let tx = 30; tx < 482; tx += 18) {
    ctx.moveTo(tx, cy - 7);
    ctx.lineTo(tx + 18, cy + 7);
    ctx.moveTo(tx + 18, cy - 7);
    ctx.lineTo(tx, cy + 7);
  }
  ctx.stroke();
  // Joints
  ctx.fillStyle = "#4a5360";
  for (let tx = 30; tx < 482; tx += 18) {
    ctx.beginPath();
    ctx.arc(tx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- Radiator panels (white, faintly striped) ----
  const radGrad = ctx.createLinearGradient(150, 0, 164, 0);
  radGrad.addColorStop(0, "#e9eef3");
  radGrad.addColorStop(1, "#bcc6d0");
  ctx.fillStyle = radGrad;
  ctx.fillRect(150, cy - 58, 14, 44);
  ctx.fillRect(348, cy + 14, 14, 44);
  ctx.strokeStyle = "rgba(150,162,176,0.5)";
  ctx.lineWidth = 1;
  for (let ry = 0; ry < 44; ry += 8) {
    ctx.beginPath();
    ctx.moveTo(150, cy - 58 + ry);
    ctx.lineTo(164, cy - 58 + ry);
    ctx.moveTo(348, cy + 14 + ry);
    ctx.lineTo(362, cy + 14 + ry);
    ctx.stroke();
  }

  // ---- Horizontal module with windows ----
  const modGrad = ctx.createLinearGradient(0, cy - 26, 0, cy + 26);
  modGrad.addColorStop(0, "#f7fbfd");
  modGrad.addColorStop(0.45, "#dde6ed");
  modGrad.addColorStop(0.7, "#c3cdd6");
  modGrad.addColorStop(1, "#8b97a3");
  ctx.fillStyle = modGrad;
  ctx.beginPath();
  ctx.roundRect(178, cy - 26, 156, 52, 24);
  ctx.fill();
  // End rings
  ctx.strokeStyle = "rgba(40,50,60,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(192, cy - 26);
  ctx.lineTo(192, cy + 26);
  ctx.moveTo(320, cy - 26);
  ctx.lineTo(320, cy + 26);
  ctx.stroke();
  // Window row
  for (let i = 0; i < 5; i++) {
    const wx = 200 + i * 22;
    const wg = ctx.createRadialGradient(wx, cy - 6, 1, wx, cy - 6, 5);
    wg.addColorStop(0, "#bfe9ec");
    wg.addColorStop(1, "#0b3a3c");
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.arc(wx, cy - 6, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(60,72,84,0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ---- Perpendicular module with windows ----
  const vertGrad = ctx.createLinearGradient(232, 0, 280, 0);
  vertGrad.addColorStop(0, "#eef4f8");
  vertGrad.addColorStop(0.5, "#d2dbe4");
  vertGrad.addColorStop(1, "#a6b3bf");
  ctx.fillStyle = vertGrad;
  ctx.beginPath();
  ctx.roundRect(236, 52, 40, 152, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(40,50,60,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(236, 66);
  ctx.lineTo(276, 66);
  ctx.moveTo(236, 190);
  ctx.lineTo(276, 190);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const wy = 78 + i * 28;
    const wg = ctx.createRadialGradient(256, wy, 1, 256, wy, 4);
    wg.addColorStop(0, "#bfe9ec");
    wg.addColorStop(1, "#0b3a3c");
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.arc(256, wy, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- Docking cone ----
  const dockGrad = ctx.createLinearGradient(334, 0, 356, 0);
  dockGrad.addColorStop(0, "#aab4be");
  dockGrad.addColorStop(1, "#6f7a86");
  ctx.fillStyle = dockGrad;
  ctx.beginPath();
  ctx.roundRect(334, cy - 12, 22, 24, 6);
  ctx.fill();
  ctx.fillStyle = "#1a222a";
  ctx.beginPath();
  ctx.ellipse(345, cy, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- Logo plate on the core module ----
  const plateGrad = ctx.createRadialGradient(256, cy, 4, 256, cy, 30);
  plateGrad.addColorStop(0, "#0b1220");
  plateGrad.addColorStop(1, "#04070d");
  ctx.beginPath();
  ctx.arc(256, cy, 30, 0, Math.PI * 2);
  ctx.fillStyle = plateGrad;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#2fb4bd";
  ctx.stroke();
  ctx.strokeStyle = "rgba(70,230,225,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(256, cy, 27, 0, Math.PI * 2);
  ctx.stroke();
  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(256, cy, 25, 0, Math.PI * 2);
    ctx.clip();
    const s = Math.min(46 / logo.width, 46 / logo.height);
    const w = logo.width * s;
    const h = logo.height * s;
    ctx.drawImage(logo, 256 - w / 2, cy - h / 2, w, h);
    ctx.restore();
  }

  return c;
}

async function initScene(container) {
  const THREE = await import("three");
  const logo = await loadLogo();

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    400
  );
  camera.position.z = CAMERA_Z;

  // Visible world-plane size at z=0
  const view = { h: 0, w: 0 };
  const updateView = () => {
    view.h = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(55 / 2));
    view.w = view.h * camera.aspect;
  };
  updateView();

  // ---------- Starfield ----------
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const phases = new Float32Array(STAR_COUNT);
  const speeds = new Float32Array(STAR_COUNT);
  const colors = new Float32Array(STAR_COUNT * 3);
  const palette = [
    [0.87, 0.91, 0.95], // white
    [0.87, 0.91, 0.95],
    [0.87, 0.91, 0.95],
    [0.67, 0.78, 1.0], // blue-white
    [1.0, 0.85, 0.66], // warm
    [0.49, 0.91, 0.89], // brand teal
  ];
  const spread = view.h * 2.1;
  for (let i = 0; i < STAR_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread * 1.8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = -70 + Math.random() * 100;
    sizes[i] = 0.5 + Math.pow(Math.random(), 2.5) * 2.1;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.3 + Math.random() * 1.1;
    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = col[0];
    colors[i * 3 + 1] = col[1];
    colors[i * 3 + 2] = col[2];
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  starGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  starGeo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
  starGeo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

  const starUniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
  };
  const starMat = new THREE.ShaderMaterial({
    uniforms: starUniforms,
    vertexShader: STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ---------- Rocket ----------
  const rocketTex = new THREE.CanvasTexture(drawRocketCanvas(logo));
  rocketTex.colorSpace = THREE.SRGBColorSpace;
  const flameTex = new THREE.CanvasTexture(drawFlameCanvas());
  flameTex.colorSpace = THREE.SRGBColorSpace;

  const rocketHeight = view.h * 0.11;
  const rocketMat = new THREE.MeshBasicMaterial({
    map: rocketTex,
    transparent: true,
    depthWrite: false,
  });
  const rocketBody = new THREE.Mesh(
    new THREE.PlaneGeometry(rocketHeight / 2, rocketHeight),
    rocketMat
  );
  const flameMat = new THREE.MeshBasicMaterial({
    map: flameTex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const flame = new THREE.Mesh(
    new THREE.PlaneGeometry(rocketHeight * 0.26, rocketHeight * 0.55),
    flameMat
  );
  flame.position.y = -rocketHeight * 0.72;
  const rocket = new THREE.Group();
  rocket.add(rocketBody);
  rocket.add(flame);
  scene.add(rocket);

  // ---------- Station (ISS) ----------
  const stationTex = new THREE.CanvasTexture(drawStationCanvas(logo));
  stationTex.colorSpace = THREE.SRGBColorSpace;
  const stationW = view.h * 0.12;
  const stationMat = new THREE.MeshBasicMaterial({
    map: stationTex,
    transparent: true,
    depthWrite: false,
  });
  const station = new THREE.Mesh(
    new THREE.PlaneGeometry(stationW, stationW / 2),
    stationMat
  );
  station.position.z = 4;
  scene.add(station);

  // ---------- Shooting star (fast streak across the sky) ----------
  const drawStreakCanvas = () => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 32;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,255,255,0.95)");
    g.addColorStop(1, "rgba(180,235,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 32);
    // Hot core
    const cg = ctx.createLinearGradient(0, 0, 256, 0);
    cg.addColorStop(0.35, "rgba(255,255,255,0)");
    cg.addColorStop(0.5, "rgba(255,255,255,1)");
    cg.addColorStop(0.65, "rgba(255,255,255,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 12, 256, 8);
    return c;
  };
  const streakTex = new THREE.CanvasTexture(drawStreakCanvas());
  streakTex.colorSpace = THREE.SRGBColorSpace;
  const streakLen = view.h * 0.14;
  const streakMat = new THREE.MeshBasicMaterial({
    map: streakTex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const streak = new THREE.Mesh(
    new THREE.PlaneGeometry(streakLen, streakLen * 0.05),
    streakMat
  );
  streak.position.z = 5;
  scene.add(streak);
  const SHOOT_INTERVAL = 6; // seconds between shots (plus random jitter)
  const SHOOT_LIFE = 0.9; // seconds a streak is visible
  const shoot = {
    active: false,
    next: 2 + Math.random() * 3, // first shot delay
    t: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
  };
  streakMat.opacity = 0;

  const fireShoot = () => {
    // Start somewhere along the upper edge, fly down-right (or random side).
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -view.w * 0.5 : view.w * 0.5;
    const startY = view.h * (0.25 + Math.random() * 0.2);
    const endX = fromLeft ? view.w * 0.5 : -view.w * 0.5;
    const endY = -view.h * (0.1 + Math.random() * 0.25);
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.hypot(dx, dy);
    const speed = dist / SHOOT_LIFE;
    shoot.active = true;
    shoot.t = 0;
    shoot.x = startX;
    shoot.y = startY;
    shoot.vx = (dx / dist) * speed;
    shoot.vy = (dy / dist) * speed;
    shoot.angle = Math.atan2(dy, dx);
  };

  const updateShoot = (dt, elapsed) => {
    if (!shoot.active) {
      shoot.next -= dt;
      if (shoot.next <= 0) {
        fireShoot();
        shoot.next = SHOOT_INTERVAL + Math.random() * 4;
      }
      return;
    }
    shoot.t += dt;
    shoot.x += shoot.vx * dt;
    shoot.y += shoot.vy * dt;
    streak.position.set(shoot.x, shoot.y, 5);
    streak.rotation.z = shoot.angle;
    // Fade in fast, hold, fade out near end.
    const fIn = Math.min(shoot.t / 0.08, 1);
    const fOut = Math.min((SHOOT_LIFE - shoot.t) / 0.2, 1);
    streakMat.opacity = Math.max(0, Math.min(fIn, fOut));
    if (shoot.t >= SHOOT_LIFE) {
      shoot.active = false;
      streakMat.opacity = 0;
    }
  };

  // ---------- Exhaust trail ----------
  const trailGeo = new THREE.BufferGeometry();
  const trailPos = new Float32Array(TRAIL_COUNT * 3);
  const trailAlpha = new Float32Array(TRAIL_COUNT);
  const trailSize = new Float32Array(TRAIL_COUNT);
  trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
  trailGeo.setAttribute("aAlpha", new THREE.BufferAttribute(trailAlpha, 1));
  trailGeo.setAttribute("aSize", new THREE.BufferAttribute(trailSize, 1));
  const trailMat = new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: pixelRatio } },
    vertexShader: TRAIL_VERTEX,
    fragmentShader: TRAIL_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const trail = new THREE.Points(trailGeo, trailMat);
  scene.add(trail);
  const trailData = Array.from({ length: TRAIL_COUNT }, () => ({
    life: 0,
    maxLife: 1,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  }));
  let trailCursor = 0;

  // ---------- Flight paths (recomputed on resize) ----------
  const path = { p0: [0, 0], p1: [0, 0], p2: [0, 0] };
  const stationPath = { from: [0, 0], to: [0, 0] };
  const updatePaths = () => {
    // Rocket: bottom-left (off-screen) <-> right-middle (visible)
    path.p0 = [-view.w * 0.62, -view.h * 0.55];
    path.p1 = [view.w * 0.0, -view.h * 0.22];
    path.p2 = [view.w * 0.35, 0];
    // Station: drifts right -> left across the upper sky
    stationPath.from = [view.w * 0.62, view.h * 0.3];
    stationPath.to = [-view.w * 0.62, view.h * 0.16];
  };
  updatePaths();

  const bezier = (t) => {
    const [x0, y0] = path.p0;
    const [x1, y1] = path.p1;
    const [x2, y2] = path.p2;
    const u = 1 - t;
    return {
      x: u * u * x0 + 2 * u * t * x1 + t * t * x2,
      y: u * u * y0 + 2 * u * t * y1 + t * t * y2,
      dx: 2 * u * (x1 - x0) + 2 * t * (x2 - x1),
      dy: 2 * u * (y1 - y0) + 2 * t * (y2 - y1),
    };
  };

  // dir: +1 flying to top-right, -1 flying back - nose leads either way.
  const placeRocket = (t, dir, elapsed, hold) => {
    const p = bezier(t);
    const bob = Math.sin(elapsed * 1.4) * view.h * 0.006;
    rocket.position.set(p.x, p.y + bob, 10);
    rocket.rotation.z = Math.atan2(p.dy * dir, p.dx * dir) - Math.PI / 2;
    // Fade only at the off-screen bottom-left end (t near 0).
    // The top-right destination (t=1) is visible, so no fade there.
    const opacity = Math.min(t / 0.06, 1);
    rocketMat.opacity = opacity;
    flameMat.opacity = opacity * (hold ? 0.45 + Math.random() * 0.1 : 0.75 + Math.random() * 0.25);
    flame.scale.y = hold ? 0.6 + Math.random() * 0.1 : 0.85 + Math.random() * 0.3;
    return { p, opacity };
  };

  // Ping-pong schedule: fly out, hold at top-right, fly back, pause off-screen.
  // Offset so the rocket is already mid-flight (in view, full opacity) at t=0
  // instead of entering from off-screen.
  const START_OFFSET = FLY_DURATION * 0.28;
  const rocketPhase = (elapsed) => {
    const cycle = FLY_DURATION * 2 + TOP_HOLD + END_PAUSE;
    const ph = (elapsed + START_OFFSET) % cycle;
    if (ph < FLY_DURATION) return { t: ph / FLY_DURATION, dir: 1 };
    if (ph < FLY_DURATION + TOP_HOLD) return { t: 1, dir: 1, hold: true };
    const back = ph - FLY_DURATION - TOP_HOLD;
    if (back < FLY_DURATION) return { t: 1 - back / FLY_DURATION, dir: -1 };
    return null;
  };

  const placeStation = (elapsed) => {
    const cycle = STATION_DURATION + STATION_PAUSE;
    const t = ((elapsed + STATION_START_OFFSET) % cycle) / STATION_DURATION;
    if (t > 1) {
      stationMat.opacity = 0;
      return;
    }
    const [fx, fy] = stationPath.from;
    const [tx, ty] = stationPath.to;
    const x = fx + (tx - fx) * t;
    const y = fy + (ty - fy) * t + Math.sin(elapsed * 0.5) * view.h * 0.008;
    station.position.set(x, y, 4);
    station.rotation.z = Math.sin(elapsed * 0.18) * 0.06 - 0.05;
    const fadeIn = 1; // appear immediately, no fade-in
    const fadeOut = Math.min((1 - t) / 0.08, 1);
    stationMat.opacity = Math.max(0, Math.min(fadeIn, fadeOut)) * 0.95;
  };

  const emitTrail = (p, dir) => {
    const len = Math.hypot(p.dx, p.dy) || 1;
    const dirX = (p.dx / len) * dir;
    const dirY = (p.dy / len) * dir;
    const tailX = p.x - dirX * rocketHeight * 0.75;
    const tailY = p.y - dirY * rocketHeight * 0.75;
    for (let n = 0; n < 2; n++) {
      const d = trailData[trailCursor];
      d.maxLife = 0.9 + Math.random() * 0.9;
      d.life = d.maxLife;
      d.x = tailX + (Math.random() - 0.5) * 1.4;
      d.y = tailY + (Math.random() - 0.5) * 1.4;
      d.vx = -dirX * (3 + Math.random() * 4) + (Math.random() - 0.5) * 1.5;
      d.vy = -dirY * (3 + Math.random() * 4) + (Math.random() - 0.5) * 1.5;
      trailCursor = (trailCursor + 1) % TRAIL_COUNT;
    }
  };

  const updateTrail = (dt) => {
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const d = trailData[i];
      if (d.life > 0) {
        d.life -= dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
      }
      const k = Math.max(d.life / d.maxLife, 0);
      trailPos[i * 3] = d.x;
      trailPos[i * 3 + 1] = d.y;
      trailPos[i * 3 + 2] = 8;
      trailAlpha[i] = k * 0.55;
      trailSize[i] = 1.2 + (1 - k) * 1.6;
    }
    trailGeo.attributes.position.needsUpdate = true;
    trailGeo.attributes.aAlpha.needsUpdate = true;
    trailGeo.attributes.aSize.needsUpdate = true;
  };

  // ---------- Loop ----------
  const timer = new THREE.Timer();
  let rafId = 0;
  let isInView = true;

  const renderFrame = () => {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const elapsed = timer.getElapsed();
    starUniforms.uTime.value = elapsed;
    stars.rotation.z = elapsed * 0.0035;

    const phase = rocketPhase(elapsed);
    if (phase) {
      const { p, opacity } = placeRocket(phase.t, phase.dir, elapsed, phase.hold);
      if (opacity > 0.1 && !phase.hold) emitTrail(p, phase.dir);
    } else {
      rocketMat.opacity = 0;
      flameMat.opacity = 0;
    }
    placeStation(elapsed);
    updateTrail(dt);
    renderer.render(scene, camera);
  };

  const animate = () => {
    rafId = requestAnimationFrame(animate);
    if (isInView) renderFrame();
  };

  const renderStatic = () => {
    placeRocket(0.7, 1, 0);
    flameMat.opacity = 0;
    placeStation(STATION_DURATION * 0.45);
    renderer.render(scene, camera);
  };

  if (reducedMotion) {
    renderStatic();
  } else {
    animate();
  }

  const observer = new IntersectionObserver(([entry]) => {
    isInView = entry.isIntersecting;
  });
  observer.observe(container);

  const resizeObserver = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    updateView();
    updatePaths();
    if (reducedMotion) renderStatic();
  });
  resizeObserver.observe(container);

  return () => {
    cancelAnimationFrame(rafId);
    observer.disconnect();
    resizeObserver.disconnect();
    starGeo.dispose();
    starMat.dispose();
    trailGeo.dispose();
    trailMat.dispose();
    rocketBody.geometry.dispose();
    rocketMat.dispose();
    flame.geometry.dispose();
    flameMat.dispose();
    station.geometry.dispose();
    stationMat.dispose();
    stationTex.dispose();
    rocketTex.dispose();
    flameTex.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}

onMounted(async () => {
  if (!containerRef.value) return;
  // three.js is a ~600KB chunk whose evaluation alone is a long main-thread
  // task. Wait for idle so hydration and first paint finish first (TBT);
  // the CSS background layers cover the gap visually.
  await waitForIdle();
  if (!containerRef.value) return; // unmounted while waiting
  try {
    cleanup = await initScene(containerRef.value);
  } catch (error) {
    // WebGL unavailable - CSS background layers still render, so fail quietly.
    console.error("CosmosScene init failed:", error);
  }
});

onBeforeUnmount(() => {
  if (cleanup) cleanup();
  cleanup = null;
});
</script>

<template>
  <div ref="containerRef" class="cosmos" aria-hidden="true" />
</template>

<style scoped>
.cosmos {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.cosmos :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
