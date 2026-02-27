<script setup lang="ts">
/**
 * 页面1 — Three.js 视觉走廊
 * 走廊尽头有箭头，最多点击两次向前走，到尽头箭头消失
 * 走廊两侧有 emoji 画作
 */
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import * as THREE from "three";

const router = useRouter();
const canvasRef = ref<HTMLCanvasElement>();

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let animId = 0;

// 走廊状态
const step = ref(0); // 0, 1, 2
const maxStep = 2;
const canAdvance = ref(true);
const isAnimating = ref(false);

// 走廊参数
const CORRIDOR_WIDTH = 4;
const CORRIDOR_HEIGHT = 3.5;
const CORRIDOR_LENGTH = 18;
const SEGMENT_MOVE = 5; // 每次前进距离

// emoji 画作
const paintings = [
  // 左侧墙
  { emoji: "🌊", x: -1.95, y: 1.2, z: -3, side: "left" },
  { emoji: "🐚", x: -1.95, y: 1.2, z: -7, side: "left" },
  { emoji: "🌺", x: -1.95, y: 1.2, z: -11, side: "left" },
  { emoji: "🦋", x: -1.95, y: 1.2, z: -15, side: "left" },
  // 右侧墙
  { emoji: "🌙", x: 1.95, y: 1.2, z: -3, side: "right" },
  { emoji: "⭐", x: 1.95, y: 1.2, z: -7, side: "right" },
  { emoji: "🎨", x: 1.95, y: 1.2, z: -11, side: "right" },
  { emoji: "🔮", x: 1.95, y: 1.2, z: -15, side: "right" },
];

