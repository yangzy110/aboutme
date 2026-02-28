<script setup lang="ts">
/**
 * 页面4 — 书架
 * 8本书，单层书柜，点击拿书动画 + 展开至页面中心
 */
import { ref, reactive, nextTick } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

interface Book {
  id: number;
  title: string;
  color: string;
  spine: string;
  width: number;
  height: number;
  preface: string;
}

const books: Book[] = [
  {
    id: 1,
    title: "四川",
    color: "#b71c1c",
    spine: "#7f0000",
    width: 52,
    height: 300,
    preface:
      "天府之国，云雾缭绕的峨眉山巅，滚烫鲜香的火锅翻涌着人间烟火。从九寨沟的碧波到成都的巷弄茶馆，四川用它的热辣与温柔，书写着一部关于生活本真的诗篇。这里的每一寸土地都浸润着巴蜀文明千年的厚重与从容。",
  },
  {
    id: 2,
    title: "天津",
    color: "#1565c0",
    spine: "#0d47a1",
    width: 56,
    height: 310,
    preface:
      "海河蜿蜒穿城而过，五大道的小洋楼里藏着百年风云。天津卫的相声与狗不理的热气，是北方幽默与豪爽的缩影。这座城市从不张扬，却在每一个清晨的煎饼果子摊前，诉说着最地道的市井温情与人间况味。",
  },
  {
    id: 3,
    title: "长春",
    color: "#2e7d32",
    spine: "#1b5e20",
    width: 50,
    height: 295,
    preface:
      "北国春城，白雪覆盖的大地下蕴藏着无尽的生机。净月潭的松林在四季中变换着色彩，伪满遗迹无声地诉说历史的沉重与反思。长春用它的坚韧与质朴，在凛冽的寒风中绽放出属于东北黑土地的独特芬芳。",
  },
  {
    id: 4,
    title: "江苏",
    color: "#6a1b9a",
    spine: "#4a148c",
    width: 54,
    height: 305,
    preface:
      "烟雨江南，自古便是文人墨客心中的桃源。苏州的园林、南京的梧桐、扬州的月色，江苏将诗画融入了每一条河流与街巷。这片土地上，吴侬软语与六朝金粉交织成一幅流淌千年的水墨长卷。",
  },
  {
    id: 5,
    title: "上海",
    color: "#e65100",
    spine: "#bf360c",
    width: 52,
    height: 298,
    preface:
      "魔都的霓虹从未熄灭，外滩的钟声跨越了一个世纪。弄堂里的烟火与陆家嘴的天际线共存，这座城市是东方与西方、传统与摩登最精妙的交汇点。上海教会每一个旅人——繁华之下，自有一份精致的从容。",
  },
  {
    id: 6,
    title: "大连",
    color: "#00695c",
    spine: "#004d40",
    width: 56,
    height: 312,
    preface:
      "面朝黄海与渤海，大连是镶嵌在辽东半岛上的一颗明珠。星海广场的海风带着咸湿的浪漫，老虎滩的浪花拍打着北方海岸的豪迈。这座城市用碧海蓝天与欧式建筑，勾勒出一幅独属于北方的海滨画卷。",
  },
  {
    id: 7,
    title: "湖南",
    color: "#4e342e",
    spine: "#3e2723",
    width: 50,
    height: 300,
    preface:
      "惟楚有才，于斯为盛。湘江奔涌，岳麓山下弦歌不辍。从张家界的鬼斧神工到凤凰古城的灯火阑珊，湖南人骨子里的血性与浪漫，如同那一碗热烈的辣椒，点燃了这片红色热土上永不停歇的激情。",
  },
  {
    id: 8,
    title: "泰国",
    color: "#c62828",
    spine: "#8e0000",
    width: 54,
    height: 308,
    preface:
      "微笑之国，金碧辉煌的佛寺与碧蓝无垠的海岛交相辉映。曼谷街头突突车穿梭的热闹，清迈古城悠然的慢时光，还有普吉岛浪花里的自由——泰国用它独有的温柔与虔诚，拥抱每一个远道而来的旅人。",
  },
];

