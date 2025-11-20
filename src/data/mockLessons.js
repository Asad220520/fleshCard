// src/data/mockLessons.js

// --- 🇩🇪 Немецкие уроки (Папка: Немецкий A1) ---
const germanLessons = {
  personal_pronouns: {
    lang: "de",
    folderId: "de_a1_pronomen",
    cards: [
      {
        de: "ich",
        ru: "я",
        exde: "Ich bin Studentin.",
        exru: "Я студентка.",
      },
      {
        de: "du",
        ru: "ты",
        exde: "Woher kommst du?",
        exru: "Откуда ты?",
      },
      {
        de: "er",
        ru: "он",
        exde: "Er arbeitet in Berlin.",
        exru: "Он работает в Берлине.",
      },
      {
        de: "sie",
        ru: "она",
        exde: "Sie liest ein Buch.",
        exru: "Она читает книгу.",
      },
      {
        de: "es",
        ru: "оно (ср. р.)",
        exde: "Es regnet heute.",
        exru: "Оно (сегодня) дождит. / Сегодня идёт дождь.",
      },
      {
        de: "wir",
        ru: "мы",
        exde: "Wir gehen ins Kino.",
        exru: "Мы идём в кино.",
      },
      {
        de: "ihr",
        ru: "вы [мн. ч.]",
        exde: "Macht ihr Sport?",
        exru: "Вы [мн. ч.] занимаетесь спортом?",
      },
      {
        de: "sie (pl)",
        ru: "они [мн. ч.]",
        exde: "Sie sind meine Freunde.",
        exru: "Они мои друзья.",
      },
      {
        de: "Sie",
        ru: "Вы [уважит.]",
        exde: "Haben Sie Zeit?",
        exru: "У Вас есть время?",
      },
      {
        de: "mich",
        ru: "меня",
        exde: "Kannst du mich hören?",
        exru: "Ты можешь меня слышать?",
      },
      {
        de: "dich",
        ru: "тебя",
        exde: "Ich liebe dich.",
        exru: "Я люблю тебя.",
      },
      {
        de: "ihn",
        ru: "его [м. р.]",
        exde: "Ich sehe ihn nicht.",
        exru: "Я не вижу его.",
      },
      {
        de: "sie",
        ru: "её [ж. р.]",
        exde: "Ich kenne sie gut.",
        exru: "Я хорошо знаю её.",
      },
      {
        de: "es",
        ru: "его [ср. р.]",
        exde: "Ich trinke es jetzt.",
        exru: "Я пью его сейчас.",
      },
      {
        de: "uns",
        ru: "нас [мн. ч.]",
        exde: "Er besucht uns morgen.",
        exru: "Он навестит нас завтра.",
      },
      {
        de: "euch",
        ru: "вас [мн. ч.]",
        exde: "Ich lade euch ein.",
        exru: "Я приглашаю вас [мн. ч.].",
      },
      {
        de: "sie",
        ru: "их [мн. ч.]",
        exde: "Ich sehe sie oft.",
        exru: "Я часто вижу их.",
      },
      {
        de: "Sie",
        ru: "Вас [уважит.]",
        exde: "Ich respektiere Sie.",
        exru: "Я уважаю Вас.",
      },
      {
        de: "mir",
        ru: "мне",
        exde: "Hilf mir bitte!",
        exru: "Помоги мне, пожалуйста!",
      },
      {
        de: "dir",
        ru: "тебе",
        exde: "Wie geht es dir?",
        exru: "Как тебе (живётся)? / Как дела?",
      },
      {
        de: "ihm",
        ru: "ему [м. р., ср. р.]",
        exde: "Ich gebe ihm ein Geschenk.",
        exru: "Я даю ему подарок.",
      },
      {
        de: "ihr",
        ru: "ей [ж. р.]",
        exde: "Das gehört ihr.",
        exru: "Это принадлежит ей.",
      },
      {
        de: "uns",
        ru: "нам [мн. ч.]",
        exde: "Er dankt uns.",
        exru: "Он благодарит нас.",
      },
      {
        de: "euch",
        ru: "вам [мн. ч.]",
        exde: "Ich erzähle euch etwas.",
        exru: "Я рассказываю вам [мн. ч.] что-то.",
      },
      {
        de: "ihnen",
        ru: "им [мн. ч.]",
        exde: "Ich helfe ihnen.",
        exru: "Я помогаю им.",
      },
      {
        de: "Ihnen",
        ru: "Вам [уважит.]",
        exde: "Ich gebe Ihnen die Schlüssel.",
        exru: "Я даю **Вам** ключи.",
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
