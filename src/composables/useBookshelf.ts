import { ref, reactive, nextTick } from "vue";
import type { Book } from "@/types/bookshelf";

/**
 * 书架交互逻辑
 */
export function useBookshelf() {
  const hoveredId = ref<number | null>(null);
  const selectedBook = ref<Book | null>(null);
  const animatingBookId = ref<number | null>(null);
  const bookRects = reactive<Record<number, DOMRect>>({});
  const flyStyle = ref<Record<string, string>>({});
  const showOverlay = ref(false);
  const showFullBook = ref(false);

  function onBookClick(book: Book, event: MouseEvent) {
    if (selectedBook.value) return;

    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    bookRects[book.id] = rect;
    animatingBookId.value = book.id;

    // 初始位置
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

    // 飞到中心
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

  return {
    hoveredId,
    selectedBook,
    animatingBookId,
    bookRects,
    flyStyle,
    showOverlay,
    showFullBook,
    onBookClick,
    closeBook,
  };
}
