import { configureStore, createSlice } from "@reduxjs/toolkit";

// Загружаем выученные слова из localStorage (если есть)
const savedLearned = JSON.parse(localStorage.getItem("learnedWords") || "[]");

const wordsSlice = createSlice({
  name: "words",
  initialState: {
    list: [], // текущий набор слов (каждый элемент должен иметь lessonId)
    index: 0, // (можно оставить, но в компонентах мы используем локальный индекс)
    learned: savedLearned, // { de, ru, lessonId }
    currentLessonId: null,
  },
  reducers: {
    // Оставляем next/prev на случай, если где-то используются глобально
    nextCard: (state) => {
      if (state.list.length > 0)
        state.index = (state.index + 1) % state.list.length;
    },
    prevCard: (state) => {
      if (state.list.length > 0)
        state.index = state.index > 0 ? state.index - 1 : state.list.length - 1;
    },

    // payload: { words: [...], lessonId: "les1" }
    selectLesson: (state, action) => {
      const { words, lessonId } = action.payload;
      // Нормализуем: добавляем lessonId к каждому слову (если его нет)
      state.list = (words || []).map((w) => ({ ...w, lessonId }));
      state.currentLessonId = lessonId;
      state.index = 0;
    },

    // payload: { word: {de,ru, lessonId?} }  — добавляем в learned
    markLearned: (state, action) => {
      const payloadWord = action?.payload?.word;
      // определяем текущее слово: prefer payload, fallback на state.list[state.index]
      const current = payloadWord || state.list[state.index];
      if (!current) return;
      const lessonId = current.lessonId || state.currentLessonId || null;

      // защита от дублей: проверка по de + lessonId
      const exists = state.learned.some(
        (w) => w.de === current.de && w.lessonId === lessonId
      );
      if (!exists) {
        const toAdd = { ...current, lessonId };
        state.learned.push(toAdd);
        localStorage.setItem("learnedWords", JSON.stringify(state.learned));
      }
    },

    // payload { de, lessonId } или whole word
    removeLearned: (state, action) => {
      const payload = action.payload;
      const de = payload.de;
      const lessonId = payload.lessonId;
      state.learned = state.learned.filter(
        (w) => !(w.de === de && (lessonId ? w.lessonId === lessonId : true))
      );
      localStorage.setItem("learnedWords", JSON.stringify(state.learned));
    },

    resetLearned: (state) => {
      state.learned = [];
      localStorage.removeItem("learnedWords");
    },
  },
});

export const {
  nextCard,
  prevCard,
  selectLesson,
  markLearned,
  removeLearned,
  resetLearned,
} = wordsSlice.actions;

export const store = configureStore({
  reducer: {
    words: wordsSlice.reducer,
  },
});
