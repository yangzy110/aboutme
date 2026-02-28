import { ref, type Ref } from "vue";
import { HERO_NAME, HERO_ROLE, HERO_SUB } from "@/data/home";

/**
 * HomeView 入场动画组合式函数
 */
export function useEntrance() {
  // 入场动画状态
  const curtainVisible = ref(true);
  const scanLineActive = ref(false);
  const starsRevealed = ref(false);
  const heroNameText = ref("");
  const heroRoleText = ref("");
  const heroSubText = ref("");
  const bubbleReady = ref(false);
  const hudVisible = ref(false);
  const hintsVisible = ref(false);
  const sidePanelsVisible = ref(false);

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function typeWriter(
    text: string,
    target: Ref<string>,
    speed = 100,
  ): Promise<void> {
    return new Promise((resolve) => {
      let i = 0;
      target.value = "";
      const timer = setInterval(() => {
        if (i < text.length) {
          target.value += text[i];
          i++;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  async function runEntrance() {
    await sleep(200);
    scanLineActive.value = true;
    await sleep(700);
    starsRevealed.value = true;
    curtainVisible.value = false;
    await sleep(500);
    await typeWriter(HERO_NAME, heroNameText, 160);
    await sleep(200);
    await typeWriter(HERO_ROLE, heroRoleText, 45);
    await sleep(200);
    await typeWriter(HERO_SUB, heroSubText, 65);
    await sleep(400);
    bubbleReady.value = true;
    await sleep(300);
    hudVisible.value = true;
    sidePanelsVisible.value = true;
    await sleep(400);
    hintsVisible.value = true;
  }

  return {
    curtainVisible,
    scanLineActive,
    starsRevealed,
    heroNameText,
    heroRoleText,
    heroSubText,
    bubbleReady,
    hudVisible,
    hintsVisible,
    sidePanelsVisible,
    runEntrance,
  };
}
