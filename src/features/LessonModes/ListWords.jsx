import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
// 💡 ИСПРАВЛЕНИЕ 1: Импортируем markMasterLearned И removeLearned
import {
  markLearned, // Оставим на всякий случай, хотя не используется напрямую
  markMasterLearned, // <-- ИМПОРТИРОВАН
  removeLearned, // <-- ИМПОРТИРОВАН
  clearLessonProgress,
} from "../../store/words/progressSlice";
import { selectLesson } from "../../store/words/wordsSlice";
import { loadLessons } from "../../data/lessons-storage"; // <--- Путь должен быть верным!
import { lessons } from "../../data"; // Предполагаемый импорт, если используется

import AudioPlayer from "../../components/AudioPlayer";

// Импорт иконок
import {
  HiCheckCircle,
  HiArrowLeft,
  HiBookOpen,
  HiEyeOff,
  HiOutlineCheckCircle,
} from "react-icons/hi";

// 💡 КОНСТАНТЫ: Ключи для чтения глобальных настроек
const LANG_STORAGE_KEY = "selectedTtsLang";
const VOICE_STORAGE_KEY = "selectedTtsVoiceName";

// 💡 КОНСТАНТА: Список всех режимов для удаления (при "не выучено")
const ALL_MODES = [
  "flashcards",
  "matching",
  "quiz",
  "writing",
  "sentence_puzzle", // Включаем новый режим
];

/**
 * Страница, отображающая ПОЛНЫЙ список слов для текущего урока,
 * с возможностью озвучки и отметки статуса (выучено/не выучено).
 * Включает отображение примеров предложений (exde, exru).
 */
