// src/data/mockLessons.js

// --- 🇩🇪 Немецкие уроки (Папка: Немецкий A1) ---
const germanLessons = {
  // Урок MOKO
  moko: {
    lang: "de",
    folderId: "de_a1", // 💡 Привязка к папке
    cards: [
      {
        de: "der Gast",
        ru: "гость",
        exde: "Der Gast kommt heute Abend.",
        exru: "Гость приедет сегодня вечером.",
        distractors: [],
        lessonId: "moko",
      },
      {
        de: "der Job",
        ru: "работа",
        exde: "Ich suche einen neuen Job.",
        exru: "Я ищу новую работу.",
        distractors: [],
        lessonId: "moko",
      },
    ],
  },
  // Немецкий A2
  german_a2: {
    lang: "de",
    folderId: "de_a1", // 💡 Привязка к той же папке
    cards: [
      {
        de: "die Wohnung",
        ru: "квартира",
        exde: "...",
        exru: "...",
        distractors: [],
        lessonId: "german_a2",
      },
      {
        de: "das Fenster",
        ru: "окно",
        exde: "...",
        exru: "...",
        distractors: [],
        lessonId: "german_a2",
      },
    ],
  },
};

// --- 🇬🇧 Английские уроки (Папка: Основной Английский) ---
const englishLessons = {
  // Урок English Basics
  english_basics: {
    lang: "en",
    folderId: "en_main", // 💡 Привязка к папке
    cards: [
      {
        de: "The cat",
        ru: "Кошка",
        exde: "The cat sleeps on the sofa.",
        exru: "Кошка спит на диване.",
        distractors: [],
        lessonId: "english_basics",
      },
      {
        de: "Dog",
        ru: "Собака",
        exde: "My dog is very friendly.",
        exru: "Моя собака очень дружелюбная.",
        distractors: [],
        lessonId: "english_basics",
      },
    ],
  },
  // Урок English Travel
  english_travel: {
    lang: "en",
    folderId: "en_main", // 💡 Привязка к той же папке
    cards: [
      {
        de: "Airport",
        ru: "Аэропорт",
        exde: "We are going to the airport.",
        exru: "Мы едем в аэропорт.",
        distractors: [],
        lessonId: "english_travel",
      },
      {
        de: "Hotel",
        ru: "Отель",
        exde: "The hotel is booked for two nights.",
        exru: "Отель забронирован на две ночи.",
        distractors: [],
        lessonId: "english_travel",
      },
    ],
  },
};

// 🟢 Экспортируем плоский объект, объединяющий все уроки
export const mockLessons = {
  ...germanLessons,
  ...englishLessons,
};

// 💡 Примечание: В LessonsList.js в useEffect вы должны также инициализировать
// метаданные этих папок (de_a1, en_main) в стейте foldersData,
// если они еще не существуют в localStorage.
