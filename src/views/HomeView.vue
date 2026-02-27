<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import OceanParticleBurst from "@/components/OceanParticleBurst.vue";
import GalaxySpeedLines from "@/components/GalaxySpeedLines.vue";

const router = useRouter();
const menuOpen = ref(false);
const hoveredIndex = ref<number | null>(null);
const bubbleHovered = ref(false);

// 彩蛋
const showMaleMermaid = ref(false);
const showFemaleMermaid = ref(false);
const showAlien = ref(false);
const showUfo = ref(false);
let eggTimer2: ReturnType<typeof setTimeout> | null = null;
let eggTimer4: ReturnType<typeof setTimeout> | null = null;

function onBubbleEnter() {
  bubbleHovered.value = true;
  if (theme.value === "ocean") {
    eggTimer2 = setTimeout(() => {
      showMaleMermaid.value = true;
    }, 2000);
    eggTimer4 = setTimeout(() => {
      showFemaleMermaid.value = true;
    }, 4000);
  } else {
    eggTimer2 = setTimeout(() => {
      showAlien.value = true;
    }, 2000);
    eggTimer4 = setTimeout(() => {
      showUfo.value = true;
    }, 4000);
  }
}

function onBubbleLeave() {
  bubbleHovered.value = false;
  if (eggTimer2) {
    clearTimeout(eggTimer2);
    eggTimer2 = null;
  }
  if (eggTimer4) {
    clearTimeout(eggTimer4);
    eggTimer4 = null;
  }
  showMaleMermaid.value = false;
  showFemaleMermaid.value = false;
  showAlien.value = false;
  showUfo.value = false;
}

// 主题切换
type Theme = "ocean" | "galaxy";
const theme = ref<Theme>("ocean");
function toggleTheme() {
  theme.value = theme.value === "ocean" ? "galaxy" : "ocean";
}

const pages = [
  { id: 1, label: "学业" },
  { id: 2, label: "事业" },
  { id: 3, label: "生活" },
];

function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// 随机气泡（海洋模式）
interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}
const bubbles: Bubble[] = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: randBetween(2, 98),
  size: randBetween(4, 22),
  duration: randBetween(7, 20),
  delay: randBetween(0, 15),
  opacity: randBetween(0.05, 0.22),
}));

// 随机浮星（星河模式）
interface StarParticle {
  id: number;
  x: number; // left %
  y: number; // top %
  size: number; // px
  opacity: number;
  duration: number;
  delay: number;
  dx: number; // drift x px
  dy: number; // drift y px
  twinkleDur: number;
}
const starParticles: StarParticle[] = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: randBetween(0, 100),
  y: randBetween(0, 100),
  size: randBetween(1, i < 20 ? 4 : 2),
  opacity: randBetween(0.25, 0.95),
  duration: randBetween(6, 18),
  delay: randBetween(0, 12),
  dx: randBetween(-18, 18),
  dy: randBetween(-12, 12),
  twinkleDur: randBetween(2, 6),
}));

function getStarStyle(s: StarParticle): Record<string, string> {
  return {
    left: s.x + "%",
    top: s.y + "%",
    width: s.size + "px",
    height: s.size + "px",
    "--star-opacity": String(s.opacity),
    "--dx": s.dx + "px",
    "--dy": s.dy + "px",
    animationDuration: s.duration + "s",
    animationDelay: s.delay + "s",
    "--twinkle-dur": s.twinkleDur + "s",
  };
}

// 流星
// 流星雨 — 统一从右上飞向左下
interface Meteor {
  id: number;
  x: number; // 起始 left %（右侧/顶部散布）
  y: number; // 起始 top %
  length: number; // 拖尾长 px
  cycle: number; // 循环周期 s
  delay: number; // 首次出现延迟 s
  opacity: number; // 亮度微调
}
const meteors: Meteor[] = [
  { id: 0, x: 92, y: -3, length: 300, cycle: 9, delay: 0.0, opacity: 1.0 },
  { id: 1, x: 72, y: 8, length: 240, cycle: 13, delay: 4.5, opacity: 0.9 },
];