const hoveredId = ref<number | null>(null);
const selectedBook = ref<Book | null>(null);
const animatingBookId = ref<number | null>(null);
const bookRects = reactive<Record<number, DOMRect>>({});
const flyStyle = ref<Record<string, string>>({});
const showOverlay = ref(false);
const showFullBook = ref(false);

function onBookClick(book: Book, event: MouseEvent) {
  if (selectedBook.value) return;

  // 获取点击书本在页面上的位置
  const el = event.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  bookRects[book.id] = rect;
  animatingBookId.value = book.id;

  // 初始位置（书本原位置）
  flyStyle.value = {
    position: "fixed",
    left: rect.left + "px",
    top: rect.top + "px",
    width: rect.width + "px",
    height: rect.height + "px",
    zIndex: "2000",
    transition: "none",
    opacity: "1",
    borderRadius: "4px",
    background: book.color,
    boxShadow: "4px 8px 32px rgba(0,0,0,0.5)",
  };

  showOverlay.value = true;

  // 下一帧飞到中心
  nextTick(() => {
    requestAnimationFrame(() => {
      const targetW = 560;
      const targetH = 700;
      flyStyle.value = {
        ...flyStyle.value,
        left: `calc(50vw - ${targetW / 2}px)`,
        top: `calc(50vh - ${targetH / 2}px)`,
        width: targetW + "px",
        height: targetH + "px",
        transition: "all 0.55s cubic-bezier(0.34,1.56,0.64,1)",
        borderRadius: "8px",
      };

      setTimeout(() => {
        selectedBook.value = book;
        showFullBook.value = true;
        animatingBookId.value = null;
      }, 580);
    });
  });
}

function closeBook() {
  showFullBook.value = false;
  showOverlay.value = false;
  selectedBook.value = null;
  animatingBookId.value = null;
  flyStyle.value = {};
}
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
        <!-- 飞行中的书本（动画占位） -->
        <div
          v-if="!showFullBook && (selectedBook || animatingBookId)"
          class="fly-book"
          :style="flyStyle"
        >
          <div
            class="fly-spine"
            :style="{
              background: (
                selectedBook || books.find((b) => b.id === animatingBookId)
              )?.spine,
            }"
          />
          <div class="fly-cover">
            <div class="fly-cover-inner">
              <div class="fly-ornament" />
              <span class="fly-book-title">
                {{
                  (selectedBook || books.find((b) => b.id === animatingBookId))
                    ?.title
                }}
              </span>
              <div class="fly-decoration" />
              <span class="fly-book-sub">旅行笔记</span>
              <div class="fly-ornament" />
            </div>
          </div>
        </div>

        <!-- 展开后的完整书本 -->
        <Transition name="book-appear">
          <div
            v-if="showFullBook && selectedBook"
            class="full-book"
            @click.stop
          >
            <div class="book-wrapper">
              <!-- 书脊 -->
              <div
                class="book-spine-3d"
                :style="{ background: selectedBook.spine }"
              >
                <span class="book-spine-text">{{ selectedBook.title }}</span>
              </div>
              <!-- 书体 -->
              <div class="full-book-inner">
                <!-- 封面 -->
                <div
                  class="full-book-cover"
                  :style="{ background: selectedBook.color }"
                >
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
                    <p class="full-book-text">
                      {{ selectedBook.preface }}
                    </p>
                    <p class="full-book-text light">
                      愿这本书带你重温那段旅途中的温暖时光。
                    </p>
                  </div>
                  <div class="page-number">— 1 —</div>
                </div>
              </div>
            </div>
            <button class="close-book-btn" @click="closeBook">
              ✕ 放回书架
            </button>
          </div>
        </Transition>
      </div>
    </Transition>

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
  flex-direction: column;
}

.bookshelf {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transform: scale(1.25);
  transform-origin: center center;
}

.shelf-title {
  color: rgba(255, 255, 255, 0.75);
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin-bottom: 24px;
  user-select: none;
}

.shelf-row {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 14px;
  padding: 0 40px;
  min-height: 340px;
}

