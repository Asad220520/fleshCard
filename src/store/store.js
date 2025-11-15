import { configureStore, createSlice } from "@reduxjs/toolkit";

// Загружаем выученные слова из localStorage (если есть)
const savedLearned = JSON.parse(localStorage.getItem("learnedWords") || "[]");

const wordsSlice = createSlice({
  name: "words",
  initialState: {
    list: [],
    index: 0,
    learned: savedLearned, // { de, ru, lessonId, exde, exru, ... }
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

    removeLearned: (state, action) => {
      const { de, lessonId: passedLessonId } = action.payload;

      const targetLessonId = passedLessonId || state.currentLessonId;

      if (!de || !targetLessonId) {
        console.warn(
          "Невозможно удалить слово: отсутствует DE или LessonId.",
          action.payload
        );
        return;
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

    // ✅ РЕДЮСЕР MARKLEARNED: Сохраняет все поля слова, включая exde и exru.
    markLearned: (state, action) => {
      const current = action.payload?.word;

      if (!current || !current.de || !current.lessonId) {
        console.warn(
          "Ошибка markLearned: Некорректный формат слова в payload.",
          action.payload
        );
        return;
      }

      const lessonId = current.lessonId;

      // Проверяем, что слова с таким DE и lessonId еще нет в выученных
      if (
        !state.learned.some(
          (w) => w.de === current.de && w.lessonId === lessonId
        )
      ) {
        // СОХРАНЯЕМ ВСЕ ПОЛЯ
        state.learned.push({ ...current });
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
