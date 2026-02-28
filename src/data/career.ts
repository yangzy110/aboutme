import type { Section, CardPoint, CardWithPosition } from "@/types/career";
import {
  Monitor,
  Coffee,
  Trophy,
  Burger,
  Camera,
  Promotion,
  DataLine,
  Star,
} from "@element-plus/icons-vue";

/**
 * Page2View（事业时间线）静态数据
 */

export const sections: Section[] = [
  {
    title: "2024 · 工作",
    subtitle: "这一年，代码与咖啡相伴",
    cards: [
      {
        icon: Monitor,
        title: "项目启动",
        desc: "从零搭建核心系统架构",
        color: "#38bdf8",
      },
      {
        icon: Coffee,
        title: "深夜攻坚",
        desc: "数不清的通宵与突破",
        color: "#a78bfa",
      },
      {
        icon: Trophy,
        title: "项目上线",
        desc: "成功交付，获得好评",
        color: "#fbbf24",
      },
    ],
  },
  {
    title: "同事 · 生活",
    subtitle: "工作之外，还有诗和远方",
    cards: [
      {
        icon: Burger,
        title: "团建聚餐",
        desc: "美食是最好的团队粘合剂",
        color: "#fb923c",
      },
      {
        icon: Camera,
        title: "出游合影",
        desc: "留下每一个珍贵瞬间",
        color: "#34d399",
      },
    ],
  },
  {
    title: "2025 · 工作",
    subtitle: "新的征程，更大的舞台",
    cards: [
      {
        icon: Promotion,
        title: "新项目启航",
        desc: "更高维度的技术挑战",
        color: "#f43f5e",
      },
      {
        icon: DataLine,
        title: "数据驱动",
        desc: "用数据讲述增长故事",
        color: "#22d3ee",
      },
      {
        icon: Star,
        title: "年度之星",
        desc: "努力终会被看见",
        color: "#facc15",
      },
    ],
  },
];

/* 8张卡片在 1000×3000 坐标系中的固定位置 */
export const cardPoints: CardPoint[] = [
  // 页面1: 3张图 (y: 0~1000)
  { x: 250, y: 200 },
  { x: 720, y: 520 },
  { x: 280, y: 830 },
  // 页面2: 2张图 (y: 1000~2000)
  { x: 700, y: 1320 },
  { x: 280, y: 1700 },
  // 页面3: 3张图 (y: 2000~3000)
  { x: 720, y: 2200 },
  { x: 260, y: 2520 },
  { x: 700, y: 2830 },
];

/**
 * 生成一条贯穿所有卡片的弯曲路径
 */
export function buildCurvePath(): string {
  const pts = cardPoints;
  if (pts.length === 0) return "";
  const first = pts[0]!;
  let d = `M ${first.x},${first.y - 100}`;
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i]!;
    const prev = i === 0 ? { x: first.x, y: first.y - 100 } : pts[i - 1]!;
    const cpx1 = prev.x + (curr.x - prev.x) * 0.15;
    const cpy1 = prev.y + (curr.y - prev.y) * 0.7;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.15;
    const cpy2 = prev.y + (curr.y - prev.y) * 0.3;
    d += ` C ${cpx1},${cpy1} ${cpx2},${cpy2} ${curr.x},${curr.y}`;
  }
  const last = pts[pts.length - 1]!;
  d += ` C ${last.x},${last.y + 40} ${last.x + 30},${last.y + 80} ${last.x},${last.y + 120}`;
  return d;
}

export const curvePath = buildCurvePath();

/**
 * 将卡片数据展平，附加坐标
 */
export const allCards: CardWithPosition[] = sections
  .flatMap((sec) => sec.cards)
  .map((card, i) => {
    const point = cardPoints[i] ?? { x: 0, y: 0 };
    return {
      ...card,
      x: point.x,
      y: point.y,
      side: point.x > 500 ? "right" : "left",
    };
  });
