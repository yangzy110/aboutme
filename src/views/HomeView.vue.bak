<script setup lang="ts">
import { ref, type Ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import GalaxySpeedLines from "@/components/GalaxySpeedLines.vue";
import MouseParticles from "@/components/MouseParticles.vue";

const router = useRouter();
const menuOpen = ref(false);
const hoveredIndex = ref<number | null>(null);
const bubbleHovered = ref(false);

// =========== 入场动画 ===========
const curtainVisible = ref(true);
const scanLineActive = ref(false);
const starsRevealed = ref(false);
const heroNameText = ref("");
const heroRoleText = ref("");
const heroSubText = ref("");
const bubbleReady = ref(false);
const hudVisible = ref(false);
const hintsVisible = ref(false);
const sidePanelsVisible = ref(false);

const HERO_NAME = "杨泽宇";
const HERO_ROLE = "FRONTEND EXPLORER";
const HERO_SUB = "热爱前端 · 拥抱生活 · 探索无限";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function typeWriter(
  text: string,
  target: Ref<string>,
  speed = 100,
): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    target.value = "";
    const timer = setInterval(() => {
      if (i < text.length) {
        target.value += text[i];
        i++;
      } else {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

async function runEntrance() {
  await sleep(200);
  scanLineActive.value = true;
  await sleep(700);
  starsRevealed.value = true;
  curtainVisible.value = false;
  await sleep(500);
  await typeWriter(HERO_NAME, heroNameText, 160);
  await sleep(200);
  await typeWriter(HERO_ROLE, heroRoleText, 45);
  await sleep(200);
  await typeWriter(HERO_SUB, heroSubText, 65);
  await sleep(400);
  bubbleReady.value = true;
  await sleep(300);
  hudVisible.value = true;
  sidePanelsVisible.value = true;
  await sleep(400);
  hintsVisible.value = true;
}

// =========== 轨道卫星 ===========
const orbitAngle = ref(0);
let orbitRAF: number | null = null;

const satellites = [
  {
    offset: 0,
    size: 5,
    orbit: 108,
    speed: 0.8,
    color: "rgba(0, 229, 255, 0.9)",
  },
  {
    offset: 140,
    size: 3.5,
    orbit: 122,
    speed: 0.55,
    color: "rgba(180, 140, 255, 0.8)",
  },
  {
    offset: 250,
    size: 4,
    orbit: 96,
    speed: 1.1,
    color: "rgba(0, 255, 136, 0.8)",
  },
];

function animateOrbit() {
  orbitAngle.value += 0.35;
  orbitRAF = requestAnimationFrame(animateOrbit);
}

function getSatelliteStyle(sat: (typeof satellites)[0]) {
  const angle = ((orbitAngle.value * sat.speed + sat.offset) * Math.PI) / 180;
  const x = Math.cos(angle) * sat.orbit;
  const y = Math.sin(angle) * sat.orbit * 0.45; // 椭圆轨道
  return {
    transform: `translate(${x}px, ${y}px)`,
    width: sat.size + "px",
    height: sat.size + "px",
    background: sat.color,
    boxShadow: `0 0 ${sat.size * 3}px ${sat.color}, 0 0 ${sat.size * 6}px ${sat.color.replace(/[\d.]+\)$/, "0.3)")}`,
  };
}

// =========== HUD 时钟 ===========
const hudTime = ref("");
const hudCoord = ref("");
let hudTimer: ReturnType<typeof setInterval> | null = null;

function updateHud() {
  const now = new Date();
  hudTime.value = now.toTimeString().split(" ")[0];
  hudCoord.value = `${(Math.random() * 90 + 10).toFixed(4)}°N  ${(Math.random() * 180 + 10).toFixed(4)}°E`;
}

// 彩蛋
const showAlien = ref(false);
const showUfo = ref(false);
let eggTimer2: ReturnType<typeof setTimeout> | null = null;
let eggTimer4: ReturnType<typeof setTimeout> | null = null;

function onBubbleEnter() {
  bubbleHovered.value = true;
  eggTimer2 = setTimeout(() => {
    showAlien.value = true;
  }, 2000);
  eggTimer4 = setTimeout(() => {
    showUfo.value = true;
  }, 4000);
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
  showAlien.value = false;
  showUfo.value = false;
}

const pages = [
  { id: 1, label: "学业" },
  { id: 2, label: "事业" },
  { id: 3, label: "生活" },
];

function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// 随机浮星
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
  runEntrance();
  animateOrbit();
  updateHud();
  hudTimer = setInterval(updateHud, 1000);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  if (orbitRAF) cancelAnimationFrame(orbitRAF);
  if (hudTimer) clearInterval(hudTimer);
});

function goToPage(id: number) {
  router.push(`/page/${id}`);
}
</script>

<template>
  <div class="home galaxy">
    <!-- 电影式暗幕 -->
    <Transition name="curtain">
      <div v-if="curtainVisible" class="curtain">
        <div v-if="scanLineActive" class="scan-line" />
        <span class="curtain-init">SYSTEM INITIALIZING...</span>
      </div>
    </Transition>

    <!-- 背景星点 -->
    <div class="stars" :class="{ 'stars--visible': starsRevealed }" />

    <!-- 漫画集中线 -->
    <GalaxySpeedLines :active="bubbleHovered && !menuOpen" />

    <!-- 鼠标星尘粒子 -->
    <MouseParticles />

    <!-- 浮星 + 星云带 -->
    <template>
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

    <!-- HUD 装饰元素 -->
    <div class="hud-layer" :class="{ 'hud--visible': hudVisible }">
      <div class="hud-corner hud-tl">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path
            d="M2 16 L2 2 L16 2"
            fill="none"
            stroke="rgba(0,229,255,0.5)"
            stroke-width="1.5"
          />
        </svg>
      </div>
      <div class="hud-corner hud-tr">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path
            d="M32 2 L46 2 L46 16"
            fill="none"
            stroke="rgba(0,229,255,0.5)"
            stroke-width="1.5"
          />
        </svg>
      </div>
      <div class="hud-corner hud-bl">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path
            d="M2 32 L2 46 L16 46"
            fill="none"
            stroke="rgba(0,229,255,0.5)"
            stroke-width="1.5"
          />
        </svg>
      </div>
      <div class="hud-corner hud-br">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path
            d="M32 46 L46 46 L46 32"
            fill="none"
            stroke="rgba(0,229,255,0.5)"
            stroke-width="1.5"
          />
        </svg>
      </div>
      <div class="hud-data hud-data-left">
        <span class="hud-label">SYS.TIME</span>
        <span class="hud-value">{{ hudTime }}</span>
      </div>
      <div class="hud-data hud-data-right">
        <span class="hud-label">COORD</span>
        <span class="hud-value">{{ hudCoord }}</span>
      </div>
      <div class="hud-line hud-line-top" />
      <div class="hud-line hud-line-bottom" />
    </div>

    <!-- ===== 左侧面板：数据流（3D透视） ===== -->
    <div
      class="side-panel side-left"
      :class="{ 'side--visible': sidePanelsVisible, 'side--hide': menuOpen }"
    >
      <div class="panel-3d panel-3d-left">
        <div class="panel-glass">
          <div class="panel-header">
            <span class="panel-title">// SYSTEM STATUS</span>
            <span class="panel-indicator" />
          </div>
          <div class="data-stream">
            <div
              class="stream-line"
              v-for="n in 8"
              :key="'sl' + n"
              :style="{ animationDelay: n * 0.4 + 's' }"
            >
              <span class="stream-dot" />
              <span class="stream-text">{{
                [
                  "SYS.READY",
                  "VUE 3.5",
                  "TS STRICT",
                  "VITE HMR",
                  "PINIA ✓",
                  "ROUTER ✓",
                  "SSR.OFF",
                  "GPU.ACCEL",
                ][n - 1]
              }}</span>
            </div>
          </div>
          <div class="panel-edge panel-edge-left" />
        </div>
      </div>
    </div>

    <!-- ===== 右侧面板：技术栈（3D透视） ===== -->
    <div
      class="side-panel side-right"
      :class="{ 'side--visible': sidePanelsVisible, 'side--hide': menuOpen }"
    >
      <div class="panel-3d panel-3d-right">
        <div class="panel-glass panel-glass--purple">
          <div class="panel-header panel-header--right">
            <span class="panel-indicator panel-indicator--purple" />
            <span class="panel-title panel-title--purple">TECH STACK //</span>
          </div>
          <div class="tech-stack">
            <div
              class="tech-item"
              v-for="(tech, i) in [
                'Vue',
                'TypeScript',
                'Three.js',
                'CSS Art',
                'Node.js',
              ]"
              :key="tech"
              :style="{ animationDelay: i * 0.4 + 0.3 + 's' }"
            >
              <span class="tech-name">{{ tech }}</span>
              <span class="tech-bar">
                <span
                  class="tech-bar-fill"
                  :style="{
                    width: [92, 88, 70, 85, 75][i] + '%',
                    animationDelay: i * 0.4 + 1 + 's',
                  }"
                />
              </span>
              <span class="tech-pct">{{ [92, 88, 70, 85, 75][i] }}%</span>
            </div>
          </div>
          <div class="panel-edge panel-edge-right" />
        </div>
      </div>
    </div>

    <!-- Hero 文字区域（3D 层叠） -->
    <div class="hero-section" :class="{ 'hero--hidden': menuOpen }">
      <div class="hero-3d-wrap">
        <h1 class="hero-name" v-show="heroNameText">
          {{ heroNameText }}
        </h1>
        <!-- 3D 投影副本 -->
        <h1
          class="hero-name hero-name-shadow"
          v-show="heroNameText"
          aria-hidden="true"
        >
          {{ heroNameText }}
        </h1>
      </div>
      <p class="hero-role" v-show="heroRoleText">
        &lt; {{ heroRoleText }} /&gt;
      </p>
      <p class="hero-sub" v-show="heroSubText">
        {{ heroSubText }}
      </p>
    </div>

    <div class="scene" :class="{ 'scene--ready': bubbleReady }">
      <!-- 轨道卫星 -->
      <div class="orbit-ring" v-show="bubbleReady && !menuOpen">
        <div
          v-for="(sat, idx) in satellites"
          :key="'sat-' + idx"
          class="satellite"
          :style="getSatelliteStyle(sat)"
        />
      </div>

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

      <!-- 中心透明泡泡 -->
      <div
        class="bubble"
        :class="{ 'bubble--open': menuOpen, 'bubble--cyber': !menuOpen }"
        @click="openMenu"
        @mouseenter="onBubbleEnter"
        @mouseleave="onBubbleLeave"
      >
        <div class="bubble-shine" />
        <div class="bubble-hex-ring" v-show="!menuOpen" />
        <span class="bubble-text">{{ menuOpen ? "" : "EXPLORE" }}</span>
      </div>

      <!-- 菜单预览提示 -->
      <Transition name="hints">
        <div v-if="hintsVisible && !menuOpen" class="menu-hints">
          <span class="hint-item" v-for="p in pages" :key="p.id">
            {{ p.label }}
          </span>
        </div>
      </Transition>
    </div>

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
    #000005 0%,
    #010210 18%,
    #030618 38%,
    #050a22 55%,
    #030618 72%,
    #010210 88%,
    #000005 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 星点背景 */
