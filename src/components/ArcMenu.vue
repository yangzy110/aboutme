<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

// 根据当前路由初始化激活索引
const activeIndex = ref(4);

onMounted(() => {
  const year = Number(route.params.year);
  if (year) {
    const idx = years.indexOf(year);
    if (idx !== -1) activeIndex.value = idx;
  }
});

// 弧形参数
const RADIUS = 300;
const TOTAL_SPREAD_DEG = 168; // 总弧度
const START_ANGLE_DEG = 180 + (180 - TOTAL_SPREAD_DEG) / 2; // 展开区域的起始角度

function getAngleDeg(index: number): number {
  return START_ANGLE_DEG + (index / (years.length - 1)) * TOTAL_SPREAD_DEG;
}

// 当前旋转角度：让激活项转到270°（顶部）
const rotation = computed(() => 270 - getAngleDeg(activeIndex.value));

// 每个菜单项的绝对位置（相对于圆心）
function getItemStyle(index: number) {
  const angleDeg = getAngleDeg(index);
  const rad = (angleDeg * Math.PI) / 180;
  const x = RADIUS * Math.cos(rad);
  const y = RADIUS * Math.sin(rad);
  return {
    left: `${x - 36}px`,
    top: `${y - 36}px`,
  };
}

// 菜单项文字反向旋转，保持可读性
function getLabelStyle(index: number) {
  const baseAngle = getAngleDeg(index);
  return {
    transform: `rotate(${-rotation.value - baseAngle + 270}deg)`,
    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  };
}

// 预计算 SVG 弧线路径
const arcPath = computed(() => {
  const startRad = (START_ANGLE_DEG * Math.PI) / 180;
  const endRad = ((START_ANGLE_DEG + TOTAL_SPREAD_DEG) * Math.PI) / 180;
  const x1 = RADIUS * Math.cos(startRad);
  const y1 = RADIUS * Math.sin(startRad);
  const x2 = RADIUS * Math.cos(endRad);
  const y2 = RADIUS * Math.sin(endRad);
  return `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2}`;
});

const svgSize = RADIUS * 2 + 100;
const svgViewBox = `-${RADIUS + 50} -${RADIUS + 50} ${svgSize} ${svgSize}`;

const isAnimating = ref(false);

function selectYear(index: number) {
  if (isAnimating.value) return;
  isAnimating.value = true;
  activeIndex.value = index;
  router.push(`/year/${years[index]}`);
  setTimeout(() => {
    isAnimating.value = false;
  }, 700);
}
</script>

<template>
  <div class="arc-wrapper">
    <!-- 圆心指示点 -->
    <div class="arc-center-dot" />

    <!-- 旋转轨道 -->
    <div
      class="arc-track"
      :style="{
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }"
    >
      <!-- 弧形连线（装饰） -->
      <svg
        class="arc-svg"
        :width="svgSize"
        :height="svgSize"
        :viewBox="svgViewBox"
      >
        <path
          :d="arcPath"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          stroke-width="2"
        />
      </svg>

      <!-- 菜单项 -->
      <div
        v-for="(year, index) in years"
        :key="year"
        class="arc-item"
        :class="{ active: index === activeIndex }"
        :style="getItemStyle(index)"
        @click="selectYear(index)"
      >
        <span class="arc-label" :style="getLabelStyle(index)">{{ year }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.arc-wrapper {
  position: relative;
  width: 100%;
  height: 340px;
  overflow: visible;
}

.arc-center-dot {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  z-index: 10;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
}

.arc-track {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 0;
  will-change: transform;
}

.arc-svg {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  left: 0;
  top: 0;
}

.arc-item {
  position: absolute;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  transition:
    background 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.3s;
}

.arc-item:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.arc-item.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow:
    0 0 30px rgba(255, 255, 255, 0.4),
    0 0 60px rgba(120, 180, 255, 0.3);
}

.arc-label {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
  display: block;
  pointer-events: none;
  user-select: none;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.arc-item.active .arc-label {
  font-size: 15px;
  color: #fff;
  text-shadow: 0 0 12px rgba(200, 220, 255, 0.9);
}
</style>
