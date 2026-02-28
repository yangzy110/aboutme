import { ref } from "vue";

/**
 * 星河彩蛋组合式函数（外星人和飞碟）
 */
export function useGalaxyEasterEgg() {
  const showAlien = ref(false);
  const showUfo = ref(false);
  const bubbleHovered = ref(false);

  let eggTimer2: ReturnType<typeof setTimeout> | null = null;
  let eggTimer4: ReturnType<typeof setTimeout> | null = null;

  function onBubbleEnter() {
    bubbleHovered.value = true;
    eggTimer2 = setTimeout(() => {
      showAlien.value = true;
    }, 2000);
    eggTimer4 = setTimeout(() => {
      showUfo.value = true;
    }, 4000);
  }

  function onBubbleLeave() {
    bubbleHovered.value = false;
    if (eggTimer2) {
      clearTimeout(eggTimer2);
      eggTimer2 = null;
    }
    if (eggTimer4) {
      clearTimeout(eggTimer4);
      eggTimer4 = null;
    }
    showAlien.value = false;
    showUfo.value = false;
  }

  function cleanup() {
    if (eggTimer2) clearTimeout(eggTimer2);
    if (eggTimer4) clearTimeout(eggTimer4);
  }

  return {
    showAlien,
    showUfo,
    bubbleHovered,
    onBubbleEnter,
    onBubbleLeave,
    cleanup,
  };
}
