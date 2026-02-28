<script setup lang="ts">
/**
 * 鼠标跟随星尘粒子 — 赛博朋克风格
 * 光标移动时在身后留下微弱的青色粒子尾迹
 */
import { ref, onMounted, onBeforeUnmount } from "vue";

const canvasRef = ref<HTMLCanvasElement>();
let dpr = 1;
let animId = 0;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number; // 180(cyan) ~ 260(purple)
}

const particles: Particle[] = [];
const MAX_PARTICLES = 80;
let mouseX = -1000;
let mouseY = -1000;
let lastEmit = 0;

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX;
  mouseY = e.clientY;

  const now = performance.now();
  if (now - lastEmit < 25) return; // throttle
  lastEmit = now;

  // 每次移动 spawn 2-3 个粒子
  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) {
      // 复用最旧的
      const oldest = particles.reduce((a, b) =>
        a.life / a.maxLife < b.life / b.maxLife ? a : b,
      );
      resetParticle(oldest, e.clientX, e.clientY);
    } else {
      const p = createParticle(e.clientX, e.clientY);
      particles.push(p);
    }
  }
}

function createParticle(x: number, y: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.3 + Math.random() * 0.8;
  const life = 40 + Math.random() * 40;
  return {
    x: x + (Math.random() - 0.5) * 8,
    y: y + (Math.random() - 0.5) * 8,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 0.2, // 微微上浮
    life,
    maxLife: life,
    size: 1.5 + Math.random() * 2.5,
    hue: 180 + Math.random() * 80, // cyan → purple
  };
}

function resetParticle(p: Particle, x: number, y: number) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.3 + Math.random() * 0.8;
  const life = 40 + Math.random() * 40;
  p.x = x + (Math.random() - 0.5) * 8;
  p.y = y + (Math.random() - 0.5) * 8;
  p.vx = Math.cos(angle) * speed;
  p.vy = Math.sin(angle) * speed - 0.2;
  p.life = life;
  p.maxLife = life;
  p.size = 1.5 + Math.random() * 2.5;
  p.hue = 180 + Math.random() * 80;
}

function draw() {
  const cvs = canvasRef.value;
  if (!cvs) return;
  const ctx = cvs.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, cvs.width, cvs.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.003; // 微重力
    p.life--;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    const alpha = (p.life / p.maxLife) * 0.7;
    const r = p.size * dpr;
    const px = p.x * dpr;
    const py = p.y * dpr;

    // 外层辉光
    const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
    grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${alpha * 0.8})`);
    grad.addColorStop(0.4, `hsla(${p.hue}, 100%, 60%, ${alpha * 0.3})`);
    grad.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
    ctx.beginPath();
    ctx.arc(px, py, r * 3, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 核心亮点
    ctx.beginPath();
    ctx.arc(px, py, r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, ${alpha})`;
    ctx.fill();
  }

  animId = requestAnimationFrame(draw);
}

function resize() {
  const cvs = canvasRef.value;
  if (!cvs) return;
  dpr = Math.min(window.devicePixelRatio, 2);
  cvs.width = window.innerWidth * dpr;
  cvs.height = window.innerHeight * dpr;
  cvs.style.width = window.innerWidth + "px";
  cvs.style.height = window.innerHeight + "px";
}

onMounted(() => {
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onMouseMove);
  animId = requestAnimationFrame(draw);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animId);
  window.removeEventListener("resize", resize);
  window.removeEventListener("mousemove", onMouseMove);
});
</script>

<template>
  <canvas ref="canvasRef" class="mouse-particles" />
</template>

<style scoped>
.mouse-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 3;
}
</style>
