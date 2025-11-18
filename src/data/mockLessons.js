// src/data/mockLessons.js

export const mockLessons = {
  // 🟢 Урок MOKO: lang: "de"
  moko: {
    lang: "de",
    cards: [
      // Немецкий (DE)
      {
        de: "der Gast",
        ru: "гость",
        exde: "...",
        exru: "...",
        distractors: [],
        lessonId: "moko", // Добавил lessonId, чтобы getUniqueLearnedWords работал корректно с моком
      },
      {
        de: "der Job",
        ru: "работа",
        exde: "...",
        exru: "...",
        distractors: [],
        lessonId: "moko",
      },
    ],
  },
  // 🟢 Урок English Basics: lang: "en"
  english_basics: {
    lang: "en",
    cards: [
      {
        de: "The cat",
        ru: "Кошка",
        exde: "...",
        exru: "...",
        distractors: [],
        lessonId: "english_basics",
      },
      {
        de: "Dog",
        ru: "Собака",
        exde: "...",
        exru: "...",
        distractors: [],
        lessonId: "english_basics",
      },
    ],
  },
};