.stars {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.2s ease;
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
.stars--visible {
  opacity: 1;
}

.scene {
  position: relative;
  width: 500px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition:
    opacity 0.8s ease,
    transform 0.8s cubic-bezier(0.34, 1.3, 0.64, 1);
}
.scene--ready {
  opacity: 1;
  transform: scale(1);
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
    rgba(0, 229, 255, 0.12) 0%,
    rgba(80, 170, 255, 0.06) 40%,
    rgba(40, 100, 200, 0.03) 70%,
    transparent 100%
  );
  border: 1px solid rgba(0, 229, 255, 0.25);
  box-shadow:
    inset 0 0 24px rgba(0, 229, 255, 0.06),
    0 0 40px rgba(0, 200, 255, 0.2),
    0 0 80px rgba(0, 150, 255, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  transition:
    transform 0.4s cubic-bezier(0.34, 1.5, 0.64, 1),
    box-shadow 0.5s ease,
    border-color 0.4s ease;
}

.bubble--cyber {
  animation: bubble-pulse 3s ease-in-out infinite;
}

@keyframes bubble-pulse {
  0%,
  100% {
    box-shadow:
      inset 0 0 24px rgba(0, 229, 255, 0.06),
      0 0 40px rgba(0, 200, 255, 0.2),
      0 0 80px rgba(0, 150, 255, 0.08);
  }
  50% {
    box-shadow:
      inset 0 0 30px rgba(0, 229, 255, 0.1),
      0 0 60px rgba(0, 229, 255, 0.3),
      0 0 120px rgba(0, 180, 255, 0.15),
      0 0 200px rgba(0, 150, 255, 0.05);
  }
}

.bubble:hover:not(.bubble--open) {
  transform: scale(1.08);
  border-color: rgba(0, 229, 255, 0.6);
  box-shadow:
    inset 0 0 30px rgba(0, 229, 255, 0.1),
    0 0 60px rgba(0, 229, 255, 0.4),
    0 0 120px rgba(0, 200, 255, 0.2);
}

.bubble--open {
  cursor: default;
  border-color: rgba(0, 229, 255, 0.15);
  box-shadow:
    inset 0 0 30px rgba(0, 229, 255, 0.05),
    0 0 50px rgba(0, 200, 255, 0.2),
    0 0 100px rgba(0, 150, 255, 0.08);
  animation: none;
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
  font-size: 1.05rem;
  font-weight: 700;
  color: rgba(0, 229, 255, 0.95);
  letter-spacing: 0.22em;
  font-family: "Courier New", "SF Mono", monospace;
  text-shadow:
    0 0 16px rgba(0, 229, 255, 0.7),
    0 0 40px rgba(0, 200, 255, 0.3),
    0 1px 4px rgba(0, 0, 0, 0.2);
  user-select: none;
  position: relative;
  z-index: 1;
}

/* ========================
   电影式暗幕 + 扫描线
======================== */
.curtain {
  position: absolute;
  inset: 0;
  z-index: 100;
  background: #000;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 24px 32px;
}
.curtain-enter-active,
.curtain-leave-active {
  transition: opacity 1s ease;
}
.curtain-leave-to {
  opacity: 0;
}
.curtain-init {
  font-family: "Courier New", "SF Mono", monospace;
  font-size: 13px;
  color: rgba(0, 229, 255, 0.5);
  letter-spacing: 2px;
  animation: init-blink 1s step-end infinite;
}
@keyframes init-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 229, 255, 0.15) 20%,
    rgba(0, 229, 255, 0.6) 50%,
    rgba(0, 229, 255, 0.15) 80%,
    transparent 100%
  );
  box-shadow:
    0 0 20px rgba(0, 229, 255, 0.4),
    0 0 60px rgba(0, 229, 255, 0.15);
  animation: scan-sweep 0.8s ease-in-out forwards;
}
@keyframes scan-sweep {
  from {
    top: 0;
  }
  to {
    top: 100%;
  }
}

