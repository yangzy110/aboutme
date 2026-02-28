<script setup lang="ts">
/**
 * HomeView - 首页视图
 * 功能：入场动画、星空背景、弧形菜单、HUD装饰
 */
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import GalaxySpeedLines from "@/components/GalaxySpeedLines.vue";
import MouseParticles from "@/components/MouseParticles.vue";

// Composables
import { useEntrance } from "@/composables/useEntrance";
import { useOrbitSatellites } from "@/composables/useOrbitSatellites";
import { useHudClock } from "@/composables/useHudClock";
import { useGalaxyEasterEgg } from "@/composables/useGalaxyEasterEgg";
import { useStarParticles } from "@/composables/useStarParticles";

// Data
import {
  pages,
  satellites,
  systemStatusList,
  techStackData,
} from "@/data/home";

const router = useRouter();

// 菜单状态
const menuOpen = ref(false);
const hoveredIndex = ref<number | null>(null);

// 使用组合式函数
const {
  curtainVisible,
  scanLineActive,
  starsRevealed,
  heroNameText,
  heroRoleText,
  heroSubText,
  bubbleReady,
  hudVisible,
  hintsVisible,
  sidePanelsVisible,
  runEntrance,
} = useEntrance();

const {
  getSatelliteStyle,
  start: startOrbit,
  stop: stopOrbit,
} = useOrbitSatellites(satellites);
const { hudTime, hudCoord, start: startHud, stop: stopHud } = useHudClock();
const {
  showAlien,
  showUfo,
  bubbleHovered,
  onBubbleEnter,
  onBubbleLeave,
  cleanup: cleanupEasterEgg,
} = useGalaxyEasterEgg();
const { starParticles, meteors, getStarStyle, getMeteorStyle } =
  useStarParticles();

// 菜单操作
function openMenu() {
  if (!menuOpen.value) menuOpen.value = true;
}

function closeMenu() {
  if (menuOpen.value) menuOpen.value = false;
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.closest(".holo-nav") || target.closest(".bubble")) return;
  closeMenu();
}

function goToPage(id: number) {
  router.push(`/page/${id}`);
}

// 生命周期
onMounted(() => {
  document.addEventListener("click", onClickOutside);
  runEntrance();
  startOrbit();
  startHud();
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  stopOrbit();
  stopHud();
  cleanupEasterEgg();
});
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
    <div class="galaxy-layer" aria-hidden="true">
      <div class="nebula-band band-1" />
      <div class="nebula-band band-2" />
      <div
        v-for="s in starParticles"
        :key="s.id"
        class="float-star"
        :style="getStarStyle(s)"
      />
      <div
        v-for="m in meteors"
        :key="'m' + m.id"
        class="meteor"
        :style="getMeteorStyle(m)"
      />
    </div>

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

    <!-- 左侧面板：数据流 -->
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
              v-for="(text, n) in systemStatusList"
              :key="'sl' + n"
              class="stream-line"
              :style="{ animationDelay: (n + 1) * 0.4 + 's' }"
            >
              <span class="stream-dot" />
              <span class="stream-text">{{ text }}</span>
            </div>
          </div>
          <div class="panel-edge panel-edge-left" />
        </div>
      </div>
    </div>

    <!-- 右侧面板：技术栈 -->
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
              v-for="(tech, i) in techStackData"
              :key="tech.name"
              class="tech-item"
              :style="{ animationDelay: i * 0.4 + 0.3 + 's' }"
            >
              <span class="tech-name">{{ tech.name }}</span>
              <span class="tech-bar">
                <span
                  class="tech-bar-fill"
                  :style="{
                    width: tech.pct + '%',
                    animationDelay: i * 0.4 + 1 + 's',
                  }"
                />
              </span>
              <span class="tech-pct">{{ tech.pct }}%</span>
            </div>
          </div>
          <div class="panel-edge panel-edge-right" />
        </div>
      </div>
    </div>

    <!-- Hero 文字区域 -->
    <div class="hero-section" :class="{ 'hero--hidden': menuOpen }">
      <div class="hero-3d-wrap">
        <h1 class="hero-name" v-show="heroNameText">{{ heroNameText }}</h1>
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
      <p class="hero-sub" v-show="heroSubText">{{ heroSubText }}</p>
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

      <!-- 泡泡破裂碎片 -->
      <Transition name="shards">
        <div v-if="menuOpen" class="bubble-shards">
          <div
            v-for="n in 12"
            :key="'shard-' + n"
            class="shard"
            :class="`shard--${n}`"
            :style="{ animationDelay: `${(n - 1) * 25}ms` }"
          />
        </div>
      </Transition>

      <!-- 破裂涟漪 -->
      <Transition name="ripple">
        <div v-if="menuOpen" class="burst-ripple">
          <div class="ripple-ring ripple-ring--1" />
          <div class="ripple-ring ripple-ring--2" />
          <div class="ripple-ring ripple-ring--3" />
        </div>
      </Transition>

      <!-- 全息导航选项 -->
      <Transition name="holo-nav">
        <div v-if="menuOpen" class="holo-nav">
          <div
            v-for="(page, i) in pages"
            :key="page.id"
            class="holo-item"
            :class="{ 'holo-item--active': hoveredIndex === i }"
            :style="{ animationDelay: `${250 + i * 80}ms` }"
            @mouseenter="hoveredIndex = i"
            @mouseleave="hoveredIndex = null"
            @click="goToPage(page.id)"
          >
            <span class="holo-text">{{ page.label }}</span>
            <span class="holo-line" />
          </div>
        </div>
      </Transition>

      <!-- 中心透明泡泡 -->
      <Transition name="bubble-burst">
        <div
          v-if="!menuOpen"
          class="bubble bubble--cyber"
          @click="openMenu"
          @mouseenter="onBubbleEnter"
          @mouseleave="onBubbleLeave"
        >
          <div class="bubble-shine" />
          <div class="bubble-hex-ring" />
          <span class="bubble-text">EXPLORE</span>
        </div>
      </Transition>

      <!-- 菜单预览提示 -->
      <Transition name="hints">
        <div v-if="hintsVisible && !menuOpen" class="menu-hints">
          <span v-for="p in pages" :key="p.id" class="hint-item">{{
            p.label
          }}</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
@import "@/styles/views/home.scss";
</style>
