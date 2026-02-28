<script setup lang="ts">
/**
 * LazyImage - 懒加载图片组件
 * 支持渐进式加载和低质量预览
 */
import { useLazyImage } from "@/composables/useLazyImage";
import { watch, onMounted as onMountedVue } from "vue";

interface Props {
  src: string;
  alt?: string;
  placeholder?: string; // 占位图
}

const props = defineProps<Props>();

const { imageRef, isLoaded } = useLazyImage();

// 调试：在组件挂载和 src 变化时打印
onMountedVue(() => {
  console.log("[LazyImage] Mounted with src:", props.src);
});

watch(
  () => props.src,
  (newSrc) => {
    console.log("[LazyImage] src changed to:", newSrc);
  },
  { immediate: true },
);
</script>

<template>
  <div class="lazy-image-wrapper">
    <!-- 占位符 -->
    <div v-if="!isLoaded" class="lazy-placeholder">
      <div class="lazy-spinner"></div>
    </div>

    <!-- 懒加载图片 -->
    <img
      ref="imageRef"
      :data-src="src"
      :alt="alt || ''"
      :class="{ 'lazy-loading': !isLoaded }"
      class="lazy-image"
    />
  </div>
</template>

<style scoped>
.lazy-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.lazy-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(160, 120, 255, 0.1),
    rgba(40, 160, 255, 0.1)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.lazy-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(160, 120, 255, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.lazy-image.lazy-loading {
  opacity: 0;
}

.lazy-image.lazy-loaded {
  opacity: 1;
}
</style>
