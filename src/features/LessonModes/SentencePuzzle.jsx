import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  markLearned,
} from "../../store/words/progressSlice";
import {
  HiArrowLeft,
  HiLightBulb,
  HiCheckCircle,
  HiOutlineXCircle,
  HiBookOpen,
  HiRefresh,
} from "react-icons/hi";
import AudioPlayer from "../../components/AudioPlayer";
// import { lessons } from "../../data"; // Предположительно, не требуется

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

  // 💡 Получаем ВСЕ массивы прогресса
  const {
    list,
    // Остальные массивы импортируем, но не используем в фильтрации, если нужен независимый прогресс
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle, // <-- Используем только этот массив для фильтрации
  } = useSelector((state) => state.words);

  // --- ИЗОЛИРОВАННАЯ логика фильтрации ---

  const getRemainingWordsWithExamples = useCallback(() => {
    if (!list || list.length === 0) return [];

    // 🛑 ИСПРАВЛЕНИЕ: Используем ТОЛЬКО learnedSentencePuzzle
    const learnedSet = new Set();
    learnedSentencePuzzle.forEach((w) =>
      learnedSet.add(`${w.de}-${w.lessonId}`)
    ); // <-- Только sentence_puzzle

    // Фильтруем: оставляем слова, которые не выучены и имеют примеры
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
    learnedSentencePuzzle, // <-- В зависимости оставляем только sentence_puzzle
  ]);

  // ИСПОЛЬЗУЕМ: Отфильтрованный пул слов
  const wordsWithExamples = useMemo(
    () => getRemainingWordsWithExamples(),
    [getRemainingWordsWithExamples]
  );

  // -----------------------------------------------------

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentWordData = wordsWithExamples[currentIndex];

  // Создаем два массива для плиток и сравнения
  const { correctTiles, correctSentenceForComparison } = useMemo(() => {
    if (!currentWordData)
      return { correctTiles: [], correctSentenceForComparison: [] };

    // 1. Плитки для отображения
    const tiles = currentWordData.exde.split(/\s+/).filter((w) => w.length > 0);

    // 2. Верное предложение для сравнения (очищенное)
    const comparisonWords = tiles.map((word) =>
      word.replace(/[.,/#!$%^&*;:{}=-_`~()]/g, "").toLowerCase()
    );

    return {
      correctTiles: tiles,
      correctSentenceForComparison: comparisonWords,
    };
  }, [currentWordData]);

  const [shuffledTiles, setShuffledTiles] = useState([]);

  // 💡 ИСПРАВЛЕННЫЙ ЭФФЕКТ: Инициализация и сброс индекса при изменении пула
  useEffect(() => {
    // 1. Если пул слов опустел, выходим (чтобы показать "Нет данных")
    if (wordsWithExamples.length === 0) return;

    // 2. Если текущий индекс выходит за пределы нового массива, сбрасываем его на 0.
    if (currentIndex >= wordsWithExamples.length) {
      setCurrentIndex(0);
      return;
    }

    // 3. Инициализация (только если currentIndex указывает на корректное слово)
    if (currentWordData) {
      const tiles = shuffleArray(correctTiles);
      setShuffledTiles(tiles);
      setSelectedWords([]);
      setIsCorrect(null);
      setShowHint(false);
      setShowFeedback(false);
    }
  }, [currentWordData, correctTiles, wordsWithExamples.length, currentIndex]); // currentIndex добавлен в зависимости

  // --- Обработчики действий ---

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
      // 💡 Отмечаем как выученное ТОЛЬКО в режиме sentence_puzzle
      dispatch(
        markLearned({
          word: { ...currentWordData, mode: TARGET_MODE },
          mode: TARGET_MODE,
        })
      );
    }
  };

  // 💡 ИСПРАВЛЕННАЯ handleNext для более чистого поведения
  const handleNext = () => {
    const isLastCardInCurrentView =
      currentIndex === wordsWithExamples.length - 1;

    // Сброс фидбэка
    setIsCorrect(null);
    setShowFeedback(false);

    if (!isLastCardInCurrentView) {
      // Если есть следующее слово в текущем массиве, переходим к нему
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Иначе, это было последнее слово, или пул уже пуст (длина 0).

      // Даем React и Redux микро-цикл на обновление.
      setTimeout(() => {
        // Если после обновления пул все еще пуст, завершаем урок.
        if (wordsWithExamples.length <= 1) {
          alert("Урок завершен!");
          navigate(`/lesson/${lessonId}`);
        } else {
          // Если Redux удалил слово, и остались другие, useEffect сам сбросит index на 0.
          setCurrentIndex((prev) => prev + 1);
        }
      }, 50);
    }
  };

  const handleReset = () => {
    setShuffledTiles(shuffleArray(correctTiles));
    setSelectedWords([]);
    setIsCorrect(null);
    setShowHint(false);
    setShowFeedback(false);
  };

  // --- Условный рендеринг ---

  if (wordsWithExamples.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 bg-gray-50 min-h-screen dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-50 mb-3">
          Нет данных для тренировки предложений
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          В этом уроке нет примеров предложений (exde/exru), или вы выучили все
          слова в этом режиме.
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

  // --- UI Рендеринг ---
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors duration-300">
      {/* Шапка и навигация */}
      <div className="w-full max-w-xl mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(`/lesson/${lessonId}`)}
          className="flex items-center text-gray-700 hover:text-gray-800 transition font-semibold dark:text-gray-400 dark:hover:text-gray-300"
        >
          <HiArrowLeft className="w-6 h-6 mr-1" />
          <span className="hidden sm:inline">К уроку</span>
        </button>
        <div className="flex items-center text-xl font-extrabold text-gray-800 dark:text-gray-50">
          <HiBookOpen className="w-6 h-6 mr-2 text-pink-600 dark:text-pink-400" />
          <span>Предложения: {lessonId.toUpperCase()}</span>
        </div>
        <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
          {currentIndex + 1} / {wordsWithExamples.length}
        </div>
      </div>

      {/* Основная карточка */}
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-2xl border-t-4 border-pink-500 dark:bg-gray-800 dark:border-pink-600 dark:shadow-xl">
        {/* Слово-ключ (немецкое) */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Слово-ключ:
            </p>
            <div className="font-bold text-xl text-gray-800 flex items-center dark:text-gray-50">
              {currentWordData.de}
              <AudioPlayer textToSpeak={currentWordData.de} lang="de-DE" />
            </div>
            <div className="text-gray-600 text-md dark:text-gray-300">
              {currentWordData.ru}
            </div>
          </div>

          {/* Кнопка подсказки */}
          <button
            onClick={() => setShowHint(true)}
            className="flex items-center p-2 rounded-lg text-pink-700 hover:bg-pink-100 dark:text-pink-400 dark:hover:bg-pink-900 transition"
            disabled={showHint}
          >
            <HiLightBulb className="w-5 h-5 mr-1" />
            {showHint ? "Подсказка" : "Перевод"}
          </button>
        </div>

        {/* Перевод (Подсказка) */}
        {showHint && (
          <div className="p-3 mb-4 bg-gray-100 rounded-lg dark:bg-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Русский перевод:{" "}
              <span className="italic">{currentWordData.exru}</span>
            </p>
          </div>
        )}

        {/* Контейнер для сбора предложения */}
        <div
          className={`min-h-24 p-4 border-2 rounded-lg mb-4 
            ${
              isCorrect === true
                ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                : isCorrect === false
                ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                : "border-gray-300 border-dashed dark:border-gray-600"
            }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Соберите немецкое предложение:
          </p>

          {selectedWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectedWordClick(word, index)}
                  disabled={isCorrect !== null}
                  className={`px-3 py-1 rounded-lg font-semibold transition shadow-sm
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

        {/* Плитки для выбора */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Выберите слова в правильном порядке:
          </p>
          <div className="flex flex-wrap gap-2">
            {shuffledTiles.map((word, index) => (
              <button
                key={index}
                onClick={() => handleTileClick(word, index)}
                disabled={isCorrect !== null}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600 shadow-sm"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Фидбек и кнопки действий */}
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
                {isCorrect
                  ? "Верно!"
                  : "Неверно. Попробуйте еще раз или посмотрите правильный ответ."}
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
              {/* Этот текст будет обновлен после вызова handleNext */}
              {wordsWithExamples.length <= 1 ? "Завершить урок" : "Далее"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
