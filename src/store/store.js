import { configureStore, createSlice } from "@reduxjs/toolkit";

// 💡 ИСПРАВЛЕНИЕ 1: Загружаем прогресс для нового режима
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
const savedLearnedSentencePuzzle = JSON.parse(
  localStorage.getItem("learnedSentencePuzzle") || "[]"
);

const wordsSlice = createSlice({
  name: "words",
  initialState: {
    list: [],
    index: 0,
    // РАЗДЕЛЁННЫЙ ПРОГРЕСС
    learnedFlashcards: savedLearnedFlashcards,
    learnedMatching: savedLearnedMatching,
    learnedQuiz: savedLearnedQuiz,
    learnedWriting: savedLearnedWriting,
    // 💡 ИСПРАВЛЕНИЕ 2: Добавляем новое состояние
    learnedSentencePuzzle: savedLearnedSentencePuzzle,
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

    markLearned: (state, action) => {
      // mode: 'flashcards', 'matching', 'quiz', 'writing', 'sentence_puzzle'
      // Используется, когда слово выучено в ОДНОМ конкретном режиме.
      const { word, mode } = action.payload;

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
        // 💡 ИСПРАВЛЕНИЕ 3: Добавляем новый режим
        case "sentence_puzzle":
          targetState = state.learnedSentencePuzzle;
          targetKey = "learnedSentencePuzzle";
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

    // 💡 НОВОЕ ДЕЙСТВИЕ: Для отметки слова как выученного во ВСЕХ режимах
    markMasterLearned: (state, action) => {
      const { word } = action.payload; // Получаем только слово, режим не нужен

      if (!word || !word.de || !word.lessonId) {
        console.warn("Ошибка markMasterLearned: Некорректный формат payload.");
        return;
      }

      // Список всех ключей прогресса
      const progressKeys = [
        "learnedFlashcards",
        "learnedMatching",
        "learnedQuiz",
        "learnedWriting",
        "learnedSentencePuzzle",
      ];

      progressKeys.forEach((key) => {
        const targetState = state[key];

        // Проверяем, что слова с таким DE и lessonId еще нет в целевом массиве
        if (
          !targetState.some(
            (w) => w.de === word.de && w.lessonId === word.lessonId
          )
        ) {
          // Добавляем слово в Redux State
          targetState.push({ ...word });

          // Обновляем localStorage для каждого ключа
          localStorage.setItem(key, JSON.stringify(targetState));
        }
      });
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
          targetKey = "learnedWriting";
          break;
        // 💡 ИСПРАВЛЕНИЕ 4: Добавляем новый режим
        case "sentence_puzzle":
          targetKey = "learnedSentencePuzzle";
          break;
        default:
          console.error("Неизвестный режим removeLearned:", mode);
          return;
      }

      // Обновление состояния и localStorage
      // NOTE: targetState не используется напрямую, но targetKey нужен для state[targetKey]
      state[targetKey] = state[targetKey].filter(
        (w) => !(w.de === de && w.lessonId === targetLessonId)
      );

      localStorage.setItem(targetKey, JSON.stringify(state[targetKey]));
    },

    clearLessonProgress: (state, action) => {
      const { lessonId, mode } = action.payload;

      if (!lessonId || !mode) {
        console.warn(
          "Невозможно очистить прогресс: отсутствует LessonId или Mode.",
          action.payload
        );
        return;
      }

      let targetKey;

      switch (mode) {
        case "flashcards":
          targetKey = "learnedFlashcards";
          break;
        case "matching":
          targetKey = "learnedMatching";
          break;
        case "quiz":
          targetKey = "learnedQuiz";
          break;
        case "writing":
          targetKey = "learnedWriting";
          break;
        // 💡 ИСПРАВЛЕНИЕ 5: Добавляем новый режим
        case "sentence_puzzle":
          targetKey = "learnedSentencePuzzle";
          break;
        default:
          console.error("Неизвестный режим clearLessonProgress:", mode);
          return;
      }

      // Фильтруем и оставляем только слова из других уроков
      state[targetKey] = state[targetKey].filter(
        (w) => w.lessonId !== lessonId
      );

      // Обновляем localStorage
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

    resetLearned: (state) => {
      state.learnedFlashcards = [];
      state.learnedMatching = [];
      state.learnedQuiz = [];
      state.learnedWriting = [];
      // 💡 ИСПРАВЛЕНИЕ 6: Сброс нового прогресса
      state.learnedSentencePuzzle = [];

      localStorage.removeItem("learnedFlashcards");
      localStorage.removeItem("learnedMatching");
      localStorage.removeItem("learnedQuiz");
      localStorage.removeItem("learnedWriting");
      localStorage.removeItem("learnedSentencePuzzle"); // 💡 ИСПРАВЛЕНИЕ 7: Удаление из localStorage
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
  // 💡 ЭКСПОРТ НОВОГО ДЕЙСТВИЯ
  markMasterLearned,
  resetLearned,
  saveIndex,
  clearLessonProgress,
} = wordsSlice.actions;

export const store = configureStore({
  reducer: {
    words: wordsSlice.reducer,
  },
});