function getMeteorStyle(m: Meteor): Record<string, string> {
  return {
    left: m.x + "%",
    top: m.y + "%",
    "--length": m.length + "px",
    "--opacity": String(m.opacity),
    animationDuration: m.cycle + "s",
    animationDelay: m.delay + "s",
  };
}

// 弧边梯形参数
const OUTER_R = 210; // 外弧半径
const INNER_R = 120; // 内弧半径
const SECTORS = pages.length;
const STEP = 360 / SECTORS; // 每块占 90°
const GAP_DEG = 4; // 间隙角度（两侧各留一半）

// 色彩（4个）
const sectorColors = [
  "rgba(160, 120, 255, 0.18)",
  "rgba(40, 160, 255, 0.18)",
  "rgba(30, 195, 185, 0.18)",
  "rgba(130, 110, 248, 0.18)",
];

const sectorGlowColors = [
  "rgba(180, 140, 255, 0.55)",
  "rgba(50, 175, 255, 0.55)",
  "rgba(40, 210, 200, 0.55)",
  "rgba(145, 125, 255, 0.55)",
];

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * 弧边梯形路径：
 * 外弧 → 直线连内弧端点 → 内弧（反向）→ 闭合
 * 两侧是直线段，上下是弧线，形成环形砖块。
 */
function getTrapPath(index: number, expand = 0): string {
  const outerR = OUTER_R + expand;
  const innerR = INNER_R;
  const half = GAP_DEG / 2;
  const startAngle = index * STEP - 90 + half;
  const endAngle = startAngle + STEP - GAP_DEG;

  const ox1 = outerR * Math.cos(toRad(startAngle));
  const oy1 = outerR * Math.sin(toRad(startAngle));
  const ox2 = outerR * Math.cos(toRad(endAngle));
  const oy2 = outerR * Math.sin(toRad(endAngle));
  const ix2 = innerR * Math.cos(toRad(endAngle));
  const iy2 = innerR * Math.sin(toRad(endAngle));
  const ix1 = innerR * Math.cos(toRad(startAngle));
  const iy1 = innerR * Math.sin(toRad(startAngle));

  // 外弧大于180°需要 large-arc-flag=1，这里每块 <180° 所以 0
  return [
    `M ${ox1} ${oy1}`,
    `A ${outerR} ${outerR} 0 0 1 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${innerR} ${innerR} 0 0 0 ${ix1} ${iy1}`,
    `Z`,
  ].join(" ");
}

// 外弧高光线
function getOuterArcPath(index: number, expand = 0): string {
  const outerR = OUTER_R + expand;
  const half = GAP_DEG / 2 + 0.8;
  const startAngle = index * STEP - 90 + half;
  const endAngle = startAngle + STEP - GAP_DEG - 1.6;
  const x1 = outerR * Math.cos(toRad(startAngle));
  const y1 = outerR * Math.sin(toRad(startAngle));
  const x2 = outerR * Math.cos(toRad(endAngle));
  const y2 = outerR * Math.sin(toRad(endAngle));
  return `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2}`;
}

// 标签中心
function getLabelPos(index: number) {
  const midAngle = index * STEP + STEP / 2 - 90;
  const r = (INNER_R + OUTER_R) / 2;
  return {
    x: r * Math.cos(toRad(midAngle)),
    y: r * Math.sin(toRad(midAngle)),
  };
}

function openMenu() {
  if (!menuOpen.value) menuOpen.value = true;
}

function closeMenu() {
  if (menuOpen.value) menuOpen.value = false;
}

// 点击外部关闭菜单
function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  // 如果点击的是菜单区域内（SVG扇形或泡泡）则不关闭
  if (target.closest(".radial-svg") || target.closest(".bubble")) return;
  closeMenu();
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});

function goToPage(id: number) {
  router.push(`/page/${id}`);
}
</script>

