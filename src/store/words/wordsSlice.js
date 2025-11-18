// store/words/wordsSlice.js

import { createSlice } from "@reduxjs/toolkit";

const wordsSlice = createSlice({
  name: "words",
  initialState: {
    list: [],
    index: 0,
    currentLessonId: null,
    // 💡 ДОБАВЛЕНО: Язык текущего урока
    currentLessonLang: null,
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
      // 💡 ИЗМЕНЕНО: Извлекаем 'lang'
      const { words, lessonId, lang } = action.payload;

      // 🟢 Защита: Извлекаем cards, если words - это объект { lang, cards }
      const cardsToUse = words?.cards || words;

      state.list = (Array.isArray(cardsToUse) ? cardsToUse : []).map((w) => ({
        ...w,
        lessonId,
      }));

      state.currentLessonId = lessonId;
      // 💡 СОХРАНЕНО: Язык урока
      state.currentLessonLang = lang || null;

      // 💡 Добавляем логику загрузки индекса, чтобы продолжить с последнего места
      const savedIndex = JSON.parse(
        localStorage.getItem(`index_${lessonId}`) || "0"
      );
      state.index = savedIndex;
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

export const { nextCard, prevCard, selectLesson, saveIndex } =
  wordsSlice.actions;
export default wordsSlice.reducer;
