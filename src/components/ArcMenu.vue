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

<style scoped lang="scss">
@use "@/styles/components/arc-menu.scss";
</style>
