import type { Component } from "vue";

/**
 * Page2View（事业时间线）类型定义
 */

export interface CardData {
  icon: Component;
  title: string;
  desc: string;
  color: string;
}

export interface Section {
  title: string;
  subtitle: string;
  cards: CardData[];
}

export interface CardWithPosition extends CardData {
  x: number;
  y: number;
  side: "left" | "right";
}

export interface CardPoint {
  x: number;
  y: number;
}
