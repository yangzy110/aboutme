<script setup lang="ts">
/**
 * HomeView - 首页视图
 * 功能：入场动画、星空背景、弧形菜单、HUD装饰
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GalaxySpeedLines from '@/components/GalaxySpeedLines.vue'
import MouseParticles from '@/components/MouseParticles.vue'

// Composables
import { useEntrance } from '@/composables/useEntrance'
import { useOrbitSatellites } from '@/composables/useOrbitSatellites'
import { useHudClock } from '@/composables/useHudClock'
import { useGalaxyEasterEgg } from '@/composables/useGalaxyEasterEgg'
import { useArcMenuGeometry } from '@/composables/useArcMenuGeometry'
import { useStarParticles } from '@/composables/useStarParticles'

// Data
import {
  pages,
  satellites,
  sectorColors,
  systemStatusList,
  techStackData,
} from '@/data/home'

const router = useRouter()

// 菜单状态
const menuOpen = ref(false)
const hoveredIndex = ref<number | null>(null)

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
} = useEntrance()

const { getSatelliteStyle, start: startOrbit, stop: stopOrbit } = useOrbitSatellites(satellites)
const { hudTime, hudCoord, start: startHud, stop: stopHud } = useHudClock()
const { showAlien, showUfo, bubbleHovered, onBubbleEnter, onBubbleLeave, cleanup: cleanupEasterEgg } = useGalaxyEasterEgg()
const { getTrapPath, getLabelPos } = useArcMenuGeometry()
const { starParticles, meteors, getStarStyle, getMeteorStyle } = useStarParticles()

// 菜单操作
function openMenu() {
  if (!menuOpen.value) menuOpen.value = true
}

function closeMenu() {
  if (menuOpen.value) menuOpen.value = false
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('.radial-svg') || target.closest('.bubble')) return
  closeMenu()
}

function goToPage(id: number) {
  router.push(`/page/${id}`)
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', onClickOutside)
  runEntrance()
  startOrbit()
  startHud()
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  stopOrbit()
  stopHud()
  cleanupEasterEgg()
})
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
          <path d="M2 16 L2 2 L16 2" fill="none" stroke="rgba(0,229,255,0.5)" stroke-width="1.5" />
        </svg>
      </div>
      <div class="hud-corner hud-tr">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path d="M32 2 L46 2 L46 16" fill="none" stroke="rgba(0,229,255,0.5)" stroke-width="1.5" />
        </svg>
      </div>
      <div class="hud-corner hud-bl">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path d="M2 32 L2 46 L16 46" fill="none" stroke="rgba(0,229,255,0.5)" stroke-width="1.5" />
        </svg>
      </div>
      <div class="hud-corner hud-br">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path d="M32 46 L46 46 L46 32" fill="none" stroke="rgba(0,229,255,0.5)" stroke-width="1.5" />
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
        <h1 class="hero-name hero-name-shadow" v-show="heroNameText" aria-hidden="true">
          {{ heroNameText }}
        </h1>
      </div>
      <p class="hero-role" v-show="heroRoleText">&lt; {{ heroRoleText }} /&gt;</p>
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

      <!-- 扇形菜单 SVG -->
      <Transition name="menu">
        <svg
          v-if="menuOpen"
          class="radial-svg"
          viewBox="-240 -240 480 480"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="glass-fill" cx="0" cy="0" r="220" gradientUnits="userSpaceOnUse">
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
            <path
              :d="getTrapPath(i)"
              :fill="hoveredIndex === i ? sectorColors[i].replace('0.18', '0.28') : sectorColors[i]"
              style="transition: fill 0.3s ease"
            />
            <path
              :d="getTrapPath(i)"
              fill="url(#glass-fill)"
              :opacity="hoveredIndex === i ? 1 : 0.6"
              style="transition: opacity 0.3s ease"
            />
            <path
              :d="getTrapPath(i)"
              fill="none"
              :stroke="hoveredIndex === i ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.08)'"
              stroke-width="0.8"
              style="transition: stroke 0.3s ease"
            />
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
        <span class="bubble-text">{{ menuOpen ? '' : 'EXPLORE' }}</span>
      </div>

      <!-- 菜单预览提示 -->
      <Transition name="hints">
        <div v-if="hintsVisible && !menuOpen" class="menu-hints">
          <span v-for="p in pages" :key="p.id" class="hint-item">{{ p.label }}</span>
        </div>
      </Transition>
    </div>

    <!-- 星河彩蛋 -->
    <Transition name="alien-in">
      <div v-if="showAlien" class="alien-egg"><span>👽</span></div>
    </Transition>
    <Transition name="ufo-in">
      <div v-if="showUfo" class="ufo-egg"><span>🛸</span></div>
    </Transition>
  </div>
</template>

<style scoped>
@import '@/styles/views/home.scss';
</style>
