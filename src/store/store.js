import { configureStore, createSlice } from "@reduxjs/toolkit";

// Загружаем выученные слова из localStorage (если есть) по режимам
const savedLearnedFlashcards = JSON.parse(
  localStorage.getItem("learnedFlashcards") || "[]"
);
const savedLearnedMatching = JSON.parse(
  localStorage.getItem("learnedMatching") || "[]"
);
const savedLearnedQuiz = JSON.parse(
  localStorage.getItem("learnedQuiz") || "[]"
);
const savedLearnedWriting = JSON.parse(
  localStorage.getItem("learnedWriting") || "[]"
);

const wordsSlice = createSlice({
  name: "words",
  initialState: {
    list: [],
    index: 0,
    // 💡 РАЗДЕЛЁННЫЙ ПРОГРЕСС
    learnedFlashcards: savedLearnedFlashcards,
    learnedMatching: savedLearnedMatching,
    learnedQuiz: savedLearnedQuiz,
    learnedWriting: savedLearnedWriting,
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

    // 💡 ОБНОВЛЁННЫЙ markLearned: Принимает word и mode
    markLearned: (state, action) => {
      const { word, mode } = action.payload; // mode: 'flashcards', 'matching', 'quiz', 'writing'

      if (!word || !word.de || !word.lessonId || !mode) {
        console.warn(
          "Ошибка markLearned: Некорректный формат payload.",
          action.payload
        );
        return;
      }

      let targetState;
      let targetKey;

      switch (mode) {
        case "flashcards":
          targetState = state.learnedFlashcards;
          targetKey = "learnedFlashcards";
          break;
        case "matching":
          targetState = state.learnedMatching;
          targetKey = "learnedMatching";
          break;
        case "quiz":
          targetState = state.learnedQuiz;
          targetKey = "learnedQuiz";
          break;
        case "writing":
          targetState = state.learnedWriting;
          targetKey = "learnedWriting";
          break;
        default:
          console.error("Неизвестный режим markLearned:", mode);
          return;
      }

      // Проверяем, что слова с таким DE и lessonId еще нет в целевом массиве
      if (
        !targetState.some(
          (w) => w.de === word.de && w.lessonId === word.lessonId
        )
      ) {
        // СОХРАНЯЕМ ВСЕ ПОЛЯ
        targetState.push({ ...word });
        localStorage.setItem(targetKey, JSON.stringify(targetState));
      }
    },

    removeLearned: (state, action) => {
      const { de, lessonId: passedLessonId, mode } = action.payload;

      const targetLessonId = passedLessonId || state.currentLessonId;

      if (!de || !targetLessonId || !mode) {
        console.warn(
          "Невозможно удалить слово: отсутствует DE, LessonId или Mode.",
          action.payload
        );
        return;
      }

      let targetState;
      let targetKey;

      switch (mode) {
        case "flashcards":
          targetState = state.learnedFlashcards;
          targetKey = "learnedFlashcards";
          break;
        case "matching":
          targetState = state.learnedMatching;
          targetKey = "learnedMatching";
          break;
        case "quiz":
          targetState = state.learnedQuiz;
          targetKey = "learnedQuiz";
          break;
        case "writing":
          targetState = state.learnedWriting;
          targetKey = "learnedWriting";
          break;
        default:
          console.error("Неизвестный режим removeLearned:", mode);
          return;
      }

      state[targetKey] = targetState.filter(
        (w) => !(w.de === de && w.lessonId === targetLessonId)
      );

      localStorage.setItem(targetKey, JSON.stringify(state[targetKey]));
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

    // 💡 ОБНОВЛЁННЫЙ resetLearned: Очищает все массивы прогресса
    resetLearned: (state) => {
      state.learnedFlashcards = [];
      state.learnedMatching = [];
      state.learnedQuiz = [];
      state.learnedWriting = [];

      localStorage.removeItem("learnedFlashcards");
      localStorage.removeItem("learnedMatching");
      localStorage.removeItem("learnedQuiz");
      localStorage.removeItem("learnedWriting");
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
  // ✅ ДОБАВЛЕНО: Теперь экшен-креатор доступен
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