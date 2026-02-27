<script setup lang="ts">
/**
 * 海洋模式 — 粒子光芒放射效果
 * Three.js 点精灵，从中心辐射向外扩散，additive blending 产生柔和光芒
 */
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";

const props = defineProps<{ active: boolean }>();

const canvasRef = ref<HTMLCanvasElement>();
const glowActive = ref(false); // CSS 辅助光晕

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let points: THREE.Points;
let animId = 0;
let isRunning = false;

const COUNT = 120;

// 每粒子数据
const positions = new Float32Array(COUNT * 3);
const velocities = new Float32Array(COUNT * 2);
const lifes = new Float32Array(COUNT);
const maxLifes = new Float32Array(COUNT);
const baseSizes = new Float32Array(COUNT);

function resetParticle(i: number) {
  // 从中心微偏位置出发
  const off = 0.1;
  positions[i * 3] = (Math.random() - 0.5) * off;
  positions[i * 3 + 1] = (Math.random() - 0.5) * off;
  positions[i * 3 + 2] = 0;

  const angle = Math.random() * Math.PI * 2;
  const speed = 0.035 + Math.random() * 0.055;
  velocities[i * 2] = Math.cos(angle) * speed;
  velocities[i * 2 + 1] = Math.sin(angle) * speed;

  lifes[i] = 0;
  maxLifes[i] = 70 + Math.random() * 100; // 1.2–2.8 s @60fps
  baseSizes[i] = 0.15 + Math.random() * 0.22;
}

/* ---------- Three.js 初始化 ---------- */
function init() {
  if (!canvasRef.value) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, 1, 0.1, 50);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: true,
  });
  const SIZE = 600;
  renderer.setSize(SIZE, SIZE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  for (let i = 0; i < COUNT; i++) {
    resetParticle(i);
    lifes[i] = Math.random(); // 错峰
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aLife", new THREE.BufferAttribute(lifes, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(baseSizes, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0 },
      uPR: { value: renderer.getPixelRatio() },
    },
    vertexShader: /* glsl */ `
      attribute float aLife;
      attribute float aSize;
      uniform float uPR;
      varying float vLife;
      void main(){
        vLife = aLife;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPR * (300.0 / -mv.z) * (1.0 - vLife * 0.15);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vLife;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if(d > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.48, d);
        glow = pow(glow, 1.3);
        float fade = 1.0 - smoothstep(0.1, 1.0, vLife);
        float a = glow * fade * uOpacity * 0.88;
        // 核心白色 → 外围浅蓝
        vec3 col = mix(vec3(0.95, 0.98, 1.0), vec3(0.4, 0.75, 1.0), d * 1.8);
        gl_FragColor = vec4(col, a);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  points = new THREE.Points(geo, mat);
  scene.add(points);
}

/* ---------- 动画逻辑 ---------- */
let target = 0;

function tick() {
  if (!renderer || !points) return;
  animId = requestAnimationFrame(tick);

  const u = (points.material as THREE.ShaderMaterial).uniforms;
  // 快速淡入（0.12），自然淡出（0.06）
  const rate = target > 0 ? 0.12 : 0.06;
  u.uOpacity.value += (target - u.uOpacity.value) * rate;

  if (u.uOpacity.value < 0.003 && target === 0) {
    isRunning = false;
    glowActive.value = false;
    cancelAnimationFrame(animId);
    renderer.render(scene, camera);
    return;
  }

  const posA = points.geometry.getAttribute(
    "position",
  ) as THREE.BufferAttribute;
  const lifeA = points.geometry.getAttribute("aLife") as THREE.BufferAttribute;
  const sizeA = points.geometry.getAttribute("aSize") as THREE.BufferAttribute;

  for (let i = 0; i < COUNT; i++) {
    lifes[i] += 1 / maxLifes[i];
    if (lifes[i] >= 1) {
      if (target > 0) resetParticle(i);
      else lifes[i] = 1;
    }
    positions[i * 3] += velocities[i * 2];
    positions[i * 3 + 1] += velocities[i * 2 + 1];
    // 轻微减速，保持飘散感
    velocities[i * 2] *= 0.997;
    velocities[i * 2 + 1] *= 0.997;
  }

  posA.needsUpdate = true;
  lifeA.needsUpdate = true;
  sizeA.needsUpdate = true;
  renderer.render(scene, camera);
}

function start() {
  target = 1;
  glowActive.value = true;
  if (!isRunning) {
    isRunning = true;
    for (let i = 0; i < COUNT; i++) {
      resetParticle(i);
      lifes[i] = Math.random();
    }
    tick();
  }
}
function stop() {
  target = 0;
}

watch(
  () => props.active,
  (v) => (v ? start() : stop()),
  { immediate: true },
);

onMounted(init);
onBeforeUnmount(() => {
  cancelAnimationFrame(animId);
  if (points) {
    points.geometry.dispose();
    (points.material as THREE.ShaderMaterial).dispose();
  }
  renderer?.dispose();
  renderer?.forceContextLoss();
  renderer = null;
});
</script>

<template>
  <div class="ocean-burst-wrap">
    <!-- CSS 辅助柔光 -->
    <div class="ocean-center-glow" :class="{ active: glowActive }" />
    <!-- Three.js 粒子 -->
    <canvas ref="canvasRef" class="ocean-particles" />
  </div>
</template>

<style scoped>
.ocean-burst-wrap {
  position: absolute;
  width: 600px;
  height: 600px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9;
}

.ocean-particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* 中心柔光辅助层 */
.ocean-center-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 260px;
  height: 260px;
  transform: translate(-50%, -50%) scale(0.6);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(140, 200, 255, 0.35) 0%,
    rgba(80, 160, 255, 0.15) 35%,
    rgba(40, 120, 255, 0.05) 60%,
    transparent 100%
  );
  opacity: 0;
  transition:
    opacity 0.4s ease,
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}
.ocean-center-glow.active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
</style>
