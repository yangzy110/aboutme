<script setup lang="ts">
/**
 * 事业模块 — 一条连续虚线贯穿三个全屏页面
 * 第1页：2024年工作（3张图）
 * 第2页：同事生活（2张图）
 * 第3页：2025年工作（3张图）
 * 图片卡片是主角，虚线是串联线索
 */
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import {
  Monitor,
  Coffee,
  Trophy,
  Burger,
  Camera,
  Promotion,
  DataLine,
  Star,
} from "@element-plus/icons-vue";

const router = useRouter();

/* ─── 所有卡片数据（按时间线顺序） ─── */
interface CardData {
  icon: any;
  title: string;
  desc: string;
  color: string;
}

interface Section {
  title: string;
  subtitle: string;
  cards: CardData[];
}

const sections: Section[] = [
  {
    title: "2024 · 工作",
    subtitle: "这一年，代码与咖啡相伴",
    cards: [
      {
        icon: Monitor,
        title: "项目启动",
        desc: "从零搭建核心系统架构",
        color: "#38bdf8",
      },
      {
        icon: Coffee,
        title: "深夜攻坚",
        desc: "数不清的通宵与突破",
        color: "#a78bfa",
      },
      {
        icon: Trophy,
        title: "项目上线",
        desc: "成功交付，获得好评",
        color: "#fbbf24",
      },
    ],
  },
  {
    title: "同事 · 生活",
    subtitle: "工作之外，还有诗和远方",
    cards: [
      {
        icon: Burger,
        title: "团建聚餐",
        desc: "美食是最好的团队粘合剂",
        color: "#fb923c",
      },
      {
        icon: Camera,
        title: "出游合影",
        desc: "留下每一个珍贵瞬间",
        color: "#34d399",
      },
    ],
  },
  {
    title: "2025 · 工作",
    subtitle: "新的征程，更大的舞台",
    cards: [
      {
        icon: Promotion,
        title: "新项目启航",
        desc: "更高维度的技术挑战",
        color: "#f43f5e",
      },
      {
        icon: DataLine,
        title: "数据驱动",
        desc: "用数据讲述增长故事",
        color: "#22d3ee",
      },
      {
        icon: Star,
        title: "年度之星",
        desc: "努力终会被看见",
        color: "#facc15",
      },
    ],
  },
];

/* ─── 8张卡片在 1000×3000 坐标系中的固定位置 ─── */
/* 交替左右排布，留出足够空间给大卡片 */
/* viewBox: 1000 宽 × 3000 高（每页1000高） */
const cardPoints = [
  // 页面1: 3张图 (y: 0~1000)
  { x: 250, y: 200 }, // 卡片1 - 左
  { x: 720, y: 520 }, // 卡片2 - 右
  { x: 280, y: 830 }, // 卡片3 - 左
  // 页面2: 2张图 (y: 1000~2000)
  { x: 700, y: 1320 }, // 卡片4 - 右
  { x: 280, y: 1700 }, // 卡片5 - 左
  // 页面3: 3张图 (y: 2000~3000)
  { x: 720, y: 2200 }, // 卡片6 - 右
  { x: 260, y: 2520 }, // 卡片7 - 左
  { x: 700, y: 2830 }, // 卡片8 - 右
];

/* 生成一条贯穿所有卡片的弯曲路径 */
function buildCurvePath(): string {
  const pts = cardPoints;
  // 起点在第一张卡片上方
  let d = `M ${pts[0].x},${pts[0].y - 100}`;
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const prev = i === 0 ? { x: pts[0].x, y: pts[0].y - 100 } : pts[i - 1];
    // 控制点：水平方向朝当前点偏移，制造弯曲效果
    const cpx1 = prev.x + (curr.x - prev.x) * 0.15;
    const cpy1 = prev.y + (curr.y - prev.y) * 0.7;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.15;
    const cpy2 = prev.y + (curr.y - prev.y) * 0.3;
    d += ` C ${cpx1},${cpy1} ${cpx2},${cpy2} ${curr.x},${curr.y}`;
  }
  // 末尾延伸一点
  const last = pts[pts.length - 1];
  d += ` C ${last.x},${last.y + 40} ${last.x + 30},${last.y + 80} ${last.x},${last.y + 120}`;
  return d;
}

