import { configureStore, createSlice } from "@reduxjs/toolkit";

// Загружаем выученные слова из localStorage (если есть)
const savedLearned = JSON.parse(localStorage.getItem("learnedWords") || "[]");

const wordsSlice = createSlice({
  name: "words",
  initialState: {
    list: [],
    index: 0,
    learned: savedLearned, // { de, ru, lessonId }
    currentLessonId: null,
  },
  reducers: {
    nextCard: (state) => {
      if (state.list.length > 0)
        state.index = (state.index + 1) % state.list.length;
      if (state.currentLessonId) {
        localStorage.setItem(
          `index_${state.currentLessonId}`,
          JSON.stringify(state.index)
        );
      }
    },

    // ✅ ИСПРАВЛЕННЫЙ РЕДЮСЕР removeLearned
    // payload должен содержать { de, lessonId: string }
    // Если lessonId не передан, используется state.currentLessonId.
    removeLearned: (state, action) => {
      const { de, lessonId: passedLessonId } = action.payload;

      const targetLessonId = passedLessonId || state.currentLessonId;

      if (!de || !targetLessonId) {
        // Логируем ошибку, чтобы знать, что что-то пошло не так
        console.warn(
          "Невозможно удалить слово: отсутствует DE или LessonId.",
          action.payload
        );
        return; // Выходим
      }

      state.learned = state.learned.filter(
        (w) => !(w.de === de && w.lessonId === targetLessonId)
      );

      localStorage.setItem("learnedWords", JSON.stringify(state.learned));
    },

    prevCard: (state) => {
      if (state.list.length > 0)
        state.index = state.index > 0 ? state.index - 1 : state.list.length - 1;
      if (state.currentLessonId) {
        localStorage.setItem(
          `index_${state.currentLessonId}`,
          JSON.stringify(state.index)
        );
      }
    },
    selectLesson: (state, action) => {
      const { words, lessonId } = action.payload;
      state.list = (words || []).map((w) => ({ ...w, lessonId }));
      state.currentLessonId = lessonId;
      // Загружаем сохранённый индекс для урока
      const savedIndex = JSON.parse(
        localStorage.getItem(`index_${lessonId}`) || "0"
      );
      state.index = savedIndex;
    },
    markLearned: (state, action) => {
      const current = action.payload?.word || state.list[state.index];
      if (!current) return;
      const lessonId = current.lessonId || state.currentLessonId;
      if (
        !state.learned.some(
          (w) => w.de === current.de && w.lessonId === lessonId
        )
      ) {
        state.learned.push({ ...current, lessonId });
        localStorage.setItem("learnedWords", JSON.stringify(state.learned));
      }
    },
    resetLearned: (state) => {
      state.learned = [];
      localStorage.removeItem("learnedWords");
    },
    saveIndex: (state, action) => {
      state.index = action.payload;
      if (state.currentLessonId) {
        localStorage.setItem(
          `index_${state.currentLessonId}`,
          JSON.stringify(state.index)
        );
      }
    },
  },
});

export const {
  nextCard,
  prevCard,
  selectLesson,
  removeLearned,
  markLearned,
  resetLearned,
  saveIndex,
} = wordsSlice.actions;

export const store = configureStore({
  reducer: {
    words: wordsSlice.reducer,
  },
});