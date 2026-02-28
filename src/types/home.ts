/**
 * HomeView 类型定义
 */

// 轨道卫星
export interface Satellite {
  offset: number;
  size: number;
  orbit: number;
  speed: number;
  color: string;
}

// 浮动星粒
export interface StarParticle {
  id: number;
  x: number; // left %
  y: number; // top %
  size: number; // px
  opacity: number;
  duration: number;
  delay: number;
  dx: number; // drift x px
  dy: number; // drift y px
  twinkleDur: number;
}

// 流星
export interface Meteor {
  id: number;
  x: number; // 起始 left %
  y: number; // 起始 top %
  length: number; // 拖尾长 px
  cycle: number; // 循环周期 s
  delay: number; // 首次出现延迟 s
  opacity: number; // 亮度微调
}

// 页面导航项
export interface PageItem {
  id: number;
  label: string;
}
