<script setup lang="ts">
/**
 * Page4View - 书架页面
 * 功能：8本书的展示，点击拿书动画，展开至页面中心
 */
import { useRouter } from 'vue-router'
import { useBookshelf } from '@/composables/useBookshelf'
import { books } from '@/data/bookshelf'

const router = useRouter()

const {
  hoveredId,
  selectedBook,
  animatingBookId,
  flyStyle,
  showOverlay,
  showFullBook,
  onBookClick,
  closeBook,
} = useBookshelf()
</script>

<template>
  <div class="page4">
    <!-- 书架 -->
    <div class="bookshelf">
      <h2 class="shelf-title">📚 我的书架</h2>

      <!-- 单层书架 -->
      <div class="shelf-row">
        <div
          v-for="book in books"
          :key="book.id"
          class="book"
          :class="{
            'book--hover': hoveredId === book.id && !selectedBook,
            'book--hidden':
              animatingBookId === book.id ||
              (selectedBook && selectedBook.id === book.id),
          }"
          :style="{
            '--book-color': book.color,
            '--spine-color': book.spine,
            '--book-w': book.width + 'px',
            '--book-h': book.height + 'px',
          }"
          @mouseenter="hoveredId = book.id"
          @mouseleave="hoveredId = null"
          @click="onBookClick(book, $event)"
        >
          <div class="book-spine">
            <span class="book-title">{{ book.title }}</span>
          </div>
          <div class="book-cover" />
        </div>
        <div class="shelf-board" />
      </div>
    </div>

    <!-- 遮罩 + 飞行动画书本 -->
    <Transition name="overlay-fade">
      <div v-if="showOverlay" class="overlay" @click="closeBook">
        <!-- 飞行中的书本 -->
        <div
          v-if="!showFullBook && (selectedBook || animatingBookId)"
          class="fly-book"
          :style="flyStyle"
        >
          <div
            class="fly-spine"
            :style="{
              background: (selectedBook || books.find((b) => b.id === animatingBookId))?.spine,
            }"
          />
          <div class="fly-cover">
            <div class="fly-cover-inner">
              <div class="fly-ornament" />
              <span class="fly-book-title">
                {{ (selectedBook || books.find((b) => b.id === animatingBookId))?.title }}
              </span>
              <div class="fly-decoration" />
              <span class="fly-book-sub">旅行笔记</span>
              <div class="fly-ornament" />
            </div>
          </div>
        </div>

        <!-- 展开后的完整书本 -->
        <Transition name="book-appear">
          <div v-if="showFullBook && selectedBook" class="full-book" @click.stop>
            <div class="book-wrapper">
              <!-- 书脊 -->
              <div class="book-spine-3d" :style="{ background: selectedBook.spine }">
                <span class="book-spine-text">{{ selectedBook.title }}</span>
              </div>
              <!-- 书体 -->
              <div class="full-book-inner">
                <!-- 封面 -->
                <div class="full-book-cover" :style="{ background: selectedBook.color }">
                  <div class="cover-border">
                    <div class="cover-ornament top" />
                    <h2 class="full-book-name">{{ selectedBook.title }}</h2>
                    <div class="full-book-decoration" />
                    <div class="full-book-subtitle">旅行笔记</div>
                    <div class="cover-ornament bottom" />
                  </div>
                </div>
                <!-- 书页边缘 -->
                <div class="page-edges" />
                <!-- 内页 -->
                <div class="full-book-pages">
                  <div class="page-inner">
                    <h3 class="full-book-preface-title">序 言</h3>
                    <div class="full-book-divider" />
                    <p class="full-book-text">{{ selectedBook.preface }}</p>
                    <p class="full-book-text light">愿这本书带你重温那段旅途中的温暖时光。</p>
                  </div>
                  <div class="page-number">— 1 —</div>
                </div>
              </div>
            </div>
            <button class="close-book-btn" @click="closeBook">✕ 放回书架</button>
          </div>
        </Transition>
      </div>
    </Transition>

    <button class="back-btn" @click="router.push('/')">← 返回</button>
  </div>
</template>

<style scoped>
@import '@/styles/views/page4.scss';
</style>