const curvePath = buildCurvePath();

/* 将卡片数据展平，附加坐标 */
const allCards = sections
  .flatMap((sec) => sec.cards)
  .map((card, i) => ({
    ...card,
    x: cardPoints[i].x,
    y: cardPoints[i].y,
    side: cardPoints[i].x > 500 ? "right" : ("left" as "left" | "right"),
  }));

/* ─── 页面切换逻辑 ─── */
const current = ref(0);
const isAnimating = ref(false);
const ANIM_DURATION = 700;

const totalPages = sections.length;
const isLast = computed(() => current.value === totalPages - 1);

function goTo(index: number) {
  if (index === current.value || isAnimating.value) return;
  if (index < 0 || index >= totalPages) return;
  isAnimating.value = true;
  current.value = index;
  setTimeout(() => {
    isAnimating.value = false;
  }, ANIM_DURATION);
}
function next() {
  goTo(current.value + 1);
}
function prev() {
  goTo(current.value - 1);
}

/* ─── 滚轮 ─── */
let wheelAccum = 0;
let wheelRafId = 0;
function onWheel(e: WheelEvent) {
  e.preventDefault();
  if (isAnimating.value) return;
  wheelAccum += e.deltaY;
  cancelAnimationFrame(wheelRafId);
  wheelRafId = requestAnimationFrame(() => {
    if (wheelAccum > 30) next();
    else if (wheelAccum < -30) prev();
    wheelAccum = 0;
  });
}

/* ─── 触摸 ─── */
let touchStartY = 0;
function onTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0].clientY;
}
function onTouchEnd(e: TouchEvent) {
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 40) {
    dy > 0 ? next() : prev();
  }
}

/* ─── 键盘 ─── */
function onKey(e: KeyboardEvent) {
  if (e.key === "ArrowDown" || e.key === " ") {
    e.preventDefault();
    next();
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    prev();
  }
}

/* ─── 生命周期 ─── */
const containerRef = ref<HTMLElement | null>(null);
onMounted(() => {
  window.addEventListener("keydown", onKey);
  containerRef.value?.addEventListener("wheel", onWheel, { passive: false });
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  containerRef.value?.removeEventListener("wheel", onWheel);
  cancelAnimationFrame(wheelRafId);
});
</script>