export default function ListWords() {
  const { languageId, lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 💡 СОСТОЯНИЕ ДЛЯ ХРАНЕНИЯ ВСЕХ УРОКОВ
  const [allLessonData, setAllLessonData] = useState({});

  // 💡 ИСПРАВЛЕНИЕ 2: Корректный доступ к вложенному состоянию 'navigation' и 'progress'
  const { list } = useSelector((state) => state.words.navigation);

  // 💡 ИСПРАВЛЕНИЕ 3: Корректный доступ к вложенному состоянию 'progress'
  const {
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  } = useSelector((state) => state.words.progress);

  // Слова для отображения: полный список из Redux Store
  const words = list?.filter((w) => w.lessonId === lessonId) || [];

  // 1. 💡 ЧТЕНИЕ АКТИВНОГО ЯЗЫКА И ИМЕНИ ГОЛОСА ИЗ LOCALSTORAGE
  const activeLangCode = useMemo(() => {
    return localStorage.getItem(LANG_STORAGE_KEY) || "de";
  }, []);

  const savedVoiceName = useMemo(() => {
    return localStorage.getItem(VOICE_STORAGE_KEY) || "";
  }, []);

  // 2. 💡 СОСТОЯНИЕ ГОЛОСОВ TTS
  const [voices, setVoices] = useState([]);
  const [selectedWordVoice, setSelectedWordVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // 3. 💡 ПОИСК СОХРАНЕННОГО ГОЛОСА (Логика выбора голоса)
  useEffect(() => {
    if (voices.length > 0) {
      let voiceFound = null;

      if (savedVoiceName) {
        voiceFound = voices.find(
          (v) => v.name === savedVoiceName && v.lang.startsWith(activeLangCode)
        );
      }

      if (!voiceFound) {
        const defaultVoice = voices.find((v) =>
          v.lang.startsWith(activeLangCode)
        );
        voiceFound = defaultVoice || null;
      }

      setSelectedWordVoice(voiceFound);
    }
  }, [voices, activeLangCode, savedVoiceName]);

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
    // Создаем уникальный ключ для всех выученных слов
    allLearnedWords.forEach((w) => set.add(`${w.de}-${w.lessonId}`));
    return set;
  }, [
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  ]);

  // --- Загрузка данных урока при обновлении ---
  useEffect(() => {
    // 1. Читаем ВСЕ уроки из localStorage
    const savedLessons = loadLessons();
    setAllLessonData(savedLessons); // Сохраняем для проверки существования

    const currentLessonWords = savedLessons[lessonId];

    // 2. Если в Redux список слов пуст, НО урок существует в хранилище, загружаем его в Redux.
    if ((!words || words.length === 0) && currentLessonWords) {
      dispatch(selectLesson({ words: currentLessonWords, lessonId }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, dispatch]);

  /** Переключает статус слова между "выучено" (везде) и "не выучено" (везде). */
  const handleToggleLearned = (word, isLearnedInAnyMode) => {
    const wordData = {
      ...word,
      // lessonId уже внутри, mode не нужен
    };

    if (isLearnedInAnyMode) {
      // 💡 Если выучено, удаляем ИЗ ВСЕХ РЕЖИМОВ
      // NOTE: removeLearned требует 'mode' в payload
      ALL_MODES.forEach((mode) => {
        dispatch(
          removeLearned({ de: wordData.de, lessonId: wordData.lessonId, mode })
        );
      });
    } else {
      // 💡 Если не выучено, используем мастер-действие, которое сохранит во ВСЕ режимы
      dispatch(markMasterLearned({ word: wordData }));
    }
  };
  // 1. 💡 Проверяем существование урока по данным из localStorage
  if (!allLessonData[lessonId])
    return (
      <div className="p-6 text-red-500 text-center dark:bg-gray-900 dark:text-red-400 min-h-screen">
        Урок не найден.
      </div>
    );

  // 2. Если урок найден в localStorage, но Redux еще не успел загрузить слова
  if (words.length === 0)
    return (
      <div className="p-12 text-center text-gray-500 bg-gray-50 min-h-[50vh] dark:bg-gray-900 dark:bg-gray-900">
        <div className="p-8 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 w-full max-w-lg mx-auto dark:bg-gray-800 dark:border-gray-700 dark:shadow-xl">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-50">
            Загрузка слов...
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Подождите, пока данные урока {lessonId.toUpperCase()} загрузятся.
          </p>
          <Link
            to={`/lesson/${lessonId}`}
            className="mt-4 inline-block px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition font-semibold dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            ← К уроку {lessonId.toUpperCase()}
          </Link>
        </div>
      </div>
    );

  // 3. Основной вид
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* Список слов */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-lg">
        {words.map((word) => {
          // 💡 ИСПОЛЬЗУЕМ: Проверяем, выучено ли слово в ЛЮБОМ режиме (Мастер-статус)
          const wordKey = `${word.de}-${word.lessonId}`;
          const isLearnedInAnyMode = learnedSet.has(wordKey);

          return (
            <div
              key={wordKey}
              className={`p-4 rounded-xl shadow-md flex justify-between items-start transition duration-150 border-2 ${
                isLearnedInAnyMode // Используем общий статус для стиля
                  ? "bg-green-50 border-green-500 hover:shadow-lg dark:bg-green-900 dark:border-green-600 dark:shadow-xl"
                  : "bg-white border-gray-200 hover:border-sky-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-sky-500 dark:shadow-xl"
              }`}
            >
              <div className="flex-1 min-w-0 pr-4">
                {/* 1. Основные слова (DE / RU) и статус */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {/* Статус слова */}
                    {isLearnedInAnyMode ? ( // Используем общий статус
                      <HiCheckCircle
                        className="w-6 h-6 text-green-500 flex-shrink-0 dark:text-green-400"
                        title="Выучено (в одном из режимов)"
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
                        {/* 🆕 СЛОВО: Используем activeLangCode, voice и стандартный rate=1.0 */}
                        <AudioPlayer
                          textToSpeak={word.de}
                          lang={activeLangCode}
                          voice={selectedWordVoice}
                          rate={1.0} // Стандартная скорость
                        />
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
                    {/* 🆕 ПРЕДЛОЖЕНИЕ: Используем activeLangCode, voice и замедленный rate=0.8 */}
                    <AudioPlayer
                      textToSpeak={word.exde}
                      lang={activeLangCode}
                      voice={selectedWordVoice}
                      rate={0.8} // Замедленная скорость для длинного текста
                    />
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
                  // Используем isLearnedInAnyMode для решения о добавлении (марк мастер) / удалении (удаление из всех)
                  handleToggleLearned(word, isLearnedInAnyMode);
                }}
                className={`p-3 rounded-full transition flex-shrink-0 self-center ml-2 ${
                  isLearnedInAnyMode // Используем мастер-статус для стиля кнопки
                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-700 dark:text-green-200 dark:hover:bg-green-600"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-700 dark:text-sky-200 dark:hover:bg-sky-600"
                }`}
                title={
                  isLearnedInAnyMode
                    ? "Удалить из прогресса (из всех режимов)"
                    : "Добавить в прогресс (во все режимы)"
                }
              >
                {/* Меняем иконку: если в мастер-статусе выучено, предлагаем "не выучить" (HiEyeOff), и наоборот */}
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
