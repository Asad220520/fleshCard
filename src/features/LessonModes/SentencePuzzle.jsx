import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Предполагаемый путь к вашему файлу данных (data/index.js)
import { lessons } from "../../data";
import { HiCheck, HiRefresh, HiArrowLeft, HiArrowRight } from "react-icons/hi";
import StudyCompletionModal from "../../components/StudyCompletionModal";

// 🆕 КОНСТАНТА: Максимальное количество предложений в одной сессии (батче)
const MAX_SESSION_SIZE = 4;
// 🔑 КЛЮЧ: Для сохранения прогресса в localStorage
const LOCAL_STORAGE_KEY = (lessonId) => `puzzle_completed_indices_${lessonId}`;

// --- Вспомогательная функция для перемешивания (Fisher-Yates) ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[i], newArray[j]];
  }
  return newArray;
};

// --- КОМПОНЕНТ ---
export default function SentencePuzzle() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  // 🔑 Получение всех предложений
  const allLessonSentences = lessons[lessonId] || [];
  const totalSentences = allLessonSentences.length;

  // --- Состояния ---
  const [completedIndices, setCompletedIndices] = useState(new Set());
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [assembledWords, setAssembledWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [status, setStatus] = useState(null); // null | 'correct' | 'incorrect' | 'skipped'
  const [isPuzzleComplete, setIsPuzzleComplete] = useState(false);
  const [sessionList, setSessionList] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 🔑 КЛЮЧ: Для принудительной перерисовки блока перемешанных слов
  const [shuffleKey, setShuffleKey] = useState(0);

  // --- Вычисляемые значения ---
  const currentItem = sessionList[currentSentenceIndex];

  // 1. Определяем, какие предложения еще не пройдены (на основе completedIndices)
  const availableSentences = useMemo(() => {
    return allLessonSentences
      .map((sentence, index) => ({ ...sentence, originalIndex: index }))
      .filter((sentence) => !completedIndices.has(sentence.originalIndex));
  }, [allLessonSentences, completedIndices]);

  const totalRemaining = availableSentences.length;

  const nextBatchSize = Math.min(
    MAX_SESSION_SIZE,
    totalRemaining - sessionList.length
  );

  // 2. Извлечение и очистка целевых слов (для сравнения)
  const targetWords = useMemo(() => {
    if (!currentItem || !currentItem.exde) return [];
    return currentItem.exde
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);
  }, [currentItem]);

  // 🔑 ФУНКЦИЯ: Сохранение прогресса
  const saveProgress = (newCompletedIndices) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY(lessonId),
        JSON.stringify(Array.from(newCompletedIndices))
      );
    } catch (e) {
      console.error("Failed to save progress to localStorage:", e);
    }
  };

  // 🔑 ФУНКЦИЯ: Пометка текущего предложения как завершенного
  const markCurrentCompleted = () => {
    if (currentItem && currentItem.originalIndex !== undefined) {
      setCompletedIndices((prev) => {
        const newSet = new Set(prev).add(currentItem.originalIndex);
        saveProgress(newSet); // Сохраняем в localStorage
        return newSet;
      });
    }
  };

  // 3. Функция для инициализации (перемешивания) слов
  const initializeSentence = () => {
    if (currentItem) {
      setAssembledWords([]);
      setStatus(null); // Сброс статуса

      const distractors = currentItem?.distractors || [];
      const sentenceWords = currentItem.exde
        .split(/\s+/)
        .map((w) => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));
      const allWordsForShuffle = [...sentenceWords, ...distractors].filter(
        (w) => w.length > 0
      );

      // Гарантируем перемешивание (Fisher-Yates)
      setShuffledWords(shuffleArray(allWordsForShuffle));

      // 🔑 ГЕНЕРИРУЕМ НОВЫЙ КЛЮЧ, чтобы гарантировать, что React перерисует список слов
      setShuffleKey(Math.random());
    }
  };

  // 4. Инициализация (перезапуск) при смене предложения
  useEffect(() => {
    if (currentItem) {
      initializeSentence();
    }
    // initializeSentence удалена из списка зависимостей (как и в оригинале)
    // currentItem добавлен, чтобы ловить его изменение
  }, [currentSentenceIndex, currentItem]);

  // 🔑 5. ЛОГИКА ЗАГРУЗКИ НОВОГО БАТЧА
  const loadNextBatch = () => {
    const currentAvailableSentences = allLessonSentences
      .map((sentence, index) => ({ ...sentence, originalIndex: index }))
      .filter((sentence) => !completedIndices.has(sentence.originalIndex));

    if (currentAvailableSentences.length === 0) {
      setSessionList([]);
      setIsPuzzleComplete(true);
      return;
    }

    // Берем следующий батч из доступных предложений и перемешиваем его
    const nextBatch = shuffleArray(currentAvailableSentences).slice(
      0,
      MAX_SESSION_SIZE
    );

    // Сброс состояния для новой сессии
    setCurrentSentenceIndex(0);
    setIsPuzzleComplete(false);
    setStatus(null);
    setAssembledWords([]);
    setShuffledWords([]);

    setSessionList(nextBatch);
  };

  // 🔑 6. ГЛАВНЫЙ БЛОК ЗАГРУЗКИ (localStorage И первый батч)
  useEffect(() => {
    let initialCompletedIndices = new Set();

    // 1. Загрузка прогресса из localStorage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY(lessonId));
      if (saved) {
        initialCompletedIndices = new Set(JSON.parse(saved));
        setCompletedIndices(initialCompletedIndices);
      }
    } catch (e) {
      console.error("Failed to load progress from localStorage:", e);
    }

    // 2. Инициализация первого батча на основе ЗАГРУЖЕННОГО прогресса
    const initialAvailableSentences = allLessonSentences
      .map((sentence, index) => ({ ...sentence, originalIndex: index }))
      .filter(
        (sentence) => !initialCompletedIndices.has(sentence.originalIndex)
      );

    if (initialAvailableSentences.length > 0) {
      // Берем батч из доступных предложений и перемешиваем его
      const initialBatch = shuffleArray(initialAvailableSentences).slice(
        0,
        MAX_SESSION_SIZE
      );
      setSessionList(initialBatch);
    } else if (totalSentences > 0) {
      // Если все завершены, показываем финальный экран
      setIsPuzzleComplete(true);
    }

    setIsDataLoaded(true); // Устанавливаем флаг, что данные загружены

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, totalSentences]);

  // --- Обработчики действий ---

  const handleWordClick = (word, index) => {
    if (status !== null) return;
    setAssembledWords([...assembledWords, word]);
    setShuffledWords(shuffledWords.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (word, index) => {
    if (status !== null) return;

    const wordToAddBack = assembledWords[index];
    setAssembledWords(assembledWords.filter((_, i) => i !== index));

    // Важно: слова должны быть снова перемешаны
    const newShuffled = shuffleArray([...shuffledWords, wordToAddBack]);
    setShuffledWords(newShuffled);
    setShuffleKey(Math.random()); // Принудительный сброс для гарантии правильной перерисовки
  };

  const checkAnswer = () => {
    const assembledString = assembledWords
      .map((w) => w.toLowerCase())
      .join(" ");
    const targetString = targetWords.join(" ");

    if (assembledString === targetString) {
      setStatus("correct");
      markCurrentCompleted();
    } else {
      setStatus("incorrect");
    }
  };

  const nextSentence = () => {
    if (currentSentenceIndex < sessionList.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1);
    } else {
      setIsPuzzleComplete(true);
    }
  };

  const skipSentence = () => {
    setStatus("skipped");
    markCurrentCompleted();
  };

  const handleContinue = () => {
    setIsPuzzleComplete(false);
    loadNextBatch();
  };

  const handleGoBack = () => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleRestartPuzzleMode = () => {
    // 🔑 ПЕРЕЗАПУСК ВСЕГО УРОКА
    setCompletedIndices(new Set());
    saveProgress(new Set());
    setIsPuzzleComplete(false);

    // Перезагрузка для гарантии мгновенного старта с первого батча
    // Используем navigate с перезагрузкой состояния для чистого сброса
    navigate(0);
  };

  const handleRetry = () => {
    setIsPuzzleComplete(false);
    initializeSentence();
  };

  // --- УСЛОВНЫЙ РЕНДЕРИНГ: Финальный экран ---

  const showAnswer = status === "incorrect" || status === "skipped";

  // 🔑 Заглушка, пока данные из localStorage не загружены
  if (!isDataLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-xl dark:text-gray-200">Загрузка данных...</p>
      </div>
    );
  }

  // Если все предложения урока завершены
  if (totalRemaining === 0 && isPuzzleComplete) {
    return (
      <div className="p-4 sm:p-12 text-green-600 text-center text-xl font-semibold bg-white rounded-xl shadow-lg m-4 sm:m-6 dark:bg-gray-800 dark:text-green-400 dark:shadow-2xl min-h-screen flex items-center justify-center flex-col">
        <span role="img" aria-label="party popper" className="text-3xl mr-2">
          🎉
        </span>{" "}
        <h2 className="text-xl sm:text-2xl font-bold mt-2">
          Отлично! Все **{totalSentences}** предложений урока{" "}
          {lessonId.toUpperCase()} завершены.
        </h2>
        <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-sm">
          <button
            onClick={handleGoBack}
            className="w-full bg-sky-500 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:bg-sky-600 transition-colors text-lg"
          >
            Вернуться к уроку
          </button>
          <button
            onClick={handleRestartPuzzleMode}
            className="w-full bg-gray-500 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:bg-gray-600 transition-colors text-lg"
          >
            Начать заново
          </button>
        </div>
      </div>
    );
  }

  // Если батч завершен, показываем модалку (Переход к следующему батчу)
  if (isPuzzleComplete) {
    return (
      <StudyCompletionModal
        completedItemsCount={sessionList.length}
        onRestart={handleContinue}
        onClose={handleGoBack}
        modeName={`Сборка предложений (Батч ${sessionList.length})`}
        remainingCount={nextBatchSize}
        isFullLessonComplete={totalRemaining === 0}
        onMarkAll={handleContinue}
      />
    );
  }

  // Если нет текущего элемента (только при первой загрузке или пустом уроке)
  if (!currentItem) {
    return null;
  }

  // --- ОСНОВНОЙ РЕНДЕРИНГ ---
  return (
    <div className="p-4 flex flex-col items-center bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors duration-300">
      {/* Кнопка Назад */}
      <div className="w-full max-w-xl mb-4 self-center">
        <button
          onClick={handleGoBack}
          className="flex items-center text-sky-700 hover:text-sky-800 transition font-semibold text-sm sm:text-base dark:text-sky-400 dark:hover:text-sky-300"
        >
          <HiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-1" />
          <span className="hidden sm:inline">
            К уроку {lessonId.toUpperCase()}
          </span>
          <span className="sm:hidden">Назад</span>
        </button>
      </div>

      {/* 🆕 Прогресс Батча */}
      <div className="w-full max-w-xl mb-4 text-center">
        <div className="text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">
          Батч: {currentSentenceIndex + 1} из {sessionList.length}
          <span className="block text-xs text-gray-400 mt-1 dark:text-gray-500">
            Осталось всего: {totalRemaining}
          </span>
        </div>
        {/* Индикатор прогресса */}
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-pink-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((currentSentenceIndex + 1) / sessionList.length) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* 1. ЗАГОЛОВОК И ПРЕДЛОЖЕНИЕ */}
      <div className="w-full max-w-xl text-center mb-4">
        <h1 className="text-xl font-bold text-pink-600 dark:text-pink-400 mb-1">
          Соберите предложение
        </h1>
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center px-2">
          **{currentItem.exru}**
        </p>
      </div>

      {/* 2. ПОДСКАЗКА: Ключевое слово (меньше отступ) */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
        (Ключевое слово: {currentItem.de} / {currentItem.ru})
      </p>

      {/* 3. Блок для собранного предложения */}
      <div
        className={`w-full max-w-xl p-3 min-h-[70px] rounded-xl mb-4 shadow-inner 
                      ${
                        status === "correct"
                          ? "bg-green-100 dark:bg-green-900/50"
                          : showAnswer
                          ? "bg-red-100 dark:bg-red-900/50"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
      >
        <div className="flex flex-wrap gap-2">
          {assembledWords.map((word, index) => (
            <button
              key={index}
              onClick={() => handleRemoveWord(word, index)}
              className="bg-white text-gray-800 py-1 px-2 rounded-md shadow-md text-base sm:text-lg 
                         hover:bg-gray-100 transition-colors dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
              disabled={status !== null}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Блок с перемешанными словами (включая distractors) */}
      <div
        key={shuffleKey} // 🔑 ГАРАНТИЯ ПЕРЕМЕШИВАНИЯ: Принудительная перерисовка при смене ключа
        className="w-full max-w-xl p-3 rounded-xl mb-6 bg-white shadow-lg dark:bg-gray-800"
      >
        <div className="flex flex-wrap justify-center gap-2">
          {shuffledWords.map((word, index) => (
            <button
              key={word + index}
              onClick={() => handleWordClick(word, index)}
              className="bg-sky-500 text-white font-medium py-2 px-3 rounded-full shadow-md 
                         hover:bg-sky-600 transition-transform transform active:scale-95 text-base
                         dark:bg-pink-700 dark:hover:bg-pink-600"
              disabled={status !== null}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Панель управления (Оптимизация для мобильных: flex-wrap и меньшие кнопки) */}
      <div className="w-full max-w-xl flex flex-wrap justify-center gap-3">
        {status === null ? (
          <>
            {/* 1. Сброс (Меньший размер) */}
            <button
              onClick={handleRetry}
              className="flex items-center bg-gray-400 text-white font-bold py-2 px-3 rounded-full shadow-lg hover:bg-gray-500 transition-colors text-sm"
            >
              <HiRefresh className="w-4 h-4 mr-1" /> Сброс
            </button>

            {/* 2. Проверить (Основная кнопка) */}
            <button
              onClick={checkAnswer}
              className="flex items-center bg-green-500 text-white font-bold py-2 px-5 rounded-full shadow-lg hover:bg-green-600 transition-colors text-base"
              disabled={assembledWords.length === 0}
            >
              <HiCheck className="w-5 h-5 mr-1" /> Проверить
            </button>

            {/* 3. ПРОПУСТИТЬ (Меньший размер) */}
            <button
              onClick={skipSentence}
              className="flex items-center bg-amber-500 text-white font-bold py-2 px-3 rounded-full shadow-lg hover:bg-amber-600 transition-colors text-sm"
            >
              Пропустить <HiArrowRight className="w-4 h-4 ml-1" />
            </button>
          </>
        ) : status === "correct" ? (
          // Ответ верен
          <button
            onClick={nextSentence}
            className="w-full max-w-sm flex items-center justify-center bg-sky-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-sky-600 transition-colors text-lg"
          >
            Отлично! Далее <HiArrowRight className="w-6 h-6 ml-2" />
          </button>
        ) : (
          // Ответ неверен или пропущен (status === 'incorrect' || status === 'skipped')
          <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm">
            <button
              onClick={handleRetry}
              className="flex-grow flex items-center justify-center bg-gray-400 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-gray-500 transition-colors text-base"
            >
              <HiRefresh className="w-5 h-5 mr-1" /> Повторить
            </button>
            <button
              onClick={nextSentence}
              className="flex-grow flex items-center justify-center bg-sky-500 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-sky-600 transition-colors text-base"
            >
              Продолжить <HiArrowRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* 6. Отображение правильного ответа после ошибки или пропуска */}
      {showAnswer && (
        <div
          className={`mt-4 p-3 rounded-lg shadow w-full max-w-xl ${
            status === "incorrect"
              ? "bg-red-50 dark:bg-red-900"
              : "bg-amber-50 dark:bg-amber-900"
          }`}
        >
          <p className="text-sm text-gray-700 dark:text-gray-200 font-semibold mb-1">
            {status === "incorrect"
              ? "❌ Неверно. Правильный ответ:"
              : "Правильный ответ (Пропущено):"}
          </p>
          <p className="text-base font-mono text-gray-800 dark:text-gray-100">
            {currentItem.exde}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            ({currentItem.exru})
          </p>
        </div>
      )}
    </div>
  );
}