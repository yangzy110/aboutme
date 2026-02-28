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

// 滚动处理 - 根据滚动位置更新当前页面
function handleScroll() {
  if (!containerRef.value) return;

  const scrollTop = containerRef.value.scrollTop;
  const windowHeight = window.innerHeight;
  const page = Math.round(scrollTop / windowHeight);

  currentPage.value = page;
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
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
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

      <!-- 第二页 -->
      <div class="page page-2">
        <div class="page-content">
          <h1>第二页</h1>
          <p>这里是第二页的内容</p>
        </div>
      </div>

      <!-- 第三页 -->
      <div class="page page-3">
        <div class="page-content">
          <h1>第三页</h1>
          <p>这里是第三页的内容</p>
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
