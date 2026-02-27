<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <div class="page3">
    <button class="back-btn" @click="router.push('/')">← 返回</button>
  </div>
</template>

<style scoped>
.page3 {
  width: 100%;
  height: 100vh;
  background: #0a0a1a;
}

.back-btn {
  position: fixed;
  top: 24px;
  left: 28px;
  z-index: 100;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(14px);
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.35);
}
</style>
