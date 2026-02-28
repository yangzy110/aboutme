import type { Satellite, Meteor, PageItem, StarParticle } from "@/types/home";

/**
 * HomeView 静态数据常量
 */

// Hero 文字内容
export const HERO_NAME = "杨泽宇";
export const HERO_ROLE = "FRONTEND EXPLORER";
export const HERO_SUB = "热爱前端 · 拥抱生活 · 探索无限";

// 页面导航
export const pages: PageItem[] = [
  { id: 1, label: "学业" },
  { id: 2, label: "事业" },
  { id: 3, label: "生活" },
];

// 轨道卫星配置
export const satellites: Satellite[] = [
  {
    offset: 0,
    size: 5,
    orbit: 108,
    speed: 0.8,
    color: "rgba(0, 229, 255, 0.9)",
  },
  {
    offset: 140,
    size: 3.5,
    orbit: 122,
    speed: 0.55,
    color: "rgba(180, 140, 255, 0.8)",
  },
  {
    offset: 250,
    size: 4,
    orbit: 96,
    speed: 1.1,
    color: "rgba(0, 255, 136, 0.8)",
  },
];

// 流星配置
export const meteors: Meteor[] = [
  { id: 0, x: 92, y: -3, length: 300, cycle: 9, delay: 0.0, opacity: 1.0 },
  { id: 1, x: 72, y: 8, length: 240, cycle: 13, delay: 4.5, opacity: 0.9 },
];

// 弧边梯形参数
export const OUTER_R = 210; // 外弧半径
export const INNER_R = 120; // 内弧半径
export const GAP_DEG = 4; // 间隙角度

// 扇形颜色
export const sectorColors = [
  "rgba(160, 120, 255, 0.18)",
  "rgba(40, 160, 255, 0.18)",
  "rgba(30, 195, 185, 0.18)",
  "rgba(130, 110, 248, 0.18)",
];

export const sectorGlowColors = [
  "rgba(180, 140, 255, 0.55)",
  "rgba(50, 175, 255, 0.55)",
  "rgba(40, 210, 200, 0.55)",
  "rgba(145, 125, 255, 0.55)",
];

// 系统状态列表
export const systemStatusList = [
  "SYS.READY",
  "VUE 3.5",
  "TS STRICT",
  "VITE HMR",
  "PINIA ✓",
  "ROUTER ✓",
  "SSR.OFF",
  "GPU.ACCEL",
];

// 技术栈数据
export const techStackData = [
  { name: "Vue", pct: 92 },
  { name: "TypeScript", pct: 88 },
  { name: "Three.js", pct: 70 },
  { name: "CSS Art", pct: 85 },
  { name: "Node.js", pct: 75 },
];

/**
 * 生成随机浮星数据
 */
function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export const starParticles: StarParticle[] = Array.from(
  { length: 90 },
  (_, i) => ({
    id: i,
    x: randBetween(0, 100),
    y: randBetween(0, 100),
    size: randBetween(1, i < 20 ? 4 : 2),
    opacity: randBetween(0.25, 0.95),
    duration: randBetween(6, 18),
    delay: randBetween(0, 12),
    dx: randBetween(-18, 18),
    dy: randBetween(-12, 12),
    twinkleDur: randBetween(2, 6),
  }),
);
