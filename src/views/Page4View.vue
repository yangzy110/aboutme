<script setup lang="ts">
/**
 * 页面4 — 书架
 * 10本书，hover 有拿起效果
 */
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

interface Book {
  id: number;
  title: string;
  color: string;
  spine: string; // 书脊颜色
  width: number; // px
  height: number; // px
}

const books: Book[] = [
  {
    id: 1,
    title: "星辰",
    color: "#2c3e50",
    spine: "#1a252f",
    width: 38,
    height: 220,
  },
  {
    id: 2,
    title: "海洋",
    color: "#1a5276",
    spine: "#0e3048",
    width: 42,
    height: 230,
  },
  {
    id: 3,
    title: "森林",
    color: "#1e8449",
    spine: "#145a32",
    width: 35,
    height: 210,
  },
  {
    id: 4,
    title: "火焰",
    color: "#922b21",
    spine: "#641e16",
    width: 44,
    height: 235,
  },
  {
    id: 5,
    title: "雷电",
    color: "#7d6608",
    spine: "#5b4a06",
    width: 36,
    height: 215,
  },
  {
    id: 6,
    title: "冰雪",
    color: "#2e86c1",
    spine: "#1a5276",
    width: 40,
    height: 225,
  },
  {
    id: 7,
    title: "暗影",
    color: "#1c1c2e",
    spine: "#0e0e18",
    width: 46,
    height: 240,
  },
  {
    id: 8,
    title: "光辉",
    color: "#d4ac0d",
    spine: "#9a7d0a",
    width: 34,
    height: 205,
  },
  {
    id: 9,
    title: "梦境",
    color: "#6c3483",
    spine: "#4a235a",
    width: 41,
    height: 228,
  },
  {
    id: 10,
    title: "时光",
    color: "#17202a",
    spine: "#0b1117",
    width: 38,
    height: 218,
  },
];

const hoveredId = ref<number | null>(null);
</script>

<template>
  <div class="page4">
    <!-- 书架 -->
    <div class="bookshelf">
      <!-- 书架标题 -->
      <h2 class="shelf-title">📚 我的书架</h2>

      <!-- 书架层 -->
      <div class="shelf-row">
        <div
          v-for="book in books.slice(0, 5)"
          :key="book.id"
          class="book"
          :class="{ 'book--hover': hoveredId === book.id }"
          :style="{
            '--book-color': book.color,
            '--spine-color': book.spine,
            '--book-w': book.width + 'px',
            '--book-h': book.height + 'px',
          }"
          @mouseenter="hoveredId = book.id"
          @mouseleave="hoveredId = null"
        >
          <div class="book-spine">
            <span class="book-title">{{ book.title }}</span>
          </div>
          <div class="book-cover" />
        </div>
        <!-- 架板 -->
        <div class="shelf-board" />
      </div>

      <div class="shelf-row">
        <div
          v-for="book in books.slice(5)"
          :key="book.id"
          class="book"
          :class="{ 'book--hover': hoveredId === book.id }"
          :style="{
            '--book-color': book.color,
            '--spine-color': book.spine,
            '--book-w': book.width + 'px',
            '--book-h': book.height + 'px',
          }"
          @mouseenter="hoveredId = book.id"
          @mouseleave="hoveredId = null"
        >
          <div class="book-spine">
            <span class="book-title">{{ book.title }}</span>
          </div>
          <div class="book-cover" />
        </div>
        <div class="shelf-board" />
      </div>
    </div>

    <button class="back-btn" @click="router.push('/')">← 返回</button>
  </div>
</template>

<style scoped>
.page4 {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 50%, #0d0d1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.bookshelf {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.shelf-title {
  color: rgba(255, 255, 255, 0.75);
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin-bottom: 20px;
  user-select: none;
}

.shelf-row {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 0 30px 0 30px;
  min-height: 260px;
}

/* 架板 */
.shelf-board {
  position: absolute;
  bottom: -8px;
  left: -20px;
  right: -20px;
  height: 12px;
  background: linear-gradient(180deg, #3d2b1f 0%, #5c3d2e 40%, #4a2f20 100%);
  border-radius: 2px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* 单本书 */
.book {
  position: relative;
  width: var(--book-w, 40px);
  height: var(--book-h, 220px);
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom center;
  perspective: 600px;
}

.book:hover {
  z-index: 10;
}

.book--hover {
  transform: translateY(-30px) scale(1.05);
}

/* 书脊 */
.book-spine {
  position: absolute;
  inset: 0;
  background: var(--book-color, #2c3e50);
  border-radius: 3px 1px 1px 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset -2px 0 6px rgba(0, 0, 0, 0.35),
    inset 2px 0 4px rgba(255, 255, 255, 0.06),
    2px 4px 12px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.35s ease;
  overflow: hidden;
}

.book--hover .book-spine {
  box-shadow:
    inset -2px 0 6px rgba(0, 0, 0, 0.35),
    inset 2px 0 4px rgba(255, 255, 255, 0.06),
    2px 8px 24px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(100, 150, 255, 0.15);
}

/* 书脊顶部渐变光泽 */
.book-spine::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08) 0%,
    transparent 100%
  );
  pointer-events: none;
}

/* 书脊底部色带 */
.book-spine::after {
  content: "";
  position: absolute;
  bottom: 8px;
  left: 20%;
  right: 20%;
  height: 3px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
}

.book-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2em;
  user-select: none;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.book--hover .book-title {
  color: rgba(255, 255, 255, 0.95);
}

/* 翻开效果 — 书的正面（hover时微露） */
.book-cover {
  position: absolute;
  top: 2px;
  right: -3px;
  bottom: 2px;
  width: 80%;
  background: var(--spine-color, #1a252f);
  border-radius: 0 3px 3px 0;
  transform-origin: left center;
  transform: rotateY(0deg);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.book--hover .book-cover {
  transform: rotateY(-25deg);
  opacity: 1;
}

.back-btn {
  position: fixed;
  top: 24px;
  left: 28px;
  z-index: 100;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(14px);
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.35);
}
</style>
