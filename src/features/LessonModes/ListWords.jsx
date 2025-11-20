import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";

import {
  markMasterLearned,
  removeLearned,
} from "../../store/words/progressSlice";
import { selectLesson } from "../../store/words/wordsSlice";
import { loadLessons } from "../../data/lessons-storage";

import AudioPlayer from "../../components/AudioPlayer";

// Импорт иконок
import {
  HiCheckCircle,
  HiArrowLeft,
  HiEyeOff,
  HiOutlineCheckCircle,
} from "react-icons/hi";

// 💡 КОНСТАНТЫ:
const VOICE_STORAGE_KEY = "selectedTtsVoiceName";
const ALL_MODES = [
  "flashcards",
  "matching",
  "quiz",
  "writing",
  "sentence_puzzle",
];

export default function ListWords() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [allLessonData, setAllLessonData] = useState({});

  // 1. 💡 ИЗВЛЕКАЕМ ЯЗЫК УРОКА ИЗ REDUX
  const { list, currentLessonLang } = useSelector(
    (state) => state.words.navigation
  );

  const {
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  } = useSelector((state) => state.words.progress);

  const words = list?.filter((w) => w.lessonId === lessonId) || [];

  // 2. 💥 ИСПОЛЬЗУЕМ ЯЗЫК ИЗ REDUX для TTS
  const activeLangCode = useMemo(() => {
    return currentLessonLang || "de"; // Используем язык из Redux, или 'de' по умолчанию
  }, [currentLessonLang]); // Зависимость от языка урока

  const savedVoiceName = useMemo(() => {
    return localStorage.getItem(VOICE_STORAGE_KEY) || "";
  }, []);

  const [voices, setVoices] = useState([]);
  const [selectedWordVoice, setSelectedWordVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // 3. 💡 ОБНОВЛЕНИЕ ГОЛОСА ПРИ ИЗМЕНЕНИИ activeLangCode
  useEffect(() => {
    if (voices.length > 0) {
      let voiceFound = null;

      if (savedVoiceName) {
        // Ищем сохраненный голос, соответствующий активному языку
        voiceFound = voices.find(
          (v) => v.name === savedVoiceName && v.lang.startsWith(activeLangCode)
        );
      }

      if (!voiceFound) {
        // Ищем первый попавшийся голос для активного языка
        const defaultVoice = voices.find((v) =>
          v.lang.startsWith(activeLangCode)
        );
        voiceFound = defaultVoice || null;
      }

      setSelectedWordVoice(voiceFound);
    }
  }, [voices, activeLangCode, savedVoiceName]); // Зависимость от activeLangCode

  // 🛑 НОВЫЙ useEffect: АВТОМАТИЧЕСКОЕ ОЗВУЧИВАНИЕ ПРИ РЕНДЕРЕ (как в QuizMode)
  useEffect(() => {
    // Автоматическое озвучивание первого слова в списке при загрузке.
    if (words.length > 0 && selectedWordVoice) {
      window.speechSynthesis.cancel();
      try {
        const firstWord = words[0];
        const utterance = new SpeechSynthesisUtterance(firstWord.de);
        utterance.lang = selectedWordVoice.lang;
        utterance.voice = selectedWordVoice;
        utterance.rate = 1.0; // Сохраняем стандартную скорость для ListWords
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("TTS failed during initial load:", e);
      }
    }
    // Зависимости: words (для проверки, что они загружены), selectedWordVoice (для голоса)
  }, [words, selectedWordVoice]);

  // 💡 ВЫЧИСЛЯЕМ УНИВЕРСАЛЬНЫЙ НАБОР ВЫУЧЕННЫХ СЛОВ (Set)
  const learnedSet = useMemo(() => {
    const allLearnedWords = [
      ...learnedFlashcards,
      ...learnedMatching,
      ...learnedQuiz,
      ...learnedWriting,
      ...(learnedSentencePuzzle || []),
    ];
    const set = new Set();
    // Используем уникальный ключ, основанный на содержании (de + lessonId)
    allLearnedWords.forEach((w) => set.add(`${w.de}-${w.lessonId}`));
    return set;
  }, [
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  ]);

  // 💡 ВЫЧИСЛЯЕМ СТАТУС "ВСЕ ВЫУЧЕНЫ"
  const allWordsLearned = useMemo(() => {
    if (words.length === 0) return false;
    // Проверяем, что каждое слово присутствует в learnedSet
    return words.every((word) => learnedSet.has(`${word.de}-${word.lessonId}`));
  }, [words, learnedSet]);

  // --- Загрузка данных урока при обновлении ---
  useEffect(() => {
    const savedLessons = loadLessons();
    setAllLessonData(savedLessons);

    const currentLessonData = savedLessons[lessonId];

    // Если в Redux список слов пуст, НО урок существует в хранилище, загружаем его в Redux.
    if ((!words || words.length === 0) && currentLessonData?.cards) {
      // 4. 💡 При загрузке урока в Redux, также передаем его язык
      dispatch(
        selectLesson({
          words: currentLessonData.cards,
          lessonId,
          lang: currentLessonData.lang, // Передаем язык урока
        })
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, dispatch]);

  // --- Обработчики действий ---

  /** Переключает статус слова между "выучено" (везде) и "не выучено" (везде). */
  const handleToggleLearned = (word, isLearnedInAnyMode) => {
    const wordData = {
      ...word,
      // lessonId уже внутри
    };

    if (isLearnedInAnyMode) {
      // Если выучено, удаляем ИЗ ВСЕХ РЕЖИМОВ
      ALL_MODES.forEach((mode) => {
        dispatch(
          removeLearned({ de: wordData.de, lessonId: wordData.lessonId, mode })
        );
      });
    } else {
      // Используем мастер-действие, которое сохранит во ВСЕ режимы
      dispatch(markMasterLearned({ word: wordData }));
    }
  };

  /** 🚀 НОВЫЙ ОБРАБОТЧИК: Переключает статус "выучено" для ВСЕХ слов. */
  const handleToggleAllLearned = () => {
    // Определяем, нужно ли отметить все как выученные (true) или удалить отметку со всех (false)
    const shouldMarkAllAsLearned = !allWordsLearned;

    words.forEach((word) => {
      const wordData = { ...word };

      if (shouldMarkAllAsLearned) {
        // Отметить как выученное во ВСЕХ режимах
        dispatch(markMasterLearned({ word: wordData }));
      } else {
        // Удалить отметку ИЗ ВСЕХ РЕЖИМОВ
        ALL_MODES.forEach((mode) => {
          dispatch(
            removeLearned({
              de: wordData.de,
              lessonId: wordData.lessonId,
              mode,
            })
          );
        });
      }
    });
  };

  /** Возврат на главную страницу урока */
  const handleGoBack = () => {
    navigate(`/lesson/${lessonId}`);
  };

  // --- UI Рендеринг ---

  // 1. Проверяем существование урока по данным из localStorage
  if (!allLessonData[lessonId])
    return (
      <div className="p-6 text-red-500 text-center dark:bg-gray-900 dark:text-red-400 min-h-screen">
        Урок не найден.
        <button
          onClick={() => navigate("/")}
          className="mt-4 inline-block px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition font-semibold dark:bg-sky-600 dark:hover:bg-sky-700"
        >
          ← К списку уроков
        </button>
      </div>
    );

  // 2. Если урок найден в localStorage, но Redux еще не успел загрузить слова
  if (words.length === 0)
    return (
      <div className="p-12 text-center text-gray-500 bg-gray-50 min-h-[50vh] dark:bg-gray-900">
        <div className="p-8 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 w-full max-w-lg mx-auto dark:bg-gray-800 dark:border-gray-700 dark:shadow-xl">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-50">
            Загрузка слов...
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Подождите, пока данные урока {lessonId.toUpperCase()} загрузятся.
          </p>
          <button
            onClick={handleGoBack}
            className="mt-4 inline-block px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition font-semibold dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            ← К уроку {lessonId.toUpperCase()}
          </button>
        </div>
      </div>
    );

  // 3. Основной вид
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* 🚀 НОВЫЙ БЛОК: Кнопки "Выбрать все" / "Отменить все" */}
      <div className="w-full max-w-lg mb-4 flex justify-between space-x-2">
        <button
          onClick={handleToggleAllLearned}
          disabled={words.length === 0}
          className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold transition w-full ${
            allWordsLearned
              ? "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300" // Статус "Все выучены" -> Снять отметку
              : "bg-sky-500 text-white hover:bg-sky-600 disabled:bg-sky-300" // Статус "Не все выучены" -> Отметить все
          }`}
          title={
            allWordsLearned
              ? "Снять отметку со всех слов в уроке"
              : "Отметить все слова в уроке как выученные"
          }
        >
          {allWordsLearned ? (
            <>
              <HiEyeOff className="w-5 h-5 mr-1" />
              <span>Снять отметку со всех ({words.length})</span>
            </>
          ) : (
            <>
              <HiCheckCircle className="w-5 h-5 mr-1" />
              <span>Отметить все ({words.length})</span>
            </>
          )}
        </button>
      </div>
      {/* --- Конец НОВОГО БЛОКА --- */}

      {/* Список слов */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-lg">
        {words.map((word, index) => {
          // 💡 ДОБАВЛЕН 'index'
          // 💡 ИСПОЛЬЗУЕМ: Проверяем, выучено ли слово в ЛЮБОМ режиме (Мастер-статус)
          const wordCheckKey = `${word.de}-${word.lessonId}`;
          const isLearnedInAnyMode = learnedSet.has(wordCheckKey);

          // 🛑 ИСПРАВЛЕНИЕ КЛЮЧА: Добавляем 'index' для гарантированной уникальности
          const wordKey = `${word.de}-${word.lessonId}-${index}`;

          return (
            <div
              key={wordKey} // <-- ИСПОЛЬЗУЕМ УНИКАЛЬНЫЙ КЛЮЧ
              className={`p-4 rounded-xl shadow-md flex justify-between items-start transition duration-150 border-2 ${
                isLearnedInAnyMode
                  ? "bg-green-50 border-green-500 hover:shadow-lg dark:bg-green-900 dark:border-green-600 dark:shadow-xl"
                  : "bg-white border-gray-200 hover:border-sky-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-sky-500 dark:shadow-xl"
              }`}
            >
              <div className="flex-1 min-w-0 pr-4">
                {/* 1. Основные слова (DE / RU) и статус */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {/* Статус слова */}
                    {isLearnedInAnyMode ? (
                      <HiCheckCircle
                        className="w-6 h-6 text-green-500 flex-shrink-0 dark:text-green-400"
                        title="Выучено (во всех режимах)"
                      />
                    ) : (
                      <HiEyeOff
                        className="w-6 h-6 text-gray-400 flex-shrink-0 dark:text-gray-500"
                        title="Не выучено"
                      />
                    )}

                    {/* Слова и компонент Аудио */}
                    <div className="min-w-0">
                      <div className="font-bold text-lg text-gray-800 flex items-center dark:text-gray-50">
                        {word.de}
                        {/* 🛑 ИСПРАВЛЕНИЕ 1: Вызываем AudioPlayer только, если есть текст */}
                        {word.de && (
                          <AudioPlayer
                            textToSpeak={word.de}
                            lang={activeLangCode}
                            voice={selectedWordVoice}
                            rate={1.0}
                          />
                        )}
                      </div>
                      <div className="text-gray-600 text-sm dark:text-gray-300">
                        {word.ru}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. БЛОК: Предложения (exde / exru) */}
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Пример:
                  </p>
                  {/* Немецкое предложение */}
                  <div className="text-base text-gray-700 dark:text-gray-200 flex items-center mb-1">
                    <span className="font-bold">{word.exde || "—"}</span>
                    {/* 🛑 ИСПРАВЛЕНИЕ 2: Вызываем AudioPlayer только, если есть текст примера */}
                    {word.exde && (
                      <AudioPlayer
                        textToSpeak={word.exde}
                        // 6. 💡 ИСПОЛЬЗУЕМ activeLangCode (который берется из Redux)
                        lang={activeLangCode}
                        voice={selectedWordVoice}
                        rate={0.8}
                      />
                    )}
                  </div>
                  {/* Русское предложение */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {word.exru || "—"}
                  </div>
                </div>
              </div>

              {/* Кнопка "Отметить статус" (Вынесена вправо) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLearned(word, isLearnedInAnyMode);
                }}
                className={`p-3 rounded-full transition flex-shrink-0 self-center ml-2 ${
                  isLearnedInAnyMode
                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-700 dark:text-green-200 dark:hover:bg-green-600"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-700 dark:text-sky-200 dark:hover:bg-sky-600"
                }`}
                title={
                  isLearnedInAnyMode
                    ? "Удалить из прогресса (из всех режимов)"
                    : "Добавить в прогресс (во все режимы)"
                }
              >
                {/* Меняем иконку */}
                {isLearnedInAnyMode ? (
                  <HiEyeOff className="w-6 h-6" />
                ) : (
                  <HiOutlineCheckCircle className="w-6 h-6" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
