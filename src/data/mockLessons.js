// src/data/mockLessons.js

// --- 🇩🇪 Немецкие уроки (Папка: Немецкий A1) ---
const germanLessons = {
  personal_pronouns: {
    lang: "de",
    folderId: "de_a1_pronomen",
    cards: [
      {
        de: "ich (Nominativ)",
        ru: "я (Именительный)",
        exde: "Ich bin Studentin.",
        exru: "Я студентка.",
      },
      {
        de: "du (Nominativ)",
        ru: "ты (Именительный)",
        exde: "Woher kommst du?",
        exru: "Откуда ты?",
      },
      {
        de: "er (Nominativ)",
        ru: "он (Именительный)",
        exde: "Er arbeitet in Berlin.",
        exru: "Он работает в Берлине.",
      },
      {
        de: "sie (Nominativ)",
        ru: "она (Именительный)",
        exde: "Sie liest ein Buch.",
        exru: "Она читает книгу.",
      },
      {
        de: "es (Nominativ)",
        ru: "оно (Именительный)",
        exde: "Es regnet heute.",
        exru: "Оно (сегодня) дождит. / Сегодня идёт дождь.",
      },
      {
        de: "wir (Nominativ)",
        ru: "мы (Именительный)",
        exde: "Wir gehen ins Kino.",
        exru: "Мы идём в кино.",
      },
      {
        de: "ihr (Nominativ)",
        ru: "вы [мн. ч.] (Именительный)",
        exde: "Macht ihr Sport?",
        exru: "Вы [мн. ч.] занимаетесь спортом?",
      },
      {
        de: "sie (Nominativ)",
        ru: "они [мн. ч.] (Именительный)",
        exde: "Sie sind meine Freunde.",
        exru: "Они мои друзья.",
      },
      {
        de: "Sie (Nominativ)",
        ru: "Вы [уважит.] (Именительный)",
        exde: "Haben Sie Zeit?",
        exru: "У Вас есть время?",
      },
      {
        de: "mich (Akkusativ)",
        ru: "меня (Винительный)",
        exde: "Kannst du mich hören?",
        exru: "Ты можешь меня слышать?",
      },
      {
        de: "dich (Akkusativ)",
        ru: "тебя (Винительный)",
        exde: "Ich liebe dich.",
        exru: "Я люблю тебя.",
      },
      {
        de: "ihn (Akkusativ)",
        ru: "его [м. р.] (Винительный)",
        exde: "Ich sehe ihn nicht.",
        exru: "Я не вижу его.",
      },
      {
        de: "sie (Akkusativ)",
        ru: "её [ж. р.] (Винительный)",
        exde: "Ich kenne sie gut.",
        exru: "Я хорошо знаю её.",
      },
      {
        de: "es (Akkusativ)",
        ru: "его [ср. р.] (Винительный)",
        exde: "Ich trinke es jetzt.",
        exru: "Я пью его сейчас.",
      },
      {
        de: "uns (Akkusativ)",
        ru: "нас (Винительный)",
        exde: "Er besucht uns morgen.",
        exru: "Он навестит нас завтра.",
      },
      {
        de: "euch (Akkusativ)",
        ru: "вас [мн. ч.] (Винительный)",
        exde: "Ich lade euch ein.",
        exru: "Я приглашаю вас [мн. ч.].",
      },
      {
        de: "sie (Akkusativ)",
        ru: "их [мн. ч.] (Винительный)",
        exde: "Ich sehe sie oft.",
        exru: "Я часто вижу их.",
      },
      {
        de: "Sie (Akkusativ)",
        ru: "Вас [уважит.] (Винительный)",
        exde: "Ich respektiere Sie.",
        exru: "Я уважаю Вас.",
      },
      {
        de: "mir (Dativ)",
        ru: "мне (Дательный)",
        exde: "Hilf mir bitte!",
        exru: "Помоги мне, пожалуйста!",
      },
      {
        de: "dir (Dativ)",
        ru: "тебе (Дательный)",
        exde: "Wie geht es dir?",
        exru: "Как тебе (живётся)? / Как дела?",
      },
      {
        de: "ihm (Dativ)",
        ru: "ему [м. р., ср. р.] (Дательный)",
        exde: "Ich gebe ihm ein Geschenk.",
        exru: "Я даю ему подарок.",
      },
      {
        de: "ihr (Dativ)",
        ru: "ей [ж. р.] (Дательный)",
        exde: "Das gehört ihr.",
        exru: "Это принадлежит ей.",
      },
      {
        de: "uns (Dativ)",
        ru: "нам (Дательный)",
        exde: "Er dankt uns.",
        exru: "Он благодарит нас.",
      },
      {
        de: "euch (Dativ)",
        ru: "вам [мн. ч.] (Дательный)",
        exde: "Ich erzähle euch etwas.",
        exru: "Я рассказываю вам [мн. ч.] что-то.",
      },
      {
        de: "ihnen (Dativ)",
        ru: "им [мн. ч.] (Дательный)",
        exde: "Ich helfe ihnen.",
        exru: "Я помогаю им.",
      },
      {
        de: "Ihnen (Dativ)",
        ru: "Вам [уважит.] (Дательный)",
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
