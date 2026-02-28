/**
 * useParallaxScene - 2.5D 多层视差效果
 *
 * 功能：
 * - 追踪鼠标位置
 * - 计算不同深度层的偏移量
 * - 支持平滑过渡动画
 * - 背景和主体（人像）之间产生相对运动
 */
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";

export interface ParallaxLayer {
  /** 层级名称 */
  name: string;
  /** 深度因子：数值越大，移动越快（正值跟随鼠标，负值反向） */
  depth: number;
  /** 亮度动态变化范围 (0-1) */
  lightVariation?: number;
}

export interface ParallaxConfig {
  /** 插值平滑度 (0-1)，越小越平滑 */
  smoothness?: number;
  /** 最大偏移量 (px) */
  maxOffset?: number;
  /** 是否启用亮度变化 */
  enableLighting?: boolean;
}

const defaultConfig: Required<ParallaxConfig> = {
  smoothness: 0.08,
  maxOffset: 40,
  enableLighting: true,
};

export function useParallaxScene(
  layers: ParallaxLayer[],
  config: ParallaxConfig = {},
) {
  const cfg = { ...defaultConfig, ...config };

  // 鼠标位置 (-1 到 1 范围，中心为 0)
  const mouseNormalized = reactive({ x: 0, y: 0 });

  // 当前插值后的位置（平滑过渡）
  const currentPos = reactive({ x: 0, y: 0 });

  // 光照角度（模拟光源跟随鼠标）
  const lightAngle = ref(0);
  const lightIntensity = ref(0.5);

  let animationId: number | null = null;
  let isActive = false;

  // 处理鼠标移动
  function handleMouseMove(e: MouseEvent) {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    // 转换为 -1 到 1 的范围
    mouseNormalized.x = (clientX / innerWidth) * 2 - 1;
    mouseNormalized.y = (clientY / innerHeight) * 2 - 1;
  }

  // 动画循环：平滑插值
  function animate() {
    if (!isActive) return;

    // 线性插值实现平滑过渡
    currentPos.x += (mouseNormalized.x - currentPos.x) * cfg.smoothness;
    currentPos.y += (mouseNormalized.y - currentPos.y) * cfg.smoothness;

    // 计算光照角度
    if (cfg.enableLighting) {
      lightAngle.value =
        Math.atan2(currentPos.y, currentPos.x) * (180 / Math.PI);
      lightIntensity.value =
        0.3 + Math.sqrt(currentPos.x ** 2 + currentPos.y ** 2) * 0.4;
    }

    animationId = requestAnimationFrame(animate);
  }

  // 计算某一层的变换样式
  function getLayerStyle(layerName: string) {
    const layer = layers.find((l) => l.name === layerName);
    if (!layer) return {};

    const offsetX = currentPos.x * cfg.maxOffset * layer.depth;
    const offsetY = currentPos.y * cfg.maxOffset * layer.depth;

    // 轻微的旋转效果，增加立体感
    const rotateX = currentPos.y * 2 * layer.depth;
    const rotateY = -currentPos.x * 2 * layer.depth;

    const style: Record<string, string> = {
      transform: `translate3d(${offsetX}px, ${offsetY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    };

    // 亮度变化
    if (cfg.enableLighting && layer.lightVariation) {
      const brightness =
        1 + (currentPos.x * 0.5 + currentPos.y * 0.3) * layer.lightVariation;
      style.filter = `brightness(${brightness.toFixed(2)})`;
    }

    return style;
  }

  // 获取光照渐变样式（用于背景或覆盖层）
  const lightingOverlayStyle = computed(() => {
    if (!cfg.enableLighting) return {};

    const x = 50 + currentPos.x * 30;
    const y = 50 + currentPos.y * 30;

    return {
      background: `radial-gradient(ellipse at ${x}% ${y}%, rgba(255,255,255,0.03) 0%, transparent 60%)`,
    };
  });

  // 启动视差效果
  function start() {
    if (isActive) return;
    isActive = true;
    window.addEventListener("mousemove", handleMouseMove);
    animate();
  }

  // 停止视差效果
  function stop() {
    isActive = false;
    window.removeEventListener("mousemove", handleMouseMove);
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // 生命周期钩子
  onMounted(() => {
    start();
  });

  onUnmounted(() => {
    stop();
  });

  return {
    /** 归一化鼠标位置 (-1 到 1) */
    mouseNormalized,
    /** 当前平滑后的位置 */
    currentPos,
    /** 光照角度 (度) */
    lightAngle,
    /** 光照强度 */
    lightIntensity,
    /** 获取指定层的变换样式 */
    getLayerStyle,
    /** 光照覆盖层样式 */
    lightingOverlayStyle,
    /** 启动视差 */
    start,
    /** 停止视差 */
    stop,
  };
}
