import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  markLearned,
  clearLessonProgress,
} from "../../store/words/progressSlice";
import {
  HiLightBulb,
  HiCheckCircle,
  HiOutlineXCircle,
  HiBookOpen,
  HiRefresh,
} from "react-icons/hi";
import LessonComplete from "../../components/LessonComplete";
import AudioPlayer from "../../components/AudioPlayer";
import ProgressBar from "../../components/UI/ProgressBar"; // 💡 ДОБАВЛЕН ИМПОРТ ProgressBar

// --- Вспомогательная функция для перемешивания массива ---
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const TARGET_MODE = "sentence_puzzle";

/**
 * Режим тренировки: Сборка предложения из перемешанных слов.
 */
export default function SentencePuzzle() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. ИЗВЛЕКАЕМ ВСЕ LEARNED-СПИСКИ ДЛЯ УНИФИЦИРОВАННОЙ ФИЛЬТРАЦИИ
  const { list } = useSelector((state) => state.words.navigation);
  const {
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  } = useSelector((state) => state.words.progress);

  const getRemainingWordsWithExamples = useCallback(() => {
    if (!list || list.length === 0) return [];

    const allLearnedWords = [
      ...learnedFlashcards,
      ...learnedMatching,
      ...learnedQuiz,
      ...learnedWriting,
      ...(learnedSentencePuzzle || []),
    ];
    const learnedSet = new Set();
    allLearnedWords.forEach((w) => learnedSet.add(`${w.de}-${w.lessonId}`));

    return list.filter(
      (w) =>
        w.lessonId === lessonId &&
        w.exde &&
        w.exru &&
        !learnedSet.has(`${w.de}-${w.lessonId}`)
    );
  }, [
    list,
    lessonId,
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  ]);

  const wordsWithExamples = useMemo(
    () => getRemainingWordsWithExamples(),
    [getRemainingWordsWithExamples]
  );

  const totalRemaining = wordsWithExamples.length;

  const totalWordsInLesson = useMemo(
    () =>
      list?.filter((w) => w.lessonId === lessonId && w.exde && w.exru).length ||
      0,
    [list, lessonId]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentWordData = wordsWithExamples[currentIndex];

  const { correctTiles, correctSentenceForComparison } = useMemo(() => {
    if (!currentWordData)
      return { correctTiles: [], correctSentenceForComparison: [] };

    const tiles = currentWordData.exde.split(/\s+/).filter((w) => w.length > 0);

    const comparisonWords = tiles.map((word) =>
      word.replace(/[.,/#!$%^&*;:{}=-_`~()]/g, "").toLowerCase()
    );

    return {
      correctTiles: tiles,
      correctSentenceForComparison: comparisonWords,
    };
  }, [currentWordData]);

  const [shuffledTiles, setShuffledTiles] = useState([]);

  useEffect(() => {
    if (wordsWithExamples.length === 0) return;

    if (currentIndex >= wordsWithExamples.length) {
      setCurrentIndex(0);
      return;
    }

    if (currentWordData) {
      const tiles = shuffleArray(correctTiles);
      setShuffledTiles(tiles);
      setSelectedWords([]);
      setIsCorrect(null);
      setShowHint(false);
      setShowFeedback(false);
    }
  }, [currentWordData, correctTiles, wordsWithExamples.length, currentIndex]);

  // --- Обработчики действий (без изменений) ---

  const handleTileClick = (word, tileIndex) => {
    if (isCorrect !== null) return;
    setSelectedWords((prev) => [...prev, word]);
    setShuffledTiles((prev) => prev.filter((_, index) => index !== tileIndex));
  };

  const handleSelectedWordClick = (word, selectedIndex) => {
    if (isCorrect !== null) return;
    setShuffledTiles((prev) => shuffleArray([...prev, word]));
    setSelectedWords((prev) =>
      prev.filter((_, index) => index !== selectedIndex)
    );
  };

  const handleCheck = () => {
    if (selectedWords.length !== correctTiles.length) return;

    const userSentenceForComparison = selectedWords
      .map((word) => word.replace(/[.,/#!$%^&*;:{}=-_`~()]/g, "").toLowerCase())
      .join(" ");

    const correctSentenceString = correctSentenceForComparison.join(" ");
    const correct = userSentenceForComparison === correctSentenceString;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      dispatch(
        markLearned({
          word: { ...currentWordData, mode: TARGET_MODE },
          mode: TARGET_MODE,
        })
      );
    }
  };

  const handleNext = () => {
    const isLastCardInCurrentView =
      currentIndex === wordsWithExamples.length - 1;

    setIsCorrect(null);
    setShowFeedback(false);

    if (!isLastCardInCurrentView) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setShuffledTiles(shuffleArray(correctTiles));
    setSelectedWords([]);
    setIsCorrect(null);
    setShowHint(false);
    setShowFeedback(false);
  };

  const handleGoBack = () => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleRepeatLesson = useCallback(() => {
    if (
      window.confirm(
        "Вы уверены? Это действие удалит прогресс для этого урока ТОЛЬКО в режиме СБОРКА ПРЕДЛОЖЕНИЙ."
      )
    ) {
      dispatch(clearLessonProgress({ lessonId, mode: TARGET_MODE }));
      setCurrentIndex(0);
      setIsCorrect(null);
      setShowFeedback(false);
    }
  }, [dispatch, lessonId]);

  // --- Условный рендеринг (без изменений) ---
  if (wordsWithExamples.length === 0 && totalWordsInLesson > 0) {
    return (
      <LessonComplete
        lessonId={lessonId}
        onGoBack={handleGoBack}
        onRepeat={handleRepeatLesson}
      />
    );
  }

  if (wordsWithExamples.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 bg-gray-50 min-h-screen dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-50 mb-3">
          Нет данных для тренировки предложений
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          В этом уроке нет примеров предложений, или вы выучили все слова в этом
          режиме.
        </p>
        <button
          onClick={() => navigate(`/lesson/${lessonId}`)}
          className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition"
        >
          ← К уроку
        </button>
      </div>
    );
  }

  // --- UI Рендеринг (ОПТИМИЗИРОВАННЫЙ) ---
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* 1. БОМБОВЫЙ PROGRESS BAR */}
      <ProgressBar
        current={currentIndex}
        totalInSession={wordsWithExamples.length}
        totalRemaining={totalRemaining}
        roundInfo={`(Предложения)`}
      />

      {/* 2. НАЗВАНИЕ РЕЖИМА И СЛОВО-КЛЮЧ (КОМПАКТНО) */}
      <div className="w-full max-w-xl mb-4 flex justify-between items-center px-2 sm:px-0">
        <div className="flex items-center text-lg font-extrabold text-gray-800 dark:text-gray-50">
          <HiBookOpen className="w-5 h-5 mr-1 text-pink-600 dark:text-pink-400" />
          <span>Сборка предложений</span>
        </div>

        {/* Ключевое слово для справки (рядом с заголовком) */}
        <div className="flex flex-col items-end text-right">
          <div className="font-bold text-lg text-gray-800 flex items-center dark:text-gray-50">
            {currentWordData?.de}
            {currentWordData?.de && (
              <AudioPlayer textToSpeak={currentWordData.de} lang="de-DE" />
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {currentWordData?.ru}
          </p>
        </div>
      </div>

      {/* 3. ОСНОВНАЯ КАРТОЧКА ЗАДАНИЯ */}
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-2xl border-t-4 border-pink-500 dark:bg-gray-800 dark:border-pink-600 dark:shadow-xl">
        {/* А. БЛОК ПОСТОЯННОЙ ПОДСКАЗКИ (РУССКИЙ ПЕРЕВОД) */}
        <div className="p-3 mb-4 rounded-lg bg-pink-50 dark:bg-pink-900/10 border-l-4 border-pink-300 dark:border-pink-700">
          <p className="text-sm font-medium text-pink-700 dark:text-pink-400 mb-1">
            Переведите это предложение:
          </p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-50 italic">
            {currentWordData.exru}
          </p>
        </div>

        {/* Б. КОНТЕЙНЕР ДЛЯ СБОРА ПРЕДЛОЖЕНИЯ */}
        <div
          className={`min-h-24 p-4 border-2 rounded-xl mb-4 
            ${
              isCorrect === true
                ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                : isCorrect === false
                ? "border-red-500 bg-red-50 shake-animation dark:bg-red-900/30" // 💡 Добавил анимацию
                : "border-gray-300 border-dashed dark:border-gray-600"
            }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Ваше немецкое предложение:
          </p>

          {selectedWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectedWordClick(word, index)}
                  disabled={isCorrect !== null}
                  className={`px-3 py-1 rounded-xl font-semibold transition shadow-md 
                    ${
                      isCorrect === true
                        ? "bg-green-500 text-white"
                        : "bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
                    }`}
                >
                  {word}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic">
              Начните собирать предложение...
            </p>
          )}
        </div>

        {/* В. ПЛИТКИ ДЛЯ ВЫБОРА */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Слова:
          </p>
          <div className="flex flex-wrap gap-2">
            {shuffledTiles.map((word, index) => (
              <button
                key={index}
                onClick={() => handleTileClick(word, index)}
                disabled={isCorrect !== null}
                className="px-3 py-1 rounded-xl border border-gray-300 bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600 shadow-sm disabled:opacity-50"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Г. ФИДБЕК И КНОПКИ ДЕЙСТВИЙ */}
        {showFeedback && (
          <div
            className={`p-4 rounded-lg mb-4 ${
              isCorrect
                ? "bg-green-100 dark:bg-green-900/50"
                : "bg-red-100 dark:bg-red-900/50"
            }`}
          >
            <div className="flex items-center">
              {isCorrect ? (
                <HiCheckCircle className="w-6 h-6 text-green-600 mr-2 dark:text-green-400" />
              ) : (
                <HiOutlineXCircle className="w-6 h-6 text-red-600 mr-2 dark:text-red-400" />
              )}
              <span
                className={`font-bold ${
                  isCorrect
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                }`}
              >
                {isCorrect ? "Верно! Отлично." : "Неверно. Попробуйте еще раз."}
              </span>
            </div>
            {!isCorrect && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Правильно:{" "}
                <span className="font-semibold italic">
                  {correctTiles.join(" ")}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Кнопки управления (Проверить / Далее) */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="flex items-center px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition dark:text-gray-400 dark:hover:bg-gray-700"
            disabled={isCorrect !== null}
            title="Сбросить выбранные слова"
          >
            <HiRefresh className="w-5 h-5" />
            <span className="ml-1 hidden sm:inline">Сбросить</span>
          </button>

          {isCorrect === null ? (
            <button
              onClick={handleCheck}
              disabled={
                selectedWords.length !== correctTiles.length || showFeedback
              }
              className="px-6 py-3 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600 transition disabled:bg-gray-400 dark:bg-pink-600 dark:hover:bg-pink-700 dark:disabled:bg-gray-600"
            >
              Проверить
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`px-6 py-3 font-bold rounded-xl shadow-lg transition 
                ${
                  isCorrect
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-sky-500 hover:bg-sky-600"
                } text-white`}
            >
              {wordsWithExamples.length <= 1 ? "Завершить урок" : "Далее"}
            </button>
          )}
        </div>
      </div>

      {/* Добавляем стили для анимации (обязательно для WOW-эффекта) */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .shake-animation {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