<template>
  <div class="home" :class="theme">
    <!-- 主题切换按钮 -->
    <button class="theme-toggle" @click="toggleTheme" :class="theme">
      <span class="toggle-icon">{{ theme === "ocean" ? "🌊" : "🌌" }}</span>
      <span class="toggle-label">{{
        theme === "ocean" ? "海洋" : "星河"
      }}</span>
      <span class="toggle-arrow">⇄</span>
    </button>

    <!-- 背景星点 -->
    <div class="stars" />

    <!-- 海洋模式：浮动气泡 + 海底光晕 -->
    <template v-if="theme === 'ocean'">
      <div class="bubbles-layer" aria-hidden="true">
        <div
          v-for="b in bubbles"
          :key="b.id"
          class="float-bubble"
          :style="{
            left: b.x + '%',
            width: b.size + 'px',
            height: b.size + 'px',
            opacity: b.opacity,
            animationDuration: b.duration + 's',
            animationDelay: b.delay + 's',
          }"
        />
      </div>
      <div class="ocean-glow" />
    </template>

    <!-- 银河模式：漫画集中线 -->
    <GalaxySpeedLines
      v-if="theme === 'galaxy'"
      :active="bubbleHovered && !menuOpen"
    />

    <!-- 星河模式：浮星 + 星云带 -->
    <template v-if="theme === 'galaxy'">
      <div class="galaxy-layer" aria-hidden="true">
        <!-- 星云带 -->
        <div class="nebula-band band-1" />
        <div class="nebula-band band-2" />
        <!-- 浮动星点 -->
        <div
          v-for="s in starParticles"
          :key="s.id"
          class="float-star"
          :style="getStarStyle(s)"
        />
        <!-- 流星 -->
        <div
          v-for="m in meteors"
          :key="'m' + m.id"
          class="meteor"
          :style="getMeteorStyle(m)"
        />
      </div>
    </template>

    <div class="scene">
      <!-- 扇形菜单 SVG -->
      <Transition name="menu">
        <svg
          v-if="menuOpen"
          class="radial-svg"
          viewBox="-240 -240 480 480"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- SVG 定义：渐变 -->
          <defs>
            <!-- 毛玻璃径向渐变 -->
            <radialGradient
              id="glass-fill"
              cx="0"
              cy="0"
              r="220"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stop-color="white" stop-opacity="0.12" />
              <stop offset="60%" stop-color="white" stop-opacity="0.06" />
              <stop offset="100%" stop-color="white" stop-opacity="0.02" />
            </radialGradient>
          </defs>

          <g
            v-for="(page, i) in pages"
            :key="page.id"
            class="sector-group"
            :class="{ 'sector-hovered': hoveredIndex === i }"
            :style="{ animationDelay: `${i * 45}ms` }"
            @mouseenter="hoveredIndex = i"
            @mouseleave="hoveredIndex = null"
            @click="goToPage(page.id)"
            style="cursor: pointer"
          >
            <!-- 毛玻璃底色 -->
            <path
              :d="getTrapPath(i)"
              :fill="
                hoveredIndex === i
                  ? sectorColors[i].replace('0.18', '0.28')
                  : sectorColors[i]
              "
              style="transition: fill 0.3s ease"
            />

            <!-- 玻璃光泽叠层 -->
            <path
              :d="getTrapPath(i)"
              fill="url(#glass-fill)"
              :opacity="hoveredIndex === i ? 1 : 0.6"
              style="transition: opacity 0.3s ease"
            />

            <!-- 极细边框（仅hover时微微显现） -->
            <path
              :d="getTrapPath(i)"
              fill="none"
              :stroke="
                hoveredIndex === i
                  ? 'rgba(255,255,255,0.30)'
                  : 'rgba(255,255,255,0.08)'
              "
              stroke-width="0.8"
              style="transition: stroke 0.3s ease"
            />

            <!-- 6. 年份标签 -->
            <text
              :x="getLabelPos(i).x"
              :y="getLabelPos(i).y"
              text-anchor="middle"
              dominant-baseline="middle"
              class="sector-label"
              :class="{ 'sector-label--hover': hoveredIndex === i }"
              style="pointer-events: none"
            >
              {{ page.label }}
            </text>
          </g>
        </svg>
      </Transition>

      <!-- 海洋模式：粒子光芒 -->
      <OceanParticleBurst
        v-if="theme === 'ocean'"
        :active="bubbleHovered && !menuOpen"
      />

      <!-- 中心透明泡泡 -->
      <div
        class="bubble"
        :class="{ 'bubble--open': menuOpen }"
        @click="openMenu"
        @mouseenter="onBubbleEnter"
        @mouseleave="onBubbleLeave"
      >
        <div class="bubble-shine" />
        <span class="bubble-text">{{ menuOpen ? "" : "START" }}</span>
      </div>
    </div>

    <!-- 海洋彩蛋：美人鱼 -->
    <Transition name="mermaid-rise">
      <div v-if="showMaleMermaid" class="mermaid-male">
        <span>🧜‍♂️</span>
      </div>
    </Transition>
    <Transition name="mermaid-right">
      <div v-if="showFemaleMermaid" class="mermaid-female">
        <span>🧜‍♀️</span>
      </div>
    </Transition>

    <!-- 星河彩蛋：外星人 & 飞碑 -->
    <Transition name="alien-in">
      <div v-if="showAlien" class="alien-egg">
        <span>👽</span>
      </div>
    </Transition>
    <Transition name="ufo-in">
      <div v-if="showUfo" class="ufo-egg">
        <span>🛸</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.home {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
  background: linear-gradient(
    180deg,
    #021a30 0%,
    #063a5c 15%,
    #0b5a8a 32%,
    #1278a8 48%,
    #1a92c2 62%,
    #22a8d8 76%,
    #2bbce8 88%,
    #38caf0 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 1.2s ease;
}

/* 星河模式背景 */
.home.galaxy {
  background: linear-gradient(
    180deg,
    #000003 0%,
    #04000e 18%,
    #080018 38%,
    #0a0020 55%,
    #060015 72%,
    #030010 88%,
    #000008 100%
  );
}

/* 主题切换按钮 */
.theme-toggle {
  position: fixed;
  top: 24px;
  right: 28px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: rgba(255, 255, 255, 0.88);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow:
    0 2px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition:
    background 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
  user-select: none;
}
.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.13);
  border-color: rgba(255, 255, 255, 0.38);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}