/* ========================
   HUD 装饰层
======================== */
.hud-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.8s ease;
}
.hud--visible {
  opacity: 1;
}

.hud-corner {
  position: absolute;
}
.hud-tl {
  top: 16px;
  left: 16px;
}
.hud-tr {
  top: 16px;
  right: 16px;
}
.hud-bl {
  bottom: 16px;
  left: 16px;
}
.hud-br {
  bottom: 16px;
  right: 16px;
}

.hud-data {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: "Courier New", "SF Mono", monospace;
}
.hud-data-left {
  bottom: 40px;
  left: 28px;
}
.hud-data-right {
  bottom: 40px;
  right: 28px;
  text-align: right;
  align-items: flex-end;
}
.hud-label {
  font-size: 10px;
  color: rgba(0, 229, 255, 0.4);
  letter-spacing: 2px;
}
.hud-value {
  font-size: 13px;
  color: rgba(0, 229, 255, 0.65);
  letter-spacing: 1px;
}

.hud-line {
  position: absolute;
  left: 5%;
  width: 90%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 229, 255, 0.1) 15%,
    rgba(0, 229, 255, 0.15) 50%,
    rgba(0, 229, 255, 0.1) 85%,
    transparent 100%
  );
}
.hud-line-top {
  top: 60px;
}
.hud-line-bottom {
  bottom: 60px;
}