function createTextTexture(text: string, size = 256): THREE.CanvasTexture {
  const cvs = document.createElement("canvas");
  cvs.width = size;
  cvs.height = size;
  const ctx = cvs.getContext("2d")!;

  // 木质相框背景
  ctx.fillStyle = "#f5e6d0";
  ctx.fillRect(0, 0, size, size);

  // 内部暖色渐变 — 模拟旧照片底色
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    10,
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, "rgba(255,245,230,0.9)");
  grad.addColorStop(1, "rgba(230,210,180,0.95)");
  ctx.fillStyle = grad;
  ctx.fillRect(8, 8, size - 16, size - 16);

  // 木质相框边 — 深棕色
  ctx.strokeStyle = "rgba(140,100,60,0.85)";
  ctx.lineWidth = 7;
  ctx.strokeRect(4, 4, size - 8, size - 8);
  ctx.strokeStyle = "rgba(180,140,90,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, size - 24, size - 24);

  // 内侧金色细线
  ctx.strokeStyle = "rgba(210,180,120,0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, size - 32, size - 32);

  // emoji
  ctx.font = `${size * 0.45}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, size / 2, size / 2);

  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createArrowTexture(): THREE.CanvasTexture {
  const size = 128;
  const cvs = document.createElement("canvas");
  cvs.width = size;
  cvs.height = size;
  const ctx = cvs.getContext("2d")!;

  ctx.clearRect(0, 0, size, size);

  // 暖金色发光箭头
  ctx.shadowColor = "rgba(210,160,80,0.9)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "rgba(240,200,120,0.95)";

  ctx.beginPath();
  ctx.moveTo(size / 2, 15);
  ctx.lineTo(size - 20, size / 2);
  ctx.lineTo(size / 2 + 10, size / 2 - 5);
  ctx.lineTo(size / 2 + 10, size - 20);
  ctx.lineTo(size / 2 - 10, size - 20);
  ctx.lineTo(size / 2 - 10, size / 2 - 5);
  ctx.lineTo(20, size / 2);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let arrowMesh: THREE.Sprite;
let targetCamZ = 0;
let currentCamZ = 0;

function init() {
  if (!canvasRef.value) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf5e6d0, 2, 24);

  camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    50,
  );
  camera.position.set(0, 1.2, 0);
  camera.lookAt(0, 1.2, -10);
  currentCamZ = 0;
  targetCamZ = 0;

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xf5e6d0);

  // 暖色光源 — 模拟午后阳光
  const ambient = new THREE.AmbientLight(0xffe8c8, 0.8);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xffd59e, 0.6);
  sunLight.position.set(2, 4, -3);
  scene.add(sunLight);

  const pointLight = new THREE.PointLight(0xffcb8e, 1.2, 20);
  pointLight.position.set(0, 2.8, -2);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0xffc080, 0.8, 20);
  pointLight2.position.set(0, 2.8, -10);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xffb870, 0.5, 20);
  pointLight3.position.set(0, 2.8, -16);
  scene.add(pointLight3);

  // 走廊几何体
  const hw = CORRIDOR_WIDTH / 2;
  const hh = CORRIDOR_HEIGHT;

  // 地板 — 木质暖色调
  const floorGeo = new THREE.PlaneGeometry(CORRIDOR_WIDTH, CORRIDOR_LENGTH);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xc8a882,
    roughness: 0.75,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -CORRIDOR_LENGTH / 2);
  scene.add(floor);

  // 天花板 — 暖白
  const ceilGeo = new THREE.PlaneGeometry(CORRIDOR_WIDTH, CORRIDOR_LENGTH);
  const ceilMat = new THREE.MeshStandardMaterial({
    color: 0xf0e0cc,
    roughness: 0.9,
  });
  const ceil = new THREE.Mesh(ceilGeo, ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, hh, -CORRIDOR_LENGTH / 2);
  scene.add(ceil);

  // 左墙 — 暖米色
  const wallGeo = new THREE.PlaneGeometry(CORRIDOR_LENGTH, hh);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xe8d5b8,
    roughness: 0.85,
  });
  const leftWall = new THREE.Mesh(wallGeo, wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-hw, hh / 2, -CORRIDOR_LENGTH / 2);
  scene.add(leftWall);

  // 右墙
  const rightWall = new THREE.Mesh(wallGeo, wallMat.clone());
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(hw, hh / 2, -CORRIDOR_LENGTH / 2);
  scene.add(rightWall);

  // 尽头墙 — 稍深暖色
  const backGeo = new THREE.PlaneGeometry(CORRIDOR_WIDTH, hh);
  const backMat = new THREE.MeshStandardMaterial({
    color: 0xd4be9a,
    roughness: 0.9,
  });
  const backWall = new THREE.Mesh(backGeo, backMat);
  backWall.position.set(0, hh / 2, -CORRIDOR_LENGTH);
  scene.add(backWall);

  // 走廊灯带（顶部边缘装饰线）— 暖金色
  const stripGeo = new THREE.BoxGeometry(0.05, 0.05, CORRIDOR_LENGTH);
  const stripMat = new THREE.MeshBasicMaterial({
    color: 0xd4a050,
    transparent: true,
    opacity: 0.35,
  });
  const stripL = new THREE.Mesh(stripGeo, stripMat);
  stripL.position.set(-hw + 0.03, hh - 0.03, -CORRIDOR_LENGTH / 2);
  scene.add(stripL);
  const stripR = new THREE.Mesh(stripGeo, stripMat.clone());
  stripR.position.set(hw - 0.03, hh - 0.03, -CORRIDOR_LENGTH / 2);
  scene.add(stripR);

  // 画作
  for (const p of paintings) {
    const tex = createTextTexture(p.emoji);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
    });
    const geo = new THREE.PlaneGeometry(1.2, 1.2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(p.x, p.y, p.z);
    if (p.side === "left") mesh.rotation.y = Math.PI / 2;
    else mesh.rotation.y = -Math.PI / 2;
    scene.add(mesh);
  }

  // 箭头精灵
  const arrowTex = createArrowTexture();
  const arrowMat = new THREE.SpriteMaterial({
    map: arrowTex,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  arrowMesh = new THREE.Sprite(arrowMat);
  arrowMesh.scale.set(1.2, 1.2, 1);
  arrowMesh.position.set(0, 1.5, -CORRIDOR_LENGTH + 1);
  scene.add(arrowMesh);

  tick();
}

// 箭头呼吸动画
let time = 0;

function tick() {
  animId = requestAnimationFrame(tick);
  if (!renderer) return;

  time += 0.016;

  // 平滑移动
  currentCamZ += (targetCamZ - currentCamZ) * 0.04;
  camera.position.z = currentCamZ;
  camera.lookAt(0, 1.2, currentCamZ - 10);

  // 箭头可见性和动画
  const show = step.value < maxStep;
  if (arrowMesh) {
    arrowMesh.visible = show;
    if (show) {
      (arrowMesh.material as THREE.SpriteMaterial).opacity =
        0.5 + Math.sin(time * 2.5) * 0.3;
      arrowMesh.position.z = -CORRIDOR_LENGTH + 1 + Math.sin(time * 1.5) * 0.15;
    }
  }

  renderer.render(scene, camera);
}

function advance() {
  if (step.value >= maxStep || isAnimating.value) return;
  isAnimating.value = true;
  step.value++;
  targetCamZ -= SEGMENT_MOVE;

  const check = () => {
    if (Math.abs(currentCamZ - targetCamZ) < 0.1) {
      isAnimating.value = false;
      canAdvance.value = step.value < maxStep;
    } else {
      requestAnimationFrame(check);
    }
  };
  requestAnimationFrame(check);
}

function retreat() {
  if (step.value <= 0 || isAnimating.value) return;
  isAnimating.value = true;
  step.value--;
  targetCamZ += SEGMENT_MOVE;
  canAdvance.value = true;

  const check = () => {
    if (Math.abs(currentCamZ - targetCamZ) < 0.1) {
      isAnimating.value = false;
    } else {
      requestAnimationFrame(check);
    }
  };
  requestAnimationFrame(check);
}

function onResize() {
  if (!renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

onMounted(() => {
  init();
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animId);
  window.removeEventListener("resize", onResize);
  renderer?.dispose();
  renderer?.forceContextLoss();
  renderer = null;
});
</script>

<template>
  <div class="page1">
    <canvas ref="canvasRef" class="corridor-canvas" @click="advance" />

    <!-- 底部控制栏 -->
    <div class="bottom-bar">
      <!-- 后退按钮（走廊内后退） -->
      <Transition name="slide-left">
        <button
          v-if="step > 0"
          class="ctrl-btn ctrl-btn--retreat"
          @click.stop="retreat"
        >
          ← 后退
        </button>
      </Transition>

      <!-- 提示文字 -->
      <Transition name="fade" mode="out-in">
        <div v-if="step < maxStep" key="hint" class="hint">
          点击前进 ({{ step }}/{{ maxStep }})
        </div>
        <div v-else key="end" class="hint hint--end">已到尽头</div>
      </Transition>

      <!-- 离开走廊（返回主页）：与提示并排，温暖色调区别于冷蓝系UI -->
      <button class="ctrl-btn ctrl-btn--exit" @click.stop="router.push('/')">
        离开 ↗
      </button>
    </div>
  </div>
</template>

<style scoped>
.page1 {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #f5e6d0;
  cursor: pointer;
}

.corridor-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* ── 暖光光晕覆盖层 ── */
.page1::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 60% 40% at 30% 20%,
      rgba(255, 220, 150, 0.15) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse 50% 50% at 75% 30%,
      rgba(255, 200, 120, 0.1) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse 80% 30% at 50% 90%,
      rgba(200, 160, 100, 0.08) 0%,
      transparent 50%
    );
}

/* ── 淡淡的胶片颗粒感 ── */
.page1::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}

/* ── 底部控制栏 ── */
.bottom-bar {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
}

.hint {
  color: rgba(120, 80, 40, 0.85);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  padding: 10px 22px;
  border-radius: 999px;
  background: rgba(255, 245, 230, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(180, 140, 80, 0.3);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}
.hint--end {
  color: rgba(160, 100, 30, 0.9);
  border-color: rgba(200, 150, 60, 0.4);
}

/* 通用控制按钮 */
.ctrl-btn {
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
  backdrop-filter: blur(12px);
}

/* 后退按钮 —— 暖棕调 */
.ctrl-btn--retreat {
  background: rgba(180, 140, 80, 0.2);
  border: 1px solid rgba(180, 140, 80, 0.4);
  color: rgba(120, 80, 40, 0.9);
}
.ctrl-btn--retreat:hover {
  background: rgba(180, 140, 80, 0.35);
  border-color: rgba(160, 120, 60, 0.6);
  color: rgba(100, 60, 20, 1);
}

/* 离开按钮 —— 暖琥珀调 */
.ctrl-btn--exit {
  background: rgba(180, 120, 50, 0.2);
  border: 1px solid rgba(200, 150, 60, 0.4);
  color: rgba(160, 100, 30, 0.9);
}
.ctrl-btn--exit:hover {
  background: rgba(200, 140, 50, 0.35);
  border-color: rgba(220, 170, 60, 0.6);
  color: rgba(140, 80, 10, 1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 后退按钮滑入动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
