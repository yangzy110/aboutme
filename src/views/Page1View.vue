<template>
  <div class="page1" @click="advance">
    <canvas ref="canvasRef" class="corridor-canvas"></canvas>

    <div class="bottom-bar">
      <Transition name="slide-left">
        <button v-if="step > 0" class="ctrl-btn ctrl-btn--retreat" @click.stop="retreat">← 后退</button>
      </Transition>

      <Transition name="fade" mode="out-in">
        <span v-if="canAdvance" class="hint" key="click">点击画面继续前行…</span>
        <span v-else class="hint hint--end" key="end">你已走到尽头</span>
      </Transition>

      <Transition name="fade">
        <button v-if="step === maxStep" class="ctrl-btn ctrl-btn--exit" @click.stop="$router.push('/')">离开画廊</button>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { corridorConfig, paintings } from '@/data/corridor'
import { useCorridorScene } from '@/composables/useCorridorScene'

const {
  canvasRef,
  step,
  canAdvance,
  maxStep,
  advance,
  retreat,
  setup,
  cleanup,
} = useCorridorScene(corridorConfig, paintings)

onMounted(() => {
  setup()
})

onBeforeUnmount(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
@use '@/styles/views/page1.scss';
</style>
