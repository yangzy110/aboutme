<script setup lang="ts">
/**
 * 页面2 — PPT 式上下切换
 * 三个全屏页面，滚轮/触摸拖动整屏切换
 * 右侧点线指示器标记当前页
 */
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const slides = [
  { bg: "#1a5276", label: "蓝色世界" },
  { bg: "#1e8449", label: "绿色森林" },
  { bg: "#d4ac0d", label: "金色黎明" },
];

const current = ref(0);
const isAnimating = ref(false);
const ANIM_DURATION = 650; // ms

const isLast = computed(() => current.value === slides.length - 1);

function goTo(index: number) {
  if (index === current.value || isAnimating.value) return;
  if (index < 0 || index >= slides.length) return;
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

// 滚轮 —— 直接注册 passive:false，立即响应，无防抖延迟
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

// 触摸
let touchStartY = 0;
function onTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0].clientY;
}
function onTouchEnd(e: TouchEvent) {
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 40) {
    if (dy > 0) next();
    else prev();
  }
}

// 键盘
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

const containerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  window.addEventListener("keydown", onKey);
  // 必须用 addEventListener + passive:false，Vue的 .prevent 修饰符在 wheel 上不可靠
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
    class="page2"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- 幻灯片容器 -->
    <div
      class="slides-track"
      :style="{
        transform: `translateY(-${current * 100}vh)`,
        transition: `transform ${ANIM_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`,
      }"
    >
      <div
        v-for="(slide, i) in slides"
        :key="i"
        class="slide"
        :style="{ background: slide.bg }"
      >
        <span class="slide-label">{{ slide.label }}</span>
      </div>
    </div>

    <!-- 右侧点线指示器 -->
    <div class="indicator">
      <template v-for="(slide, i) in slides" :key="i">
        <div class="dot" :class="{ active: current === i }" @click="goTo(i)" />
        <div v-if="i < slides.length - 1" class="line" />
      </template>
    </div>

    <!-- 下滑按钮 -->
    <Transition name="fade-btn">
      <button
        v-if="!isLast"
        class="scroll-down-btn"
        @click="next"
        aria-label="下一页"
      >
        <span class="scroll-text">向下滑动</span>
        <div class="chevrons">
          <svg
            class="chevron"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline
              points="6 9 12 15 18 9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            class="chevron"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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

    <!-- 返回按钮 -->
    <button class="back-btn" @click="router.push('/')">← 返回</button>
  </div>
</template>

<style scoped>
.page2 {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #111;
}

.slides-track {
  width: 100%;
  will-change: transform;
}

.slide {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-label {
  font-size: 3rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.15em;
  text-shadow:
    0 2px 20px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(255, 255, 255, 0.1);
  user-select: none;
}

/* 指示器 */
.indicator {
  position: fixed;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  z-index: 50;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  cursor: pointer;
  transition: all 0.35s ease;
  flex-shrink: 0;
}
.dot.active {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
  transform: scale(1.25);
}
.dot:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.2);
}

.line {
  width: 2px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.back-btn {
  position: fixed;
  bottom: 36px;
  right: 32px;
  z-index: 100;
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(14px);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.25s ease;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.38);
  color: rgba(255, 255, 255, 0.95);
}

/* 下滑按钮 */
.scroll-down-btn {
  position: fixed;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 10px 22px 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.75);
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease;
}
.scroll-down-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.4);
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
  gap: 0;
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

/* 显示/隐藏过渡 */
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
</style>