/* ========================
   Hero 文字区域（3D 层叠）
======================== */
.hero-section {
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
  perspective: 600px;
}
.hero--hidden {
  opacity: 0;
  transform: translateX(-50%) translateY(-16px);
}

.hero-3d-wrap {
  position: relative;
  transform-style: preserve-3d;
}

.hero-name {
  font-size: 4.2rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.18em;
  margin: 0;
  line-height: 1.2;
  text-shadow:
    0 0 40px rgba(0, 229, 255, 0.4),
    0 0 100px rgba(0, 200, 255, 0.15),
    0 2px 0 rgba(0, 180, 255, 0.15),
    0 4px 0 rgba(0, 160, 255, 0.08);
  position: relative;
  z-index: 2;
}

/* 3D 倒影：透视压缩 + 渐变消失 */
.hero-name-shadow {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  background-image: linear-gradient(
    180deg,
    rgba(0, 229, 255, 0.25) 0%,
    transparent 70%
  );
  transform: rotateX(68deg) scaleY(0.5);
  transform-origin: top center;
  filter: blur(3px);
  pointer-events: none;
  user-select: none;
  text-shadow: none;
}

.hero-role {
  font-family: "Courier New", "SF Mono", monospace;
  font-size: 1.15rem;
  color: rgba(0, 229, 255, 0.75);
  letter-spacing: 0.28em;
  margin: 6px 0 0;
  text-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
}