.theme-toggle:active {
  transform: translateY(0) scale(0.97);
}
.theme-toggle.galaxy {
  border-color: rgba(180, 140, 255, 0.35);
  box-shadow:
    0 2px 16px rgba(120, 60, 255, 0.2),
    inset 0 1px 0 rgba(200, 170, 255, 0.12);
}
.toggle-icon {
  font-size: 15px;
}
.toggle-label {
  font-size: 13px;
}
.toggle-arrow {
  font-size: 14px;
  opacity: 0.55;
  margin-left: 2px;
}

/* 浮动气泡层 */
.bubbles-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.float-bubble {
  position: absolute;
  bottom: -40px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 35% 30%,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(180, 220, 255, 0.2) 45%,
    transparent 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: inset 0 0 4px rgba(255, 255, 255, 0.15);
  animation: bubble-rise linear infinite;
  will-change: transform, opacity;
}

@keyframes bubble-rise {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: var(--base-opacity, 0.12);
  }
  20% {
    transform: translateY(-20vh) translateX(12px) scale(1.02);
  }
  50% {
    transform: translateY(-50vh) translateX(-10px) scale(0.98);
  }
  80% {
    transform: translateY(-80vh) translateX(8px) scale(1.01);
    opacity: var(--base-opacity, 0.12);
  }
  100% {
    transform: translateY(-105vh) translateX(-5px) scale(0.95);
    opacity: 0;
  }
}

/* 星点背景（两种模式均保留少量星点） */
.stars {
  position: absolute;
  inset: 0;
  transition: opacity 1s ease;
  background-image:
    radial-gradient(
      1px 1px at 15% 12%,
      rgba(255, 255, 255, 0.7) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 32% 8%,
      rgba(255, 255, 255, 0.5) 0%,
      transparent 100%
    ),
    radial-gradient(
      1.5px 1.5px at 55% 5%,
      rgba(255, 255, 255, 0.6) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 72% 14%,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 88% 9%,
      rgba(255, 255, 255, 0.6) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 8% 25%,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 100%
    ),
    radial-gradient(
      1.5px 1.5px at 42% 20%,
      rgba(255, 255, 255, 0.3) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 68% 18%,
      rgba(255, 255, 255, 0.5) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 93% 22%,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 22% 3%,
      rgba(255, 255, 255, 0.6) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 78% 28%,
      rgba(255, 255, 255, 0.3) 0%,
      transparent 100%
    ),
    radial-gradient(
      1.5px 1.5px at 5% 40%,
      rgba(255, 255, 255, 0.25) 0%,
      transparent 100%
    );
  pointer-events: none;
}

