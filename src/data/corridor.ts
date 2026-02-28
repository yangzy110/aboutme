import type { Painting, CorridorConfig } from "@/types/corridor";

/**
 * Page1View（Three.js 走廊）静态数据
 */

// 走廊参数配置
export const corridorConfig: CorridorConfig = {
  width: 4,
  height: 3.5,
  length: 18,
  segmentMove: 5, // 每次前进距离
  maxStep: 2,
};

// emoji 画作数据
export const paintings: Painting[] = [
  // 左侧墙
  { emoji: "🌊", x: -1.95, y: 1.2, z: -3, side: "left" },
  { emoji: "🐚", x: -1.95, y: 1.2, z: -7, side: "left" },
  { emoji: "🌺", x: -1.95, y: 1.2, z: -11, side: "left" },
  { emoji: "🦋", x: -1.95, y: 1.2, z: -15, side: "left" },
  // 右侧墙
  { emoji: "🌙", x: 1.95, y: 1.2, z: -3, side: "right" },
  { emoji: "⭐", x: 1.95, y: 1.2, z: -7, side: "right" },
  { emoji: "🎨", x: 1.95, y: 1.2, z: -11, side: "right" },
  { emoji: "🔮", x: 1.95, y: 1.2, z: -15, side: "right" },
];
