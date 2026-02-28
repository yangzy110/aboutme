<template>
  <div class="parallax-scene">
    <!-- 背景图片层：最底层，缓慢移动 -->
    <div
      class="parallax-layer layer-bg-image"
      :style="getLayerStyle('bgImage')"
    >
      <div class="bg-image-wrap">
        <img src="@/assets/bg.jpg" alt="背景" class="bg-image" />
      </div>
    </div>

    <!-- 光照覆盖层 -->
    <div class="parallax-lighting" :style="lightingOverlayStyle" />

    <!-- 中间层：热带装饰元素 (中等速度) -->
    <div class="parallax-layer layer-mid" :style="getLayerStyle('midground')">
      <div class="tropical-elements">
        <!-- 飞舞的蝴蝶 -->
        <div
          v-for="n in 4"
          :key="'butterfly-' + n"
          class="butterfly"
          :style="{
            left: 20 + n * 18 + '%',
            top: 25 + (n % 2) * 20 + '%',
            animationDelay: n * 1.2 + 's',
          }"
        >
          <svg viewBox="0 0 40 30" class="butterfly-svg">
            <ellipse cx="8" cy="12" rx="8" ry="10" fill="rgba(255,200,100,0.8)">
              <animate
                attributeName="ry"
                values="10;8;10"
                dur="0.3s"
                repeatCount="indefinite"
              />
            </ellipse>
            <ellipse
              cx="32"
              cy="12"
              rx="8"
              ry="10"
              fill="rgba(255,200,100,0.8)"
            >
              <animate
                attributeName="ry"
                values="10;8;10"
                dur="0.3s"
                repeatCount="indefinite"
              />
            </ellipse>
            <ellipse cx="20" cy="15" rx="3" ry="8" fill="rgba(100,80,60,0.9)" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 前景层：人物剪影 (移动最快，反向) -->
    <div class="parallax-layer layer-fg" :style="getLayerStyle('foreground')">
      <div class="figure-container">
        <!-- 人物图片 -->
        <img src="@/assets/green.png" alt="人物剪影" class="figure-image" />
      </div>
    </div>

    <!-- 最前层：近处粒子/光点 -->
    <div
      class="parallax-layer layer-particles"
      :style="getLayerStyle('particles')"
    >
      <div
        v-for="n in 12"
        :key="'particle-' + n"
        class="near-particle"
        :style="{
          left: 5 + n * 7.5 + '%',
          top: 10 + (n % 4) * 25 + '%',
          animationDelay: n * 0.2 + 's',
          '--size': 3 + (n % 3) * 2 + 'px',
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ParallaxScene - 2.5D 多层视差场景组件
 *
 * 展示多层视差效果，包含：
 * - 背景山脉（移动最慢）
 * - 中间装饰元素（中等速度）
 * - 前景人物剪影（移动最快，反向移动制造相对运动）
 * - 近处粒子（额外层次感）
 */
import {
  useParallaxScene,
  type ParallaxLayer,
} from "@/composables/useParallaxScene";

// 定义视差层
const layers: ParallaxLayer[] = [
  { name: "bgImage", depth: 0.15, lightVariation: 0.05 }, // 背景图片：最慢移动
  { name: "background", depth: 0.3, lightVariation: 0.1 }, // 背景：慢速跟随
  { name: "midground", depth: 0.6, lightVariation: 0.15 }, // 中景：中速跟随
  { name: "foreground", depth: -0.8, lightVariation: 0.2 }, // 前景：反向移动（关键！制造相对运动）
  { name: "particles", depth: 1.2, lightVariation: 0 }, // 粒子：快速跟随
];

const { getLayerStyle, lightingOverlayStyle } = useParallaxScene(layers, {
  smoothness: 0.06,
  maxOffset: 50,
  enableLighting: true,
});
</script>

<style scoped lang="scss">
@use "@/styles/views/home-parallax.scss";
</style>