.hero-sub {
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.15em;
  margin: 10px 0 0;
  font-weight: 300;
}

/* ========================
   轨道卫星
======================== */
.orbit-ring {
  position: absolute;
  width: 0;
  height: 0;
  top: 50%;
  left: 50%;
  z-index: 9;
  pointer-events: none;
}
.satellite {
  position: absolute;
  border-radius: 50%;
  will-change: transform;
  transition: opacity 0.3s ease;
}

/* ========================
   泡泡六边形环
======================== */
.bubble-hex-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 1px dashed rgba(0, 229, 255, 0.15);
  animation: hex-spin 20s linear infinite;
  pointer-events: none;
}
@keyframes hex-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ========================
   菜单预览提示
======================== */
.menu-hints {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 10;
  white-space: nowrap;
}
.hint-item {
  font-family: "Courier New", "SF Mono", monospace;
  font-size: 13px;
  color: rgba(0, 229, 255, 0.45);
  letter-spacing: 2px;
  text-transform: uppercase;
  position: relative;
  padding: 0 6px;
}
.hint-item::before {
  content: "//";
  margin-right: 4px;
  opacity: 0.4;
}

.hints-enter-active {
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.hints-leave-active {
  transition: opacity 0.3s ease;
}
.hints-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
.hints-leave-to {
  opacity: 0;
}

/* ========================
   3D 侧面板系统
======================== */
.side-panel {
  position: absolute;
  top: 50%;
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  opacity: 0;
  transition:
    opacity 1s ease,
    transform 1s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
  perspective: 1000px;
}
.side-left {
  left: 28px;
  transform: translateY(-50%) translateX(-60px);
}
.side-right {
  right: 28px;
  align-items: flex-end;
  transform: translateY(-50%) translateX(60px);
}
.side--visible {
  opacity: 1;
}
.side--visible.side-left {
  transform: translateY(-50%) translateX(0);
}
.side--visible.side-right {
  transform: translateY(-50%) translateX(0);
}
.side--hide {
  opacity: 0 !important;
  transition: opacity 0.4s ease !important;
}

/* 3D 透视容器 */
.panel-3d {
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.panel-3d-left {
  transform: rotateY(12deg) rotateX(-2deg);
}
.panel-3d-right {
  transform: rotateY(-12deg) rotateX(-2deg);
}
.side--visible .panel-3d-left {
  animation: panel-float-left 8s ease-in-out infinite;
}
.side--visible .panel-3d-right {
  animation: panel-float-right 8s ease-in-out infinite;
}

@keyframes panel-float-left {
  0%,
  100% {
    transform: rotateY(12deg) rotateX(-2deg) translateZ(0);
  }
  50% {
    transform: rotateY(14deg) rotateX(-1deg) translateZ(8px);
  }
}
@keyframes panel-float-right {
  0%,
  100% {
    transform: rotateY(-12deg) rotateX(-2deg) translateZ(0);
  }
  50% {
    transform: rotateY(-14deg) rotateX(-1deg) translateZ(8px);
  }
}

/* 毛玻璃面板 */
.panel-glass {
  position: relative;
  padding: 20px 24px;
  min-width: 180px;
  background: linear-gradient(
    135deg,
    rgba(0, 229, 255, 0.06) 0%,
    rgba(0, 150, 255, 0.03) 50%,
    rgba(0, 100, 200, 0.02) 100%
  );
  border: 1px solid rgba(0, 229, 255, 0.15);
  border-radius: 6px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 0 30px rgba(0, 229, 255, 0.06),
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(0, 229, 255, 0.1);
  overflow: hidden;
}
.panel-glass--purple {
  background: linear-gradient(
    135deg,
    rgba(180, 140, 255, 0.06) 0%,
    rgba(140, 100, 255, 0.03) 50%,
    rgba(100, 80, 200, 0.02) 100%
  );
  border-color: rgba(180, 140, 255, 0.15);
  box-shadow:
    0 0 30px rgba(180, 140, 255, 0.06),
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(180, 140, 255, 0.1);
}

/* 面板发光边 */
.panel-edge {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
}
.panel-edge-left {
  left: 0;
  background: linear-gradient(
    180deg,
    transparent 5%,
    rgba(0, 229, 255, 0.4) 30%,
    rgba(0, 229, 255, 0.15) 50%,
    rgba(0, 229, 255, 0.4) 70%,
    transparent 95%
  );
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}
.panel-edge-right {
  right: 0;
  background: linear-gradient(
    180deg,
    transparent 5%,
    rgba(180, 140, 255, 0.4) 30%,
    rgba(180, 140, 255, 0.15) 50%,
    rgba(180, 140, 255, 0.4) 70%,
    transparent 95%
  );
  box-shadow: 0 0 8px rgba(180, 140, 255, 0.3);
}

/* 面板标题栏 */
.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);
}
.panel-header--right {
  justify-content: flex-end;
  border-bottom-color: rgba(180, 140, 255, 0.1);
}
.panel-title {
  font-family: "Courier New", "SF Mono", monospace;
  font-size: 11px;
  font-weight: 700;
  color: rgba(0, 229, 255, 0.6);
  letter-spacing: 2px;
  text-transform: uppercase;
}
.panel-title--purple {
  color: rgba(180, 140, 255, 0.6);
}
.panel-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(0, 229, 255, 0.8);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
  animation: indicator-pulse 2s ease-in-out infinite;
}
.panel-indicator--purple {
  background: rgba(180, 140, 255, 0.8);
  box-shadow: 0 0 8px rgba(180, 140, 255, 0.6);
}
@keyframes indicator-pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* --- 左侧数据流 --- */
.data-stream {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.stream-line {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0;
  animation: stream-fade-in 0.5s ease forwards;
}
.stream-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(0, 229, 255, 0.8);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
  flex-shrink: 0;
  animation: dot-pulse 2.5s ease-in-out infinite;
}
.stream-text {
  font-family: "Courier New", "SF Mono", monospace;
  font-size: 13px;
  letter-spacing: 1.5px;
  color: rgba(0, 229, 255, 0.55);
  white-space: nowrap;
}

