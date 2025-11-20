import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  markLearned,
  clearLessonProgress,
} from "../../store/words/progressSlice";
import { lessons } from "../../data";

import LessonComplete from "../../components/LessonComplete";
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheck,
  HiOutlineRefresh,
} from "react-icons/hi";

// --- СТИЛИ ДЛЯ АНИМАЦИИ ПЕРЕВОРАЧИВАНИЯ (Без изменений) ---
const flipCardStyles = {
  perspective: "1000px",
  width: "100%",
  maxWidth: "400px",
  height: "300px",
};

const flipCardInnerStyles = {
  position: "relative",
  width: "100%",
  height: "100%",
  textAlign: "center",
  transition: "transform 0.6s",
  transformStyle: "preserve-3d",
};

const flipCardFaceStyles = {
  position: "absolute",
  width: "100%",
  height: "100%",
  WebkitBackfaceVisibility: "hidden",
  backfaceVisibility: "hidden",
  borderRadius: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
};
// ------------------------------------------

export default function FlashCardsMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. 💡 REDUX СОСТОЯНИЯ
  const { list } = useSelector((state) => state.words.navigation);

  const {
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  } = useSelector((state) => state.words.progress);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionList, setSessionList] = useState([]);
  const [restartCount, setRestartCount] = useState(0);

  // 💡 ЛОГИКА ФИЛЬТРАЦИИ И ПОЛУЧЕНИЯ НЕВЫУЧЕННЫХ СЛОВ
  const getRemainingList = useCallback(() => {
    const allLearnedWords = [
      ...learnedFlashcards,
      ...learnedMatching,
      ...learnedQuiz,
      ...learnedWriting,
      ...(learnedSentencePuzzle || []),
    ];
    const learnedSet = new Set();
    allLearnedWords.forEach((w) => learnedSet.add(`${w.de}-${w.lessonId}`));

    return (
      list?.filter((word) => {
        const key = `${word.de}-${word.lessonId}`;
        // Фильтруем по ID урока и исключаем выученные слова
        return word.lessonId === lessonId && !learnedSet.has(key);
      }) || []
    );
  }, [
    list,
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
    lessonId,
  ]);

  const finalRemainingList = useMemo(
    () => getRemainingList(),
    [getRemainingList]
  );
  // 💡 Общее количество невыученных слов теперь используется для прогресса
  const totalRemaining = finalRemainingList.length;

  const current = sessionList[index];

  // 💡 ЛОГИКА ЗАГРУЗКИ НОВЫХ СЛОВ (ВСЕХ ОСТАВШИХСЯ)
  const loadNewWords = useCallback(() => {
    const actualRemainingList = finalRemainingList;
    if (actualRemainingList.length > 0) {
      // ✅ БЕРЕМ ВЕСЬ СПИСОК СЛОВ
      setSessionList(actualRemainingList);
      setIndex(0);
      setFlipped(false);
    } else if (list && list.length > 0) {
      setSessionList([]);
    }
  }, [finalRemainingList, list]);

  // Загрузка слов при первом рендере или изменении списка
  useEffect(() => {
    // 💡 При изменении finalRemainingList (т.е., когда слово помечено как выученное),
    // мы должны обновить sessionList, чтобы оно отражало новый, меньший список.
    if (finalRemainingList.length > 0) {
      // Если текущий sessionList не равен finalRemainingList, или он пуст, или рестарт
      if (
        sessionList.length !== finalRemainingList.length ||
        restartCount > 0
      ) {
        loadNewWords();
      }
    } else if (list && list.length > 0 && sessionList.length > 0) {
      // Если finalRemainingList пуст, но sessionList еще нет, очищаем, чтобы сработал LessonComplete
      setSessionList([]);
    }
    setRestartCount(0);
  }, [
    finalRemainingList,
    list,
    loadNewWords,
    restartCount,
    sessionList.length,
    sessionList,
  ]);

  // 💡 ПОВТОРНЫЙ ЦИКЛ, ЕСЛИ ПРОЙДЕН КОНЕЦ СПИСКА (без разбиения)
  useEffect(() => {
    if (sessionList.length > 0 && index >= sessionList.length) {
      // Если прошли все слова в текущем sessionList (которые являются всеми невыученными словами)
      // Начинаем цикл с начала.
      setIndex(0);
      setFlipped(false);
    }
  }, [index, sessionList.length]);

  const handleRestartSession = useCallback(() => {
    loadNewWords();
    setRestartCount((prev) => prev + 1);
  }, [loadNewWords]);

  const handleRepeatLesson = useCallback(() => {
    if (
      window.confirm(
        "Вы уверены? Это действие удалит прогресс для этого урока ТОЛЬКО в режиме ФЛЕШ-КАРТЫ."
      )
    ) {
      dispatch(clearLessonProgress({ lessonId, mode: "flashcards" }));
      handleRestartSession();
    }
  }, [dispatch, lessonId, handleRestartSession]);

  // --- ЛОГИКА НАВИГАЦИИ И ДЕЙСТВИЙ ---

  const next = useCallback(() => {
    setFlipped(false);
    // Просто переходим к следующему индексу. useEffect выше позаботится о цикле.
    setIndex((i) => i + 1);
  }, []);

  const prev = useCallback(() => {
    setFlipped(false);
    setIndex((i) => (i - 1 >= 0 ? i - 1 : 0));
  }, []);

  const handleKnow = () => {
    if (current) {
      // Отмечаем как выученное в режиме "flashcards"
      dispatch(markLearned({ word: current, mode: "flashcards" }));

      // 💡 После пометки, мы должны перейти к следующему слову,
      // а `useEffect` (который следит за `finalRemainingList`) обновит
      // `sessionList` в следующем цикле рендера, удалив помеченное слово.
      next();
    }
  };

  const handleFlip = () => {
    setFlipped((f) => !f);
  };

  const handleGoBack = () => {
    navigate(`/lesson/${lessonId}`);
  };

  // --- ЭКРАНЫ ЗАВЕРШЕНИЯ / ЗАГРУЗКИ ---

  // Экран полного завершения урока (срабатывает, если finalRemainingList.length === 0)
  if (finalRemainingList.length === 0 && list && list.length > 0)
    return (
      <LessonComplete
        lessonId={lessonId}
        onGoBack={handleGoBack}
        onRepeat={handleRepeatLesson}
      />
    );

  // Экран загрузки (когда current не определен, но еще не сработал LessonComplete)
  if (!current || sessionList.length === 0) return null;

  // --- ОСНОВНОЙ РЕНДЕРИНГ ФЛЕШ-КАРТЫ ---
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* 💡 КОНТЕЙНЕР ДЛЯ ПРОГРЕССА */}
      <div className="w-full max-w-sm mb-6">
        {/* ИНДИКАТОР ПРОГРЕССА */}
        <div className="w-full text-center mt-8">
          {" "}
          <div className="text-sm font-medium text-gray-600 mb-2 dark:text-gray-400">
            {/* 💡 Показываем прогресс внутри текущего цикла */}
            Слово: {index + 1} из {sessionList.length}
            <span className="block text-xs text-gray-400 mt-1 dark:text-gray-500">
              Осталось всего невыученных: {totalRemaining}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((index + 1) / sessionList.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      {/* ---------------------------------------------------- */}

      {/* ФЛЕШ-КАРТА */}
      <div
        style={flipCardStyles}
        onClick={handleFlip}
        className="cursor-pointer mb-8"
      >
        <div
          style={{
            ...flipCardInnerStyles,
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ЛИЦЕВАЯ СТОРОНА (ИЗУЧАЕМЫЙ ЯЗЫК) */}
          <div
            style={flipCardFaceStyles}
            className="bg-sky-500 text-white shadow-xl flex-col"
          >
            <span className="text-4xl font-bold mb-4">
              {current.de}
            </span>
          </div>

          {/* ОБРАТНАЯ СТОРОНА (ПЕРЕВОД) */}
          <div
            style={{ ...flipCardFaceStyles, transform: "rotateY(180deg)" }}
            className="bg-white text-gray-800 shadow-xl border-2 border-sky-500 dark:bg-gray-700 dark:text-gray-50 dark:border-sky-600"
          >
            <span className="text-4xl font-bold">{current.ru}</span>
          </div>
        </div>
      </div>

      {/* КНОПКИ УПРАВЛЕНИЯ */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm">
        {/* ПЕРЕВЕРНУТЬ */}
        <button
          onClick={handleFlip}
          className="flex items-center justify-center w-full sm:w-auto px-4 py-3 bg-sky-200 text-sky-800 rounded-xl font-semibold hover:bg-sky-300 transition duration-150 dark:bg-sky-800 dark:text-sky-300 dark:hover:bg-sky-700"
        >
          <HiOutlineRefresh className="w-5 h-5 mr-2" />
          {flipped ? "Скрыть перевод" : "Перевернуть"}
        </button>

        {/* НАЗАД / ДАЛЕЕ */}
        <div className="flex justify-between w-full sm:w-auto sm:space-x-3 mt-3 sm:mt-0">
          <button
            onClick={prev}
            disabled={index === 0}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-white rounded-xl shadow-md text-gray-600 font-semibold hover:bg-gray-100 transition duration-150 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:shadow-none"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span className="ml-2 hidden sm:inline">Назад</span>
          </button>
          <button
            onClick={next}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-white rounded-xl shadow-md text-gray-600 font-semibold hover:bg-gray-100 transition duration-150 ml-3 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:shadow-none"
          >
            <span className="mr-2 hidden sm:inline">
              {/* Если индекс на последнем слове, показываем "Повторить цикл", иначе "Далее" */}
              {index === sessionList.length - 1 ? "Сначала" : "Далее"}
            </span>
            <HiArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Я ЗНАЮ ЭТО СЛОВО (МАРКИРОВКА И СКИП) */}
        <button
          onClick={handleKnow}
          className="w-full mt-3 sm:mt-0 px-4 py-3 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition duration-150 dark:bg-green-700 dark:hover:bg-green-800"
        >
          <div className="flex items-center justify-center">
            <HiCheck className="w-6 h-6 mr-2" />Я знаю это слово! (Удалить из
            списка)
          </div>
        </button>
      </div>
    </div>
  );
}
