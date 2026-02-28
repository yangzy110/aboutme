<script setup lang="ts">
/**
 * HomeView - 首页视图
 * 功能：2.5D视差效果、个人信息展示、全屏滚动
 */
import { ref, onMounted, onUnmounted } from "vue";
import ParallaxScene from "@/components/ParallaxScene.vue";

// 菜单状态
const menuOpen = ref(false);
// 侧边面板可见状态
const sidePanelsVisible = ref(false);
// 当前页面索引（0, 1, 2）
const currentPage = ref(0);
// 容器引用
const containerRef = ref<HTMLElement | null>(null);

// 菜单操作
function closeMenu() {
  if (menuOpen.value) menuOpen.value = false;
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.closest(".holo-nav") || target.closest(".bubble")) return;
  closeMenu();
}

// 滚动处理 - 根据滚动位置更新当前页面 + 时间线卡片动画
function handleScroll() {
  if (!containerRef.value) return;

  const scrollTop = containerRef.value.scrollTop;
  const windowHeight = window.innerHeight;
  const page = Math.round(scrollTop / windowHeight);

  currentPage.value = page;

  // 当滚动到第二页时，触发卡片动画
  if (page === 1) {
    setTimeout(() => {
      checkTimelineItemsVisibility();
    }, 50);
  }

  // 当滚动到第三页时，触发相册动画
  if (page === 2) {
    setTimeout(() => {
      checkGalleryItemsVisibility();
    }, 50);
  }
}

// 检查时间线卡片可见性
function checkTimelineItemsVisibility() {
  const timelineItems = document.querySelectorAll(".timeline-item");
  const windowHeight = window.innerHeight;

  timelineItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const isVisible = rect.top < windowHeight * 0.75 && rect.bottom > 0;

    if (isVisible && !item.classList.contains("timeline-item--visible")) {
      item.classList.add("timeline-item--visible");
    }
  });
}

// 检查相册项可见性
function checkGalleryItemsVisibility() {
  const galleryItems = document.querySelectorAll(".gallery-item");
  const windowHeight = window.innerHeight;

  galleryItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const isVisible = rect.top < windowHeight * 0.75 && rect.bottom > 0;

    if (isVisible && !item.classList.contains("gallery-item--visible")) {
      item.classList.add("gallery-item--visible");
    }
  });
}

// 第二页内部滚动处理
function handleCompanySectionScroll() {
  checkTimelineItemsVisibility();
}

// 第三页内部滚动处理
function handleLifeSectionScroll() {
  checkGalleryItemsVisibility();
}

// 点击指示器跳转
function goToPage(page: number) {
  if (page < 0 || page > 2 || !containerRef.value) return;

  containerRef.value.scrollTo({
    top: page * window.innerHeight,
    behavior: "smooth",
  });
}

// 生命周期
onMounted(() => {
  document.addEventListener("click", onClickOutside);
  // 延迟显示侧边面板
  setTimeout(() => {
    sidePanelsVisible.value = true;
  }, 500);

  // 为第二页的滚动容器添加监听
  setTimeout(() => {
    const companySection = document.querySelector(".company-section");
    if (companySection) {
      companySection.addEventListener("scroll", handleCompanySectionScroll);
    }

    // 为第三页的滚动容器添加监听
    const lifeSection = document.querySelector(".life-section");
    if (lifeSection) {
      lifeSection.addEventListener("scroll", handleLifeSectionScroll);
    }
  }, 100);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);

  // 移除第二页的滚动监听
  const companySection = document.querySelector(".company-section");
  if (companySection) {
    companySection.removeEventListener("scroll", handleCompanySectionScroll);
  }

  // 移除第三页的滚动监听
  const lifeSection = document.querySelector(".life-section");
  if (lifeSection) {
    lifeSection.removeEventListener("scroll", handleLifeSectionScroll);
  }
});
</script>