@keyframes stream-fade-in {
  from {
    opacity: 0;
    transform: translateX(-12px) translateZ(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateZ(0);
  }
}
@keyframes dot-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* --- 右侧技术栈 --- */
.tech-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tech-item {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0;
  animation: tech-fade-in 0.5s ease forwards;
}
.tech-name {
  font-family: "Courier New", "SF Mono", monospace;
  font-size: 13px;
  letter-spacing: 1px;
  color: rgba(180, 140, 255, 0.65);
  white-space: nowrap;
  min-width: 72px;
}
.tech-bar {
  width: 90px;
  height: 4px;
  background: rgba(180, 140, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}
.tech-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(
    90deg,
    rgba(180, 140, 255, 0.2) 0%,
    rgba(180, 140, 255, 0.7) 100%
  );
  box-shadow: 0 0 8px rgba(180, 140, 255, 0.4);
  animation: bar-grow 1s ease forwards;
  transform-origin: left;
  transform: scaleX(0);
}
.tech-pct {
  font-family: "Courier New", "SF Mono", monospace;
  font-size: 11px;
  color: rgba(180, 140, 255, 0.4);
  min-width: 28px;
  text-align: right;
}

@keyframes tech-fade-in {
  from {
    opacity: 0;
    transform: translateX(12px) translateZ(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateZ(0);
  }
}
@keyframes bar-grow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
</style>