/* 海底光晕 */
.ocean-glow {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 350px;
  background: radial-gradient(
    ellipse,
    rgba(30, 140, 200, 0.2) 0%,
    transparent 70%
  );
  pointer-events: none;
  filter: blur(20px);
}

.scene {
  position: relative;
  width: 500px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========================
   美人鱼彩蛋
======================== */

/* 男美人鱼：超大，底部冒出，下半截藏在屏幕底边外，位于左侧 */
.mermaid-male {
  position: absolute;
  left: 60px;
  bottom: -100px; /* 下半截（约200px）藏在底边外 */
  pointer-events: none;
  z-index: 50;
  animation: mermaid-bob-bottom 3.2s ease-in-out infinite;
}
.mermaid-male span {
  font-size: 380px;
  line-height: 1;
  display: block;
  filter: drop-shadow(0 0 40px rgba(60, 180, 255, 0.75))
    drop-shadow(0 0 80px rgba(30, 120, 255, 0.4));
}

/* 女美人鱼：较大，整体显示在右侧 */
.mermaid-female {
  position: absolute;
  right: 24px;
  top: 50%;
  margin-top: -90px; /* 垂直居中偏移 */
  pointer-events: none;
  z-index: 50;
  animation: mermaid-bob 3s ease-in-out infinite;
  animation-delay: 0.5s;
}
.mermaid-female span {
  font-size: 180px;
  line-height: 1;
  display: block;
  filter: drop-shadow(0 0 24px rgba(200, 120, 255, 0.7))
    drop-shadow(0 0 50px rgba(160, 80, 255, 0.35));
}

/* Male bob：在底部上下浮动（负Y = 向上冒） */
@keyframes mermaid-bob-bottom {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-28px);
  }
}

/* Female bob */
@keyframes mermaid-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-22px);
  }
}

/* 男鱼：从底部冒出 */
.mermaid-rise-enter-active {
  transition:
    opacity 0.5s ease,
    transform 0.7s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.mermaid-rise-leave-active {
  transition:
    opacity 0.35s ease-in,
    transform 0.35s ease-in;
}
.mermaid-rise-enter-from {
  opacity: 0;
  transform: translateY(120px);
}
.mermaid-rise-leave-to {
  opacity: 0;
  transform: translateY(100px);
}

/* 女鱼：从右侧滑入 */
.mermaid-right-enter-active {
  transition:
    opacity 0.5s ease,
    transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.mermaid-right-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease-in;
}
.mermaid-right-enter-from {
  opacity: 0;
  transform: translateX(80px);
}
.mermaid-right-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

/* ========================
   星河彩蛋：外星人 & 飞碑
======================== */
.alien-egg {
  position: absolute;
  left: 80px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 50;
  animation: alien-float 3s ease-in-out infinite;
}
.alien-egg span {
  font-size: 120px;
  line-height: 1;
  display: block;
  filter: drop-shadow(0 0 30px rgba(140, 255, 160, 0.7))
    drop-shadow(0 0 60px rgba(80, 220, 120, 0.3));
}

.ufo-egg {
  position: absolute;
  right: 60px;
  top: 38%;
  pointer-events: none;
  z-index: 50;
  animation: ufo-hover 2.5s ease-in-out infinite;
  animation-delay: 0.3s;
}
.ufo-egg span {
  font-size: 140px;
  line-height: 1;
  display: block;
  filter: drop-shadow(0 0 24px rgba(180, 160, 255, 0.7))
    drop-shadow(0 0 50px rgba(120, 100, 255, 0.35));
}

@keyframes alien-float {
  0%,
  100% {
    transform: translateY(-50%);
  }
  50% {
    transform: translateY(calc(-50% - 16px));
  }
}

@keyframes ufo-hover {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }
  50% {
    transform: translateY(-20px) rotate(3deg);
  }
}