<template>
  <div
    ref="containerRef"
    class="career-page"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- 整体滚动容器（3个页面高度） -->
    <div
      class="scroll-track"
      :style="{
        transform: `translateY(-${current * 100}vh)`,
        transition: `transform ${ANIM_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`,
      }"
    >
      <!-- 背景层：3 个页面各自的渐变 -->
      <div class="bg-layer">
        <div class="bg-section bg-1" />
        <div class="bg-section bg-2" />
        <div class="bg-section bg-3" />
      </div>

      <!-- 章节标题（固定在每个页面的顶部） -->
      <div
        v-for="(sec, si) in sections"
        :key="si"
        class="section-title"
        :style="{ top: `calc(${si * 100}vh + 5vh)` }"
      >
        <h2 class="title-text">{{ sec.title }}</h2>
        <p class="subtitle-text">{{ sec.subtitle }}</p>
      </div>

      <!-- 连续 SVG 虚线（贯穿 3 页） -->
      <svg
        class="global-curve"
        viewBox="0 0 1000 3000"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 发光底层 -->
        <path
          :d="curvePath"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          stroke-width="6"
          stroke-linecap="round"
        />
        <!-- 虚线主体 -->
        <path
          :d="curvePath"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          stroke-width="2"
          stroke-dasharray="14 10"
          stroke-linecap="round"
          class="dash-animate"
        />
        <!-- 卡片锚点 -->
        <template v-for="(card, ci) in allCards" :key="ci">
          <circle
            :cx="card.x"
            :cy="card.y"
            r="6"
            :fill="card.color"
            fill-opacity="0.9"
          />
          <circle
            :cx="card.x"
            :cy="card.y"
            r="12"
            :fill="card.color"
            fill-opacity="0.2"
            class="pulse-dot"
          />
        </template>
      </svg>

      <!-- 图片卡片（绝对定位在 SVG 之上） -->
      <div
        v-for="(card, ci) in allCards"
        :key="ci"
        class="photo-card"
        :class="[card.side]"
        :style="{
          '--cx': `${(card.x / 1000) * 100}%`,
          '--cy': `${(card.y / 3000) * 100}%`,
          '--accent': card.color,
          '--delay': `${ci * 0.08}s`,
        }"
      >
        <!-- 图片占位（icon 模拟） -->
        <div class="card-image" :style="{ borderColor: card.color + '50' }">
          <div
            class="image-bg"
            :style="{
              background: `linear-gradient(135deg, ${card.color}18, ${card.color}08)`,
            }"
          >
            <component
              :is="card.icon"
              class="card-icon"
              :style="{ color: card.color }"
            />
          </div>
        </div>
        <!-- 文字 -->
        <div class="card-info">
          <span
            class="card-tag"
            :style="{ color: card.color, borderColor: card.color + '40' }"
          >
            {{ card.title }}
          </span>
          <p class="card-desc">{{ card.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 右侧指示器 -->
    <div class="indicator">
      <template v-for="(sec, i) in sections" :key="i">
        <div class="dot" :class="{ active: current === i }" @click="goTo(i)">
          <span class="dot-label">{{ sec.title.split("·")[0].trim() }}</span>
        </div>
        <div v-if="i < sections.length - 1" class="ind-line" />
      </template>
    </div>

    <!-- 下滑提示 -->
    <Transition name="fade-btn">
      <button
        v-if="!isLast"
        class="scroll-down-btn"
        @click="next"
        aria-label="下一页"
      >
        <span class="scroll-text">向下滑动</span>
        <div class="chevrons">
          <svg class="chevron" viewBox="0 0 24 24" fill="none">
            <polyline
              points="6 9 12 15 18 9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg class="chevron" viewBox="0 0 24 24" fill="none">
            <polyline
              points="6 9 12 15 18 9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </button>
    </Transition>

    <!-- 返回 -->
    <button class="back-btn" @click="router.push('/')">← 返回</button>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════
   全局容器
   ═══════════════════════════════════ */
.career-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #0a0e1a;
}

.scroll-track {
  position: relative;
  width: 100%;
  height: 300vh; /* 3页 */
  will-change: transform;
}

/* ═══════════════════════════════════
   背景层
   ═══════════════════════════════════ */
.bg-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.bg-section {
  width: 100%;
  height: calc(100% / 3);
}

.bg-1 {
  background: linear-gradient(180deg, #0a0e1a 0%, #0f1b2d 40%, #101d30 100%);
}
.bg-2 {
  background: linear-gradient(180deg, #101d30 0%, #151028 50%, #1a0e2e 100%);
}
.bg-3 {
  background: linear-gradient(180deg, #1a0e2e 0%, #1c1208 50%, #12100a 100%);
}

/* ═══════════════════════════════════
   章节标题
   ═══════════════════════════════════ */
.section-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 30;
  pointer-events: none;
}

.title-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.12em;
  margin: 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.6);
}

.subtitle-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 6px;
  letter-spacing: 0.06em;
  font-weight: 300;
}

/* ═══════════════════════════════════
   连续 SVG 虚线
   ═══════════════════════════════════ */
.global-curve {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  max-width: 800px;
  height: 100%;
  z-index: 5;
  pointer-events: none;
}

.dash-animate {
  animation: dash-flow 3s linear infinite;
}

@keyframes dash-flow {
  to {
    stroke-dashoffset: -48;
  }
}

.pulse-dot {
  animation: pulse-ring 2.5s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%,
  100% {
    fill-opacity: 0.2;
  }
  50% {
    fill-opacity: 0.06;
  }
}

/* ═══════════════════════════════════
   图片卡片 — 大尺寸，图是主角
   ═══════════════════════════════════ */
.photo-card {
  position: absolute;
  /* 通过 CSS 变量定位在 SVG 坐标系对应的位置 */
  top: var(--cy);
  z-index: 20;
  width: 260px;
  animation: card-float-in 0.8s ease both;
  animation-delay: var(--delay);
}

/* 左侧卡片：锚点在右边 → 卡片在锚点左侧 */
.photo-card.left {
  /* 锚点 x 对应 global-curve 的宽度(70% of viewport) */
  /* 使用 calc：left = 15%(SVG偏移) + cx*70% - 卡片宽度 - 间距 */
  right: calc(100% - 15% - var(--cx) * 0.7 + 40px);
  left: auto;
  transform: translateY(-50%);
}

