import type { StarParticle, Meteor } from "@/types/home";
import { starParticles, meteors } from "@/data/home";

/**
 * 星空粒子样式计算
 */
export function useStarParticles() {
  function getStarStyle(s: StarParticle): Record<string, string> {
    return {
      left: s.x + "%",
      top: s.y + "%",
      width: s.size + "px",
      height: s.size + "px",
      "--star-opacity": String(s.opacity),
      "--dx": s.dx + "px",
      "--dy": s.dy + "px",
      animationDuration: s.duration + "s",
      animationDelay: s.delay + "s",
      "--twinkle-dur": s.twinkleDur + "s",
    };
  }

  function getMeteorStyle(m: Meteor): Record<string, string> {
    return {
      left: m.x + "%",
      top: m.y + "%",
      "--length": m.length + "px",
      "--opacity": String(m.opacity),
      animationDuration: m.cycle + "s",
      animationDelay: m.delay + "s",
    };
  }

  return {
    starParticles,
    meteors,
    getStarStyle,
    getMeteorStyle,
  };
}
