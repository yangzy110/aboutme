<script setup lang="ts">
/**
 * Page2View - 事业时间线页面
 * 功能：一条连续虚线贯穿三个全屏页面，展示工作和生活经历
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCareerTimeline } from '@/composables/useCareerTimeline'
import { sections, curvePath, allCards } from '@/data/career'

const router = useRouter()
const containerRef = ref<HTMLElement | null>(null)

const {
  current,
  isLast,
  ANIM_DURATION,
  goTo,
  next,
  onTouchStart,
  onTouchEnd,
  setupListeners,
  cleanupListeners,
} = useCareerTimeline(sections.length)

onMounted(() => {
  setupListeners(containerRef)
})

onBeforeUnmount(() => {
  cleanupListeners(containerRef)
})
</script>

<template>
  <div
    ref="containerRef"
    class="career-page"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- 整体滚动容器 -->
    <div
      class="scroll-track"
      :style="{
        transform: `translateY(-${current * 100}vh)`,
        transition: `transform ${ANIM_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`,
      }"
    >
      <!-- 背景层 -->
      <div class="bg-layer">
        <div class="bg-section bg-1" />
        <div class="bg-section bg-2" />
        <div class="bg-section bg-3" />
      </div>

      <!-- 章节标题 -->
      <div
        v-for="(sec, si) in sections"
        :key="si"
        class="section-title"
        :style="{ top: `calc(${si * 100}vh + 5vh)` }"
      >
        <h2 class="title-text">{{ sec.title }}</h2>
        <p class="subtitle-text">{{ sec.subtitle }}</p>
      </div>

      <!-- 连续 SVG 虚线 -->
      <svg
        class="global-curve"
        viewBox="0 0 1000 3000"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          :d="curvePath"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          stroke-width="6"
          stroke-linecap="round"
        />
        <path
          :d="curvePath"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          stroke-width="2"
          stroke-dasharray="14 10"
          stroke-linecap="round"
          class="dash-animate"
        />
        <template v-for="(card, ci) in allCards" :key="ci">
          <circle :cx="card.x" :cy="card.y" r="6" :fill="card.color" fill-opacity="0.9" />
          <circle :cx="card.x" :cy="card.y" r="12" :fill="card.color" fill-opacity="0.2" class="pulse-dot" />
        </template>
      </svg>

      <!-- 图片卡片 -->
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
        <div class="card-image" :style="{ borderColor: card.color + '50' }">
          <div
            class="image-bg"
            :style="{ background: `linear-gradient(135deg, ${card.color}18, ${card.color}08)` }"
          >
            <component :is="card.icon" class="card-icon" :style="{ color: card.color }" />
          </div>
        </div>
        <div class="card-info">
          <span class="card-tag" :style="{ color: card.color, borderColor: card.color + '40' }">
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
          <span class="dot-label">{{ sec.title.split('·')[0].trim() }}</span>
        </div>
        <div v-if="i < sections.length - 1" class="ind-line" />
      </template>
    </div>

    <!-- 下滑提示 -->
    <Transition name="fade-btn">
      <button v-if="!isLast" class="scroll-down-btn" @click="next" aria-label="下一页">
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
@import '@/styles/views/page2.scss';
</style>
