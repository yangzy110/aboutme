<script setup lang="ts">
/**
 * 银河模式 — 漫画集中线效果
 * 从屏幕边缘向中心射出的白色放射带，manga "集中線" 风格
 */
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{ active: boolean }>();

const canvasRef = ref<HTMLCanvasElement>();
let animId = 0;
let isRunning = false;
let progress = 0; // 0→1
let target = 0;
let dpr = 1;

interface Line {
  angle: number;
  innerDist: number; // 终点离中心的距离 (px)
  width: number; // 外端宽度
  opacity: number;
}

let lines: Line[] = [];
const LINE_COUNT = 52;

function generateLines() {
  lines = [];
  for (let i = 0; i < LINE_COUNT; i++) {
    const base = (i / LINE_COUNT) * Math.PI * 2;
    const jitter = (Math.random() - 0.5) * ((Math.PI * 2) / LINE_COUNT) * 0.65;
    lines.push({
      angle: base + jitter,
      innerDist: 110 + Math.random() * 200,
      width: 1.0 + Math.random() * 3.2,
      opacity: 0.07 + Math.random() * 0.22,
    });
  }
}

/* ---------- Canvas 绘制 ---------- */
function draw() {
  const cvs = canvasRef.value;
  if (!cvs) return;
  const ctx = cvs.getContext("2d");
  if (!ctx) return;

  const w = cvs.width;
  const h = cvs.height;
  ctx.clearRect(0, 0, w, h);

  if (progress < 0.002) return;

  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy) + 60 * dpr;

  for (const ln of lines) {
    const outerDist = maxDist;
    const currentInner =
      outerDist - (outerDist - ln.innerDist * dpr) * progress;
    const cos = Math.cos(ln.angle);
    const sin = Math.sin(ln.angle);
    const px = -sin;
    const py = cos;
    const hw = (ln.width * dpr) / 2;

    // 内端 — 尖点
    const ix = cx + cos * currentInner;
    const iy = cy + sin * currentInner;
    // 外端
    const ox = cx + cos * outerDist;
    const oy = cy + sin * outerDist;

    // 渐变：尖端透明 → 中段最亮 → 外端稍淡
    const grad = ctx.createLinearGradient(ix, iy, ox, oy);
    const a = ln.opacity * progress;
    grad.addColorStop(0, `rgba(255,255,255,0)`);
    grad.addColorStop(0.12, `rgba(255,255,255,${a})`);
    grad.addColorStop(0.6, `rgba(255,255,255,${a * 0.75})`);
    grad.addColorStop(1, `rgba(255,255,255,${a * 0.3})`);

    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ox + px * hw, oy + py * hw);
    ctx.lineTo(ox - px * hw, oy - py * hw);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

/* ---------- 动画循环 ---------- */
function tick() {
  animId = requestAnimationFrame(tick);

  const rate = target > 0 ? 0.1 : 0.055;
  progress += (target - progress) * rate;

  if (progress < 0.002 && target === 0) {
    isRunning = false;
    cancelAnimationFrame(animId);
    draw();
    return;
  }
  draw();
}

function start() {
  target = 1;
  if (!isRunning) {
    isRunning = true;
    generateLines();
    tick();
  }
}
function stop() {
  target = 0;
}

/* ---------- Resize ---------- */
function resize() {
  const cvs = canvasRef.value;
  if (!cvs) return;
  dpr = Math.min(window.devicePixelRatio, 2);
  cvs.width = window.innerWidth * dpr;
  cvs.height = window.innerHeight * dpr;
  cvs.style.width = window.innerWidth + "px";
  cvs.style.height = window.innerHeight + "px";
}

watch(
  () => props.active,
  (v) => (v ? start() : stop()),
);

onMounted(() => {
  generateLines();
  resize();
  window.addEventListener("resize", resize);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(animId);
  window.removeEventListener("resize", resize);
});
</script>

<template>
  <canvas ref="canvasRef" class="galaxy-speed-lines" />
</template>

<style scoped>
.galaxy-speed-lines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 2;
}
</style>
