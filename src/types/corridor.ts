/**
 * Page1View（Three.js 走廊）类型定义
 */

export interface Painting {
  emoji: string;
  x: number;
  y: number;
  z: number;
  side: "left" | "right";
}

export interface CorridorConfig {
  width: number;
  height: number;
  length: number;
  segmentMove: number;
  maxStep: number;
}
