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

  // 画框背景
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, size, size);

  // 内部渐变
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    10,
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, "rgba(60,60,120,0.6)");
  grad.addColorStop(1, "rgba(20,20,40,0.9)");
  ctx.fillStyle = grad;
  ctx.fillRect(8, 8, size - 16, size - 16);

  // 画框边
  ctx.strokeStyle = "rgba(180,160,120,0.8)";
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, size - 8, size - 8);
  ctx.strokeStyle = "rgba(220,200,160,0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, size - 24, size - 24);

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

  // 发光箭头
  ctx.shadowColor = "rgba(140,200,255,0.9)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "rgba(200,230,255,0.95)";

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

let arrowMesh: THREE.Mesh;
let targetCamZ = 0;
let currentCamZ = 0;

function init() {
  if (!canvasRef.value) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a1a, 1, 22);

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
  renderer.setClearColor(0x0a0a1a);

  // 光源
  const ambient = new THREE.AmbientLight(0x334466, 0.6);
  scene.add(ambient);

  const pointLight = new THREE.PointLight(0x6688cc, 1.5, 20);
  pointLight.position.set(0, 2.8, -2);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0x4466aa, 1.0, 20);
  pointLight2.position.set(0, 2.8, -10);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0x556699, 0.6, 20);
  pointLight3.position.set(0, 2.8, -16);
  scene.add(pointLight3);

  // 走廊几何体
  const hw = CORRIDOR_WIDTH / 2;
  const hh = CORRIDOR_HEIGHT;

  // 地板
  const floorGeo = new THREE.PlaneGeometry(CORRIDOR_WIDTH, CORRIDOR_LENGTH);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.7,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -CORRIDOR_LENGTH / 2);
  scene.add(floor);

  // 天花板
  const ceilGeo = new THREE.PlaneGeometry(CORRIDOR_WIDTH, CORRIDOR_LENGTH);
  const ceilMat = new THREE.MeshStandardMaterial({
    color: 0x151528,
    roughness: 0.9,
  });
  const ceil = new THREE.Mesh(ceilGeo, ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, hh, -CORRIDOR_LENGTH / 2);
  scene.add(ceil);

  // 左墙
  const wallGeo = new THREE.PlaneGeometry(CORRIDOR_LENGTH, hh);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x16162a,
    roughness: 0.8,
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

  // 尽头墙
  const backGeo = new THREE.PlaneGeometry(CORRIDOR_WIDTH, hh);
  const backMat = new THREE.MeshStandardMaterial({
    color: 0x0d0d20,
    roughness: 0.9,
  });
  const backWall = new THREE.Mesh(backGeo, backMat);
  backWall.position.set(0, hh / 2, -CORRIDOR_LENGTH);
  scene.add(backWall);

  // 走廊灯带（顶部边缘装饰线）
  const stripGeo = new THREE.BoxGeometry(0.05, 0.05, CORRIDOR_LENGTH);
  const stripMat = new THREE.MeshBasicMaterial({
    color: 0x4488cc,
    transparent: true,
    opacity: 0.3,
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
      arrowMesh.material.opacity = 0.5 + Math.sin(time * 2.5) * 0.3;
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
  background: #0a0a1a;
  cursor: pointer;
}

.corridor-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
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
  color: rgba(180, 210, 255, 0.85);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  padding: 10px 22px;
  border-radius: 999px;
  background: rgba(10, 10, 30, 0.65);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(100, 150, 220, 0.25);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}
.hint--end {
  color: rgba(255, 200, 120, 0.85);
  border-color: rgba(200, 160, 80, 0.3);
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

/* 后退按钮 —— 冷蓝调 */
.ctrl-btn--retreat {
  background: rgba(60, 90, 160, 0.25);
  border: 1px solid rgba(120, 170, 240, 0.35);
  color: rgba(160, 200, 255, 0.9);
}
.ctrl-btn--retreat:hover {
  background: rgba(80, 120, 200, 0.4);
  border-color: rgba(160, 200, 255, 0.55);
  color: #fff;
}

/* 离开按钮 —— 暖琥珀调，与提示冷色形成对比 */
.ctrl-btn--exit {
  background: rgba(140, 90, 20, 0.25);
  border: 1px solid rgba(220, 160, 60, 0.35);
  color: rgba(255, 200, 100, 0.9);
}
.ctrl-btn--exit:hover {
  background: rgba(180, 120, 30, 0.4);
  border-color: rgba(255, 200, 80, 0.6);
  color: #ffe080;
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
