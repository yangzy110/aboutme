import { ref, onMounted, onUnmounted } from "vue";
import type { Satellite } from "@/types/home";
import { satellites as defaultSatellites } from "@/data/home";

/**
 * 轨道卫星动画组合式函数
 */
export function useOrbitSatellites(
  satellites: Satellite[] = defaultSatellites,
) {
  const orbitAngle = ref(0);
  let orbitRAF: number | null = null;

  function animateOrbit() {
    orbitAngle.value += 0.35;
    orbitRAF = requestAnimationFrame(animateOrbit);
  }

  function getSatelliteStyle(sat: Satellite) {
    const angle = ((orbitAngle.value * sat.speed + sat.offset) * Math.PI) / 180;
    const x = Math.cos(angle) * sat.orbit;
    const y = Math.sin(angle) * sat.orbit * 0.45; // 椭圆轨道
    return {
      transform: `translate(${x}px, ${y}px)`,
      width: sat.size + "px",
      height: sat.size + "px",
      background: sat.color,
      boxShadow: `0 0 ${sat.size * 3}px ${sat.color}, 0 0 ${sat.size * 6}px ${sat.color.replace(/[\d.]+\)$/, "0.3)")}`,
    };
  }

  function start() {
    animateOrbit();
  }

  function stop() {
    if (orbitRAF) {
      cancelAnimationFrame(orbitRAF);
      orbitRAF = null;
    }
  }

  return {
    orbitAngle,
    satellites,
    getSatelliteStyle,
    start,
    stop,
  };
}