<template>
  <div ref="containerRef" class="home-container" @scroll="handleScroll">
    <!-- 滚动页面容器 -->
    <div class="pages-wrapper">
      <!-- 第一页 -->
      <div class="page page-1">
        <div class="home galaxy">
          <!-- 2.5D 多层视差背景 -->
          <ParallaxScene />

          <!-- 左侧面板：个人信息 -->
          <div
            class="side-panel side-left"
            :class="{
              'side--visible': sidePanelsVisible,
              'side--hide': menuOpen,
            }"
          >
            <div class="panel-glass">
              <div class="profile-content">
                <h2 class="profile-name">Zeyu Yang</h2>
                <p class="profile-role">Front-end Engineer</p>
                <p class="profile-birth">birth: 2000.07.17</p>
                <div class="profile-hobbies">
                  <span class="hobby-icon" title="椰子树">🌴</span>
                  <span class="hobby-icon" title="排球">🏐</span>
                  <span class="hobby-icon" title="沙滩">🏖️</span>
                  <span class="hobby-icon" title="游泳">🏊</span>
                  <span class="hobby-icon" title="羽毛球">🏸</span>
                  <span class="hobby-icon" title="唱歌">🎤</span>
                  <span class="hobby-icon" title="跳舞">💃</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧面板：技术栈 -->
          <div
            class="side-panel side-right"
            :class="{
              'side--visible': sidePanelsVisible,
              'side--hide': menuOpen,
            }"
          >
            <div class="panel-glass">
              <div class="tech-content">
                <h3 class="tech-title">Tech Stack</h3>
                <div class="tech-list">
                  <div class="tech-tag">React</div>
                  <div class="tech-tag">AntDesign</div>
                  <div class="tech-tag">Micro-app</div>
                  <div class="tech-tag">Umi</div>
                </div>
                <p class="tech-footer">此项目基于 Vue 和 Three.js 构建</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第三页 -->
      <div class="page page-3">
        <div class="life-section">
          <div class="life-title-wrapper">
            <h1 class="life-title">热爱生活 更爱美食</h1>
            <p class="life-subtitle">用脚步丈量世界，用味蕾品味人生</p>
          </div>

          <div class="gallery-grid">
            <!-- 1. 上海美食 -->
            <div class="gallery-item item-large" data-index="0">
              <div class="gallery-card">
                <div class="gallery-image">
                  <img src="@/assets/lf/1.png" alt="上海美食" />
                  <div class="image-overlay">
                    <div class="overlay-content">
                      <h3 class="place-name">魔都美味</h3>
                      <p class="place-poem">
                        不辞长作江南客<br />一饱吴餐便是仙
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. 台风天气在外滩玩耍 -->
            <div class="gallery-item" data-index="1">
              <div class="gallery-card">
                <div class="gallery-image">
                  <img src="@/assets/lf/2.png" alt="外滩风雨" />
                  <div class="image-overlay">
                    <div class="overlay-content">
                      <h3 class="place-name">风雨外滩</h3>
                      <p class="place-poem">
                        烟雨朦胧观浦江<br />狂风骤雨亦疏狂
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. 烟花三月下扬州 -->
            <div class="gallery-item" data-index="2">
              <div class="gallery-card">
                <div class="gallery-image">
                  <img src="@/assets/lf/3.png" alt="扬州春色" />
                  <div class="image-overlay">
                    <div class="overlay-content">
                      <h3 class="place-name">扬州春色</h3>
                      <p class="place-poem">
                        故人西辞黄鹤楼<br />烟花三月下扬州
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. 烟花三月下扬州（二） -->
            <div class="gallery-item" data-index="3">
              <div class="gallery-card">
                <div class="gallery-image">
                  <img src="@/assets/lf/4.png" alt="扬州漫步" />
                  <div class="image-overlay">
                    <div class="overlay-content">
                      <h3 class="place-name">扬州漫步</h3>
                      <p class="place-poem">
                        春风十里扬州路<br />卷上珠帘总不如
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. 四姑娘山 -->
            <div class="gallery-item" data-index="4">
              <div class="gallery-card">
                <div class="gallery-image">
                  <img src="@/assets/lf/6.png" alt="四姑娘山" />
                  <div class="image-overlay">
                    <div class="overlay-content">
                      <h3 class="place-name">四姑娘山</h3>
                      <p class="place-poem">
                        蜀山之后四姑娘<br />云海雪峰共徜徉
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二页 -->
      <div class="page page-2">
        <div class="company-section">
          <div class="company-title-wrapper">
            <h1 class="company-title">职业之旅</h1>
            <p class="company-subtitle">我在公司的成长历程</p>
          </div>

          <div class="timeline-container">
            <!-- 时间线项目1：加入大家庭 -->
            <div class="timeline-item" data-index="0">
              <div class="timeline-card">
                <div class="card-image">
                  <img src="@/assets/cpn/1.png" alt="加入大家庭" />
                </div>
                <div class="card-content">
                  <h3 class="card-title">加入大家庭</h3>
                  <p class="card-desc">踏入新征程，成为团队的一员</p>
                </div>
              </div>
            </div>

            <!-- 时间线项目2：从观众到演员的"蜕变" -->
            <div class="timeline-item" data-index="1">
              <div class="timeline-card timeline-card-double">
                <div class="card-images-row">
                  <div class="card-image">
                    <img src="@/assets/cpn/2.png" alt="观众视角" />
                  </div>
                  <div class="card-image">
                    <img src="@/assets/cpn/3.png" alt="演员视角" />
                  </div>
                </div>
                <div class="card-content">
                  <h3 class="card-title">从观众到演员的"蜕变"</h3>
                  <p class="card-desc">不断学习，从旁观者到参与者</p>
                </div>
              </div>
            </div>

            <!-- 时间线项目3：加班餐很丰盛 -->
            <div class="timeline-item" data-index="2">
              <div class="timeline-card">
                <div class="card-image">
                  <img src="@/assets/cpn/4.png" alt="加班餐很丰盛" />
                </div>
                <div class="card-content">
                  <h3 class="card-title">加班餐很丰盛</h3>
                  <p class="card-desc">福利满满，温暖人心</p>
                </div>
              </div>
            </div>

            <!-- 时间线项目4：小有成就 -->
            <div class="timeline-item" data-index="3">
              <div class="timeline-card">
                <div class="card-image">
                  <img src="@/assets/cpn/5.png" alt="小有成就" />
                </div>
                <div class="card-content">
                  <h3 class="card-title">小有成就</h3>
                  <p class="card-desc">收获成长，见证进步</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页面指示器 -->
    <div class="page-indicators">
      <div
        v-for="page in 3"
        :key="page"
        class="indicator"
        :class="{ active: currentPage === page - 1 }"
        @click="goToPage(page - 1)"
      ></div>
    </div>
  </div>
</template>

<style scoped>
@import "@/styles/views/home.scss";
</style>