/* 外星人：从左侧淡入 */
.alien-in-enter-active {
  transition:
    opacity 0.5s ease,
    transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.alien-in-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease-in;
}
.alien-in-enter-from {
  opacity: 0;
  transform: translateX(-60px) translateY(-50%);
}
.alien-in-leave-to {
  opacity: 0;
  transform: translateX(-40px) translateY(-50%);
}

/* 飞碑：从右侧飞入 */
.ufo-in-enter-active {
  transition:
    opacity 0.5s ease,
    transform 0.7s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.ufo-in-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease-in;
}
.ufo-in-enter-from {
  opacity: 0;
  transform: translateX(80px) rotate(10deg);
}
.ufo-in-leave-to {
  opacity: 0;
  transform: translateX(60px) rotate(5deg);
}

/* ========================
   星河模式
======================== */
.galaxy-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 星云带 */
.nebula-band {
  position: absolute;
  width: 220%;
  left: -60%;
  pointer-events: none;
  filter: blur(38px);
}
.band-1 {
  height: 30%;
  top: 20%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(110, 60, 200, 0.07) 20%,
    rgba(160, 100, 255, 0.12) 42%,
    rgba(200, 140, 255, 0.09) 58%,
    rgba(80, 120, 220, 0.06) 78%,
    transparent 100%
  );
  animation: nebula-drift-1 28s ease-in-out infinite alternate;
}
.band-2 {
  height: 22%;
  top: 44%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(60, 80, 200, 0.05) 25%,
    rgba(100, 180, 255, 0.1) 48%,
    rgba(60, 140, 210, 0.07) 70%,
    transparent 100%
  );
  animation: nebula-drift-2 22s ease-in-out infinite alternate-reverse;
}
@keyframes nebula-drift-1 {
  from {
    transform: rotate(-22deg) translateX(-2%);
  }
  to {
    transform: rotate(-22deg) translateX(2%);
  }
}
@keyframes nebula-drift-2 {
  from {
    transform: rotate(-16deg) translateX(-3%);
  }
  to {
    transform: rotate(-16deg) translateX(3%);
  }
}

/* 浮动星粒 */
.float-star {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 1) 0%,
    rgba(200, 220, 255, 0.6) 45%,
    transparent 100%
  );
  opacity: var(--star-opacity, 0.6);
  animation:
    star-drift linear infinite,
    star-twinkle ease-in-out infinite alternate;
  animation-duration: inherit, var(--twinkle-dur, 3s);
  will-change: transform, opacity;
}
@keyframes star-drift {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(var(--dx), calc(var(--dy) * 0.4));
  }
  50% {
    transform: translate(calc(var(--dx) * 0.3), var(--dy));
  }
  75% {
    transform: translate(calc(var(--dx) * -0.5), calc(var(--dy) * 0.6));
  }
  100% {
    transform: translate(0, 0);
  }
}
@keyframes star-twinkle {
  from {
    opacity: calc(var(--star-opacity, 0.6) * 0.4);
  }
  to {
    opacity: var(--star-opacity, 0.6);
  }
}

/* 流星雨 — 统一从右上飞向左下 */
.meteor {
  position: absolute;
  width: var(--length, 200px);
  height: 2px;
  transform-origin: 50% 50%;
  background: linear-gradient(
    to left,
    rgba(255, 255, 255, 0) 0%,
    rgba(200, 225, 255, 0.15) 30%,
    rgba(220, 240, 255, 0.6) 65%,
    rgba(255, 255, 255, 0.95) 88%,
    rgba(255, 255, 255, 0) 100%
  );
  border-radius: 2px 0 0 2px;
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
  animation: meteor-shower linear infinite;
  animation-duration: inherit;
  filter: drop-shadow(0 0 2px rgba(220, 235, 255, 1))
    drop-shadow(0 0 8px rgba(180, 210, 255, 0.7))
    drop-shadow(0 0 18px rgba(140, 190, 255, 0.4));
}

