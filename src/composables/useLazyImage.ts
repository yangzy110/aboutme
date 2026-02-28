import { ref, onMounted, onUnmounted, type Ref } from "vue";

/**
 * 图片懒加载 Composable
 * 使用 Intersection Observer API 实现图片懒加载
 *
 * @param scrollRoot - 可选的滚动容器，如果不提供则自动查找
 */
export function useLazyImage(scrollRoot?: HTMLElement | null) {
  const imageRef: Ref<HTMLImageElement | null> = ref(null);
  const isLoaded = ref(false);
  const isInView = ref(false);
  let observer: IntersectionObserver | null = null;

  /**
   * 查找最近的可滚动祖先元素
   */
  const findScrollableParent = (
    element: HTMLElement | null,
  ): HTMLElement | null => {
    if (!element || element === document.documentElement) {
      return null;
    }

    const { overflow, overflowY } = window.getComputedStyle(element);
    const isScrollable = /(auto|scroll)/.test(overflow + overflowY);

    if (isScrollable && element.scrollHeight > element.clientHeight) {
      return element;
    }

    return findScrollableParent(element.parentElement);
  };

  const load = () => {
    if (!imageRef.value || isLoaded.value) return;

    const img = imageRef.value;
    const src = img.dataset.src;

    if (src) {
      console.log("[useLazyImage] Loading:", src);

      // 创建一个新的 Image 对象来预加载
      const tempImage = new Image();

      tempImage.onload = () => {
        console.log("[useLazyImage] ✓ Loaded:", src);
        img.src = src;
        img.classList.add("lazy-loaded");
        isLoaded.value = true;
      };

      tempImage.onerror = (e) => {
        console.error(`[useLazyImage] ✗ Failed:`, src, e);
        isLoaded.value = true;
      };

      tempImage.src = src;
    } else {
      console.warn("[useLazyImage] No data-src found on img element");
    }
  };

  onMounted(() => {
    if (!imageRef.value) {
      console.warn("[useLazyImage] imageRef is null");
      return;
    }

    const dataSrc = imageRef.value.dataset.src;
    console.log("[useLazyImage] Setup observer for:", dataSrc);

    // 查找滚动容器
    const root = scrollRoot || findScrollableParent(imageRef.value);

    // 检查浏览器是否支持 Intersection Observer
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log("[useLazyImage] In view, loading:", dataSrc);
              isInView.value = true;
              load();
              // 加载后停止观察
              if (observer && imageRef.value) {
                observer.unobserve(imageRef.value);
              }
            }
          });
        },
        {
          root: root, // 使用找到的滚动容器
          rootMargin: "200px",
          threshold: 0.01,
        },
      );

      observer.observe(imageRef.value);
    } else {
      console.log(
        "[useLazyImage] No IntersectionObserver, loading immediately",
      );
      load();
    }
  });

  onUnmounted(() => {
    if (observer && imageRef.value) {
      observer.unobserve(imageRef.value);
      observer.disconnect();
    }
  });

  return {
    imageRef,
    isLoaded,
    isInView,
  };
}
