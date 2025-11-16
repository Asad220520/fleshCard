// store/words/progressSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { loadProgress, saveProgress } from "./progressLocalStorage";

const progressSlice = createSlice({
  name: "progress",
  initialState: {
    // ЗАГРУЗКА ПРОГРЕССА
    learnedFlashcards: loadProgress("learnedFlashcards"),
    learnedMatching: loadProgress("learnedMatching"),
    learnedQuiz: loadProgress("learnedQuiz"),
    learnedWriting: loadProgress("learnedWriting"),
    learnedSentencePuzzle: loadProgress("learnedSentencePuzzle"),
  },
  reducers: {
    markLearned: (state, action) => {
      // mode: 'flashcards', 'matching', 'quiz', 'writing', 'sentence_puzzle'
      const { word, mode } = action.payload;

      if (!word || !word.de || !word.lessonId || !mode) {
        console.warn(
          "Ошибка markLearned: Некорректный формат payload.",
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
        case "sentence_puzzle":
          targetKey = "learnedSentencePuzzle";
          break;
        default:
          console.error("Неизвестный режим markLearned:", mode);
          return;
      }

      const targetState = state[targetKey];

      // Проверяем, что слова с таким DE и lessonId еще нет
      if (
        !targetState.some(
          (w) => w.de === word.de && w.lessonId === word.lessonId
        )
      ) {
        // СОХРАНЯЕМ ВСЕ ПОЛЯ
        targetState.push({ ...word });
        saveProgress(targetKey, targetState);
      }
    },

    markMasterLearned: (state, action) => {
      const { word } = action.payload;

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

        // Проверяем, что слова с таким DE и lessonId еще нет
        if (
          !targetState.some(
            (w) => w.de === word.de && w.lessonId === word.lessonId
          )
        ) {
          // Добавляем слово в Redux State
          targetState.push({ ...word });

          // Обновляем localStorage для каждого ключа
          saveProgress(key, targetState);
        }
      });
    },

    removeLearned: (state, action) => {
      // Здесь предполагается, что LessonId можно получить из state.currentLessonId,
      // но в этом slice его нет. Используем переданный lessonId из payload.
      const { de, lessonId: passedLessonId, mode } = action.payload;

      if (!de || !passedLessonId || !mode) {
        console.warn(
          "Невозможно удалить слово: отсутствует DE, LessonId или Mode.",
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
        case "sentence_puzzle":
          targetKey = "learnedSentencePuzzle";
          break;
        default:
          console.error("Неизвестный режим removeLearned:", mode);
          return;
      }

      // Обновление состояния и localStorage
      state[targetKey] = state[targetKey].filter(
        (w) => !(w.de === de && w.lessonId === passedLessonId)
      );

      saveProgress(targetKey, state[targetKey]);
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
      saveProgress(targetKey, state[targetKey]);
    },

    resetLearned: (state) => {
      state.learnedFlashcards = [];
      state.learnedMatching = [];
      state.learnedQuiz = [];
      state.learnedWriting = [];
      state.learnedSentencePuzzle = [];

      localStorage.removeItem("learnedFlashcards");
      localStorage.removeItem("learnedMatching");
      localStorage.removeItem("learnedQuiz");
      localStorage.removeItem("learnedWriting");
      localStorage.removeItem("learnedSentencePuzzle");
    },
  },
});

export const {
  markLearned,
  markMasterLearned,
  removeLearned,
  clearLessonProgress,
  resetLearned,
} = progressSlice.actions;
export default progressSlice.reducer;