/* 流星头部光芒 */
.meteor::after {
  content: "";
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 1) 0%,
    rgba(210, 235, 255, 0.85) 20%,
    rgba(170, 215, 255, 0.5) 50%,
    rgba(130, 190, 255, 0.15) 75%,
    transparent 100%
  );
  filter: blur(2.5px);
  box-shadow:
    0 0 6px 3px rgba(255, 255, 255, 0.9),
    0 0 14px 6px rgba(180, 220, 255, 0.6),
    0 0 28px 10px rgba(140, 200, 255, 0.25);
}

@keyframes meteor-shower {
  /* 等待阶段：大部分时间静止不可见 */
  0%,
  62% {
    opacity: 0;
    transform: translate(0, 0) rotate(-45deg);
  }
  /* 瞬间闪现 */
  62.2% {
    opacity: var(--opacity, 1);
    transform: translate(0, 0) rotate(-45deg);
  }
  /*
   * 飞行段：62.2% → 80%，约占周期 18%
   * 9s 周期 ≈ 1.6s，13s 周期 ≈ 2.3s — 匀速穿越，有质感
   * translate(-130vw, 130vw) 两轴等量 → 精确 45°，与 rotate(-45deg) 对齐
   */
  80% {
    opacity: 0;
    transform: translate(-130vw, 130vw) rotate(-45deg);
  }
  100% {
    opacity: 0;
    transform: translate(-130vw, 130vw) rotate(-45deg);
  }
}

/* ========================
   SVG 环形砖块菜单
======================== */
.radial-svg {
  position: absolute;
  width: 500px;
  height: 500px;
  top: 0;
  left: 0;
}

.sector-group {
  animation: sector-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.sector-group:hover {
  filter: drop-shadow(0 0 12px rgba(120, 180, 255, 0.25));
}

@keyframes sector-in {
  from {
    opacity: 0;
    transform: scale(0.15);
    transform-origin: 0 0;
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: scale(1);
    transform-origin: 0 0;
    filter: blur(0);
  }
}

.sector-label {
  font-size: 14px;
  font-weight: 700;
  fill: rgba(255, 255, 255, 0.85);
  letter-spacing: 2px;
  font-family: inherit;
  transition: all 0.25s ease;
}
.sector-label--hover {
  fill: #ffffff;
  font-size: 15px;
  letter-spacing: 2.5px;
}

.menu-enter-active {
  transition: opacity 0.3s ease;
}
.menu-leave-active {
  transition: opacity 0.2s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

/* 泡泡 */
.bubble {
  position: relative;
  z-index: 10;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: radial-gradient(
    ellipse at 38% 35%,
    rgba(255, 255, 255, 0.22) 0%,
    rgba(160, 215, 255, 0.1) 40%,
    rgba(80, 170, 255, 0.04) 70%,
    transparent 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    inset 0 0 24px rgba(255, 255, 255, 0.06),
    0 0 40px rgba(60, 160, 255, 0.2),
    0 0 80px rgba(40, 130, 240, 0.1);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  transition:
    transform 0.4s cubic-bezier(0.34, 1.5, 0.64, 1),
    box-shadow 0.5s ease,
    border-color 0.4s ease;
}

.bubble:hover:not(.bubble--open) {
  transform: scale(1.08);
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow:
    inset 0 0 30px rgba(255, 255, 255, 0.08),
    0 0 60px rgba(80, 180, 255, 0.35),
    0 0 120px rgba(50, 150, 255, 0.15);
}

.bubble--open {
  cursor: default;
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 0 30px rgba(255, 255, 255, 0.05),
    0 0 50px rgba(40, 140, 240, 0.25),
    0 0 100px rgba(30, 120, 220, 0.1);
}

/* 泡泡高光 */
.bubble-shine {
  position: absolute;
  top: 14%;
  left: 16%;
  width: 34%;
  height: 24%;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  pointer-events: none;
  transform: rotate(-25deg);
}

.bubble-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.18em;
  text-shadow:
    0 0 16px rgba(160, 220, 255, 0.7),
    0 1px 4px rgba(0, 0, 0, 0.2);
  user-select: none;
  position: relative;
  z-index: 1;
}
</style>
