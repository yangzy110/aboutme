<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const year = computed(() => (route.params.year as string) || "2022");

// 每个年份背景色
const bgGradients: Record<string, string> = {
  "2018": "linear-gradient(180deg, #0d0221 0%, #2a0f5c 50%, #4a1d8a 100%)",
  "2019": "linear-gradient(180deg, #030d1f 0%, #062b5e 50%, #0d52a8 100%)",
  "2020": "linear-gradient(180deg, #150003 0%, #4a080f 50%, #7a1520 100%)",
  "2021": "linear-gradient(180deg, #030f03 0%, #0d300d 50%, #1a5c1a 100%)",
  "2022": "linear-gradient(180deg, #080010 0%, #1a0040 50%, #30007a 100%)",
  "2023": "linear-gradient(180deg, #000a1a 0%, #002255 50%, #004099 100%)",
  "2024": "linear-gradient(180deg, #100300 0%, #3d0f00 50%, #6e1e00 100%)",
  "2025": "linear-gradient(180deg, #000812 0%, #001a3d 50%, #003070 100%)",
  "2026": "linear-gradient(180deg, #040008 0%, #100020 50%, #200040 100%)",
};

const bg = computed(() => bgGradients[year.value] ?? bgGradients["2022"]);

function goHome() {
  router.push("/");
}
</script>

<template>
  <div class="year-page" :style="{ background: bg }">
    <!-- 背景光晕 -->
    <div class="page-glow" />

    <!-- 年份大字 -->
    <div class="year-display">
      <span class="year-number">{{ year }}</span>
    </div>

    <!-- 返回按钮 -->
    <button class="back-btn" @click="goHome">
      <span class="back-arrow">←</span>
      <span>返回主页</span>
    </button>
  </div>
</template>

<style scoped>
.year-page {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.page-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.year-display {
  position: relative;
  z-index: 1;
  text-align: center;
}

.year-number {
  font-size: clamp(5rem, 20vw, 14rem);
  font-weight: 900;
  letter-spacing: 0.05em;
  line-height: 1;
  color: transparent;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(180, 220, 255, 0.7) 50%,
    rgba(120, 180, 255, 0.5) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: none;
  filter: drop-shadow(0 0 40px rgba(150, 200, 255, 0.35));
  user-select: none;
}

.back-btn {
  position: relative;
  z-index: 1;
  margin-top: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.25s ease;
  font-family: inherit;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.45);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}

.back-arrow {
  font-size: 1.1rem;
  transition: transform 0.25s ease;
}

.back-btn:hover .back-arrow {
  transform: translateX(-4px);
}
</style>
