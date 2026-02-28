import { ref, computed, onMounted, onBeforeUnmount } from "vue";

/**
 * 事业时间线页面切换逻辑
 */
export function useCareerTimeline(totalPages: number) {
  const current = ref(0);
  const isAnimating = ref(false);
  const ANIM_DURATION = 700;

  const isLast = computed(() => current.value === totalPages - 1);

  function goTo(index: number) {
    if (index === current.value || isAnimating.value) return;
    if (index < 0 || index >= totalPages) return;
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

  // 滚轮控制
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

  // 触摸控制
  let touchStartY = 0;

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    if (touch) touchStartY = touch.clientY;
  }

  function onTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dy = touchStartY - touch.clientY;
    if (Math.abs(dy) > 40) {
      dy > 0 ? next() : prev();
    }
  }

  // 键盘控制
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

  function setupListeners(containerRef: { value: HTMLElement | null }) {
    window.addEventListener("keydown", onKey);
    containerRef.value?.addEventListener("wheel", onWheel, { passive: false });
  }

  function cleanupListeners(containerRef: { value: HTMLElement | null }) {
    window.removeEventListener("keydown", onKey);
    containerRef.value?.removeEventListener("wheel", onWheel);
    cancelAnimationFrame(wheelRafId);
  }

  return {
    current,
    isAnimating,
    isLast,
    ANIM_DURATION,
    goTo,
    next,
    prev,
    onTouchStart,
    onTouchEnd,
    setupListeners,
    cleanupListeners,
  };
}
