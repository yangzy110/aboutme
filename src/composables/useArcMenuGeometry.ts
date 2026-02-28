import { pages, OUTER_R, INNER_R, GAP_DEG } from "@/data/home";

const SECTORS = pages.length;
const STEP = 360 / SECTORS; // 每块占的角度

/**
 * 弧形菜单几何计算工具
 */
export function useArcMenuGeometry() {
  function toRad(deg: number) {
    return (deg * Math.PI) / 180;
  }

  /**
   * 弧边梯形路径：
   * 外弧 → 直线连内弧端点 → 内弧（反向）→ 闭合
   */
  function getTrapPath(index: number, expand = 0): string {
    const outerR = OUTER_R + expand;
    const innerR = INNER_R;
    const half = GAP_DEG / 2;
    const startAngle = index * STEP - 90 + half;
    const endAngle = startAngle + STEP - GAP_DEG;

    const ox1 = outerR * Math.cos(toRad(startAngle));
    const oy1 = outerR * Math.sin(toRad(startAngle));
    const ox2 = outerR * Math.cos(toRad(endAngle));
    const oy2 = outerR * Math.sin(toRad(endAngle));
    const ix2 = innerR * Math.cos(toRad(endAngle));
    const iy2 = innerR * Math.sin(toRad(endAngle));
    const ix1 = innerR * Math.cos(toRad(startAngle));
    const iy1 = innerR * Math.sin(toRad(startAngle));

    return [
      `M ${ox1} ${oy1}`,
      `A ${outerR} ${outerR} 0 0 1 ${ox2} ${oy2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerR} ${innerR} 0 0 0 ${ix1} ${iy1}`,
      `Z`,
    ].join(" ");
  }

  /**
   * 外弧高光线
   */
  function getOuterArcPath(index: number, expand = 0): string {
    const outerR = OUTER_R + expand;
    const half = GAP_DEG / 2 + 0.8;
    const startAngle = index * STEP - 90 + half;
    const endAngle = startAngle + STEP - GAP_DEG - 1.6;
    const x1 = outerR * Math.cos(toRad(startAngle));
    const y1 = outerR * Math.sin(toRad(startAngle));
    const x2 = outerR * Math.cos(toRad(endAngle));
    const y2 = outerR * Math.sin(toRad(endAngle));
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2}`;
  }

  /**
   * 标签中心位置
   */
  function getLabelPos(index: number) {
    const midAngle = index * STEP + STEP / 2 - 90;
    const r = (INNER_R + OUTER_R) / 2;
    return {
      x: r * Math.cos(toRad(midAngle)),
      y: r * Math.sin(toRad(midAngle)),
    };
  }

  return {
    getTrapPath,
    getOuterArcPath,
    getLabelPos,
  };
}