/* 右侧卡片：锚点在左边 → 卡片在锚点右侧 */
.photo-card.right {
  left: calc(15% + var(--cx) * 0.7 + 40px);
  right: auto;
  transform: translateY(-50%);
}

@keyframes card-float-in {
  from {
    opacity: 0;
    transform: translateY(-40%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
}

.card-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 16px;
  border: 1.5px solid;
  overflow: hidden;
  transition:
    transform 0.4s ease,
    box-shadow 0.4s ease;
}

.photo-card:hover .card-image {
  transform: scale(1.03);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.4),
    0 0 30px color-mix(in srgb, var(--accent) 20%, transparent);
}

.image-bg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon {
  width: 56px;
  height: 56px;
  opacity: 0.8;
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.photo-card:hover .card-icon {
  opacity: 1;
  transform: scale(1.1);
}

.card-info {
  padding: 12px 4px 0;
}

.card-tag {
  display: inline-block;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border: 1px solid;
  border-radius: 999px;
}

.card-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 8px 0 0;
  line-height: 1.6;
}

/* ═══════════════════════════════════
   右侧指示器
   ═══════════════════════════════════ */
.indicator {
  position: fixed;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 50;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  background: transparent;
  cursor: pointer;
  transition: all 0.35s ease;
  flex-shrink: 0;
  position: relative;
}

.dot-label {
  position: absolute;
  right: 22px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: rgba(255, 255, 255, 0);
  white-space: nowrap;
  letter-spacing: 0.04em;
  font-weight: 500;
  transition: color 0.3s ease;
  pointer-events: none;
}

.dot:hover .dot-label,
.dot.active .dot-label {
  color: rgba(255, 255, 255, 0.65);
}

.dot.active {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
  transform: scale(1.3);
}

.dot:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.15);
}

.ind-line {
  width: 1.5px;
  height: 28px;
  background: rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

/* ═══════════════════════════════════
   返回 & 下滑按钮
   ═══════════════════════════════════ */
.back-btn {
  position: fixed;
  bottom: 32px;
  right: 28px;
  z-index: 100;
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(14px);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.25s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.35);
  color: rgba(255, 255, 255, 0.9);
}

.scroll-down-btn {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  padding: 10px 22px 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition:
    background 0.3s,
    border-color 0.3s,
    color 0.3s;
}

.scroll-down-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.35);
  color: rgba(255, 255, 255, 1);
}

.scroll-text {
  font-size: 11px;
  letter-spacing: 0.12em;
  font-weight: 500;
  user-select: none;
  line-height: 1;
}

.chevrons {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2px;
}

.chevron {
  width: 18px;
  height: 18px;
  display: block;
  animation: chevron-bounce 1.4s ease-in-out infinite;
}

.chevron:nth-child(2) {
  animation-delay: 0.22s;
  opacity: 0.55;
  margin-top: -8px;
}

@keyframes chevron-bounce {
  0% {
    transform: translateY(-3px);
    opacity: 0.3;
  }
  50% {
    transform: translateY(3px);
    opacity: 1;
  }
  100% {
    transform: translateY(-3px);
    opacity: 0.3;
  }
}

.fade-btn-enter-active,
.fade-btn-leave-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s ease;
}
.fade-btn-enter-from,
.fade-btn-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

/* ═══════════════════════════════════
   响应式
   ═══════════════════════════════════ */
@media (max-width: 900px) {
  .global-curve {
    width: 60%;
  }

  .photo-card {
    width: 200px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
  }

  .title-text {
    font-size: 1.2rem;
  }
}

@media (max-width: 600px) {
  .global-curve {
    width: 40%;
  }

  .photo-card {
    width: 150px;
  }

  .photo-card.left {
    right: auto;
    left: 4%;
  }

  .photo-card.right {
    left: auto;
    right: 4%;
  }

  .card-icon {
    width: 32px;
    height: 32px;
  }

  .card-tag {
    font-size: 0.72rem;
    padding: 2px 8px;
  }

  .card-desc {
    font-size: 0.7rem;
  }

  .indicator {
    right: 12px;
  }

  .dot-label {
    display: none;
  }
}
</style>
