import { ref, onUnmounted } from "vue";

/**
 * HUD 时钟组合式函数
 */
export function useHudClock() {
  const hudTime = ref("");
  const hudCoord = ref("");
  let hudTimer: ReturnType<typeof setInterval> | null = null;

  function updateHud() {
    const now = new Date();
    hudTime.value = now.toTimeString().split(" ")[0];
    hudCoord.value = `${(Math.random() * 90 + 10).toFixed(4)}°N  ${(Math.random() * 180 + 10).toFixed(4)}°E`;
  }

  function start() {
    updateHud();
    hudTimer = setInterval(updateHud, 1000);
  }

  function stop() {
    if (hudTimer) {
      clearInterval(hudTimer);
      hudTimer = null;
    }
  }

  return {
    hudTime,
    hudCoord,
    start,
    stop,
  };
}