/* 架板 */
.shelf-board {
  position: absolute;
  bottom: -10px;
  left: -30px;
  right: -30px;
  height: 16px;
  background: linear-gradient(180deg, #3d2b1f 0%, #5c3d2e 40%, #4a2f20 100%);
  border-radius: 3px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* 架板侧面厚度 */
.shelf-board::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 4px;
  right: 4px;
  height: 6px;
  background: linear-gradient(180deg, #2a1c14 0%, #1a100b 100%);
  border-radius: 0 0 3px 3px;
}

/* 单本书 */
.book {
  position: relative;
  width: var(--book-w, 52px);
  height: var(--book-h, 300px);
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom center;
  perspective: 600px;
}

.book:hover {
  z-index: 10;
}

.book--hover {
  transform: translateY(-36px) scale(1.06);
}

.book--hidden {
  opacity: 0;
  pointer-events: none;
}

/* 书脊 */
.book-spine {
  position: absolute;
  inset: 0;
  background: var(--book-color, #2c3e50);
  border-radius: 4px 2px 2px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset -3px 0 8px rgba(0, 0, 0, 0.35),
    inset 3px 0 6px rgba(255, 255, 255, 0.06),
    3px 6px 18px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.35s ease;
  overflow: hidden;
}

.book--hover .book-spine {
  box-shadow:
    inset -3px 0 8px rgba(0, 0, 0, 0.35),
    inset 3px 0 6px rgba(255, 255, 255, 0.06),
    4px 10px 30px rgba(0, 0, 0, 0.5),
    0 0 24px rgba(100, 150, 255, 0.15);
}

.book-spine::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 100%
  );
  pointer-events: none;
}

.book-spine::after {
  content: "";
  position: absolute;
  bottom: 12px;
  left: 20%;
  right: 20%;
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.book-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.3em;
  user-select: none;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.book--hover .book-title {
  color: rgba(255, 255, 255, 0.95);
}

.book-cover {
  position: absolute;
  top: 2px;
  right: -4px;
  bottom: 2px;
  width: 80%;
  background: var(--spine-color, #1a252f);
  border-radius: 0 4px 4px 0;
  transform-origin: left center;
  transform: rotateY(0deg);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
}

.book--hover .book-cover {
  transform: rotateY(-25deg);
  opacity: 1;
}

/* ========== 遮罩层 ========== */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1500;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-fade-enter-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-leave-active {
  transition: opacity 0.35s ease 0.3s;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* ========== 飞行书本 ========== */
.fly-book {
  display: flex;
  pointer-events: none;
  overflow: hidden;
  border-radius: 4px;
}

.fly-spine {
  width: 8%;
  min-width: 6px;
  border-radius: 4px 0 0 4px;
  box-shadow:
    inset -3px 0 8px rgba(0, 0, 0, 0.4),
    inset 2px 0 4px rgba(255, 255, 255, 0.06);
  transition: width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fly-cover {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.fly-cover::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    linear-gradient(225deg, rgba(0, 0, 0, 0.12) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}

.fly-cover::after {
  content: "";
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}

.fly-cover-inner {
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 10%;
  background: rgba(0, 0, 0, 0.08);
  width: 80%;
  max-height: 80%;
  transition: all 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fly-ornament {
  width: 40px;
  height: 1px;
  background: rgba(255, 255, 255, 0.18);
  position: relative;
  flex-shrink: 0;
}

.fly-ornament::before,
.fly-ornament::after {
  content: "";
  position: absolute;
  top: -2px;
  width: 5px;
  height: 5px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
}

.fly-ornament::before {
  left: -8px;
}
.fly-ornament::after {
  right: -8px;
}

.fly-book-title {
  color: rgba(255, 255, 255, 0.95);
  font-size: clamp(14px, 4vw, 28px);
  font-weight: 800;
  letter-spacing: 0.2em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  transition: font-size 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: center;
  writing-mode: horizontal-tb;
}

.fly-decoration {
  width: 36px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
  flex-shrink: 0;
}

.fly-book-sub {
  color: rgba(255, 255, 255, 0.45);
  font-size: clamp(8px, 1.5vw, 12px);
  letter-spacing: 0.3em;
  font-weight: 400;
  transition: font-size 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ========== 展开后完整书本 ========== */
.full-book {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.book-wrapper {
  display: flex;
  filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.65));
}

/* 3D 书脊 */
.book-spine-3d {
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px 0 0 6px;
  box-shadow:
    inset -4px 0 12px rgba(0, 0, 0, 0.4),
    inset 2px 0 6px rgba(255, 255, 255, 0.06);
  position: relative;
  z-index: 2;
}

.book-spine-3d::after {
  content: "";
  position: absolute;
  right: 0;
  top: 8%;
  bottom: 8%;
  width: 2px;
  background: rgba(0, 0, 0, 0.2);
}

.book-spine-text {
  writing-mode: vertical-rl;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.full-book-inner {
  width: min(88vw, 900px);
  height: min(82vh, 640px);
  display: flex;
  overflow: hidden;
  border-radius: 0 8px 8px 0;
  position: relative;
}

/* 封面 */
.full-book-cover {
  width: 42%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.full-book-cover::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
    linear-gradient(225deg, rgba(0, 0, 0, 0.15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}

/* 封面纹理 */
.full-book-cover::after {
  content: "";
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}

.cover-border {
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin: 24px;
  background: rgba(0, 0, 0, 0.08);
}

.cover-ornament {
  width: 80px;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  position: relative;
}

.cover-ornament::before,
.cover-ornament::after {
  content: "";
  position: absolute;
  top: -3px;
  width: 7px;
  height: 7px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.cover-ornament::before {
  left: -10px;
}
.cover-ornament::after {
  right: -10px;
}

.full-book-name {
  color: rgba(255, 255, 255, 0.95);
  font-size: 3.2rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  text-shadow: 0 3px 16px rgba(0, 0, 0, 0.5);
}

.full-book-decoration {
  width: 70px;
  height: 2px;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 2px;
}

.full-book-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.05rem;
  letter-spacing: 0.35em;
  font-weight: 400;
}

/* 书页边缘 */
.page-edges {
  width: 8px;
  background: repeating-linear-gradient(
    to bottom,
    #f5f0e8 0px,
    #e8e0d4 1px,
    #f5f0e8 2px
  );
  box-shadow:
    inset 2px 0 4px rgba(0, 0, 0, 0.08),
    inset -1px 0 3px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

/* 内页 */
.full-book-pages {
  flex: 1;
  background: linear-gradient(135deg, #faf6ef 0%, #f0ebe0 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

/* 内页纸张纹理 */
.full-book-pages::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 0%, transparent 8%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23d4c9b8' fill-opacity='0.08'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%23d4c9b8' fill-opacity='0.05'/%3E%3C/svg%3E");
  pointer-events: none;
}

.page-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-content: center;
  padding: 56px 52px;
  position: relative;
  z-index: 1;
}

.page-number {
  text-align: center;
  padding-bottom: 20px;
  color: #b0a898;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  z-index: 1;
}

.full-book-preface-title {
  color: #3a3a3a;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-align: center;
  margin: 0;
}

.full-book-divider {
  width: 70px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #c4a882, transparent);
  border-radius: 1px;
  align-self: center;
  margin: 6px 0 12px;
}

.full-book-text {
  color: #2c2c2c;
  font-size: 1.1rem;
  line-height: 2.1;
  text-indent: 2em;
}

.full-book-text.light {
  color: #999;
  font-size: 0.95rem;
  font-style: italic;
  text-align: right;
  text-indent: 0;
  margin-top: 12px;
}

.close-book-btn {
  padding: 12px 36px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.05em;
}

.close-book-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

/* 书本展开动画 */
.book-appear-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.book-appear-leave-active {
  transition: all 0.3s ease;
}
.book-appear-enter-from {
  opacity: 0;
  transform: scale(0.85);
}
.book-appear-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* ========== 返回按钮 ========== */
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
