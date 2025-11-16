import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  markLearned,
  clearLessonProgress,
} from "../../store/words/progressSlice";
import { selectLesson } from "../../store/words/wordsSlice";
import { lessons } from "../../data";

// ❗ ИМПОРТЫ ДЛЯ ЖИЗНЕЙ И ТАЙМЕРА (Оставлены для логики, но удалены из UI)
import { loseLife, resetLives } from "../../store/lives/livesSlice";
import {
  setGameOver,
  clearGameOver,
} from "../../store/gameState/gameStateSlice";

import { HiChevronRight, HiClock } from "react-icons/hi"; // HiArrowLeft удален
import LessonComplete from "../../components/LessonComplete";

// КОНСТАНТЫ
const CHUNK_SIZE = 5; // Размер батча
const MAX_LIVES = 3;

// --- ФУНКЦИЯ ФОРМАТИРОВАНИЯ ВРЕМЕНИ ---
const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec
    .toString()
    .padStart(2, "0")}`;
};

export default function MatchingMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ REDUX СОСТОЯНИЯ
  const currentLives = useSelector((state) => state.lives.count);
  const { gameOverTimestamp, cooldownDuration } = useSelector(
    (state) => state.gameState
  );

  const { list } = useSelector((state) => state.words.navigation);

  // ❗ ИМПОРТ ВСЕХ ПРОГРЕССОВ ДЛЯ ЕДИНОЙ ЛОГИКИ ФИЛЬТРАЦИИ
  const {
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  } = useSelector((state) => state.words.progress);

  // ❗ ИЗМЕНЕННЫЕ СОСТОЯНИЯ ДЛЯ ЛОГИКИ БАТЧА
  const [index, setIndex] = useState(0);
  const [chunk, setChunk] = useState([]);
  const [wordsToReview, setWordsToReview] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matched, setMatched] = useState([]);
  const [incorrectRight, setIncorrectRight] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- ЛОГИКА ТАЙМЕРА И GAME OVER ---

  useEffect(() => {
    if (currentLives <= 0 && !gameOverTimestamp) {
      dispatch(setGameOver({ timestamp: Date.now() }));
    }
  }, [currentLives, gameOverTimestamp, dispatch]);

  useEffect(() => {
    let interval;
    if (gameOverTimestamp) {
      const calculateTimeLeft = () => {
        const elapsed = Date.now() - gameOverTimestamp;
        const remaining = cooldownDuration - elapsed;

        if (remaining <= 0) {
          dispatch(clearGameOver());
          dispatch(resetLives());
          setTimeLeft(0);
          clearInterval(interval);
          return;
        }

        setTimeLeft(Math.ceil(remaining / 1000));
      };

      calculateTimeLeft();
      interval = setInterval(calculateTimeLeft, 1000);
    } else {
      setTimeLeft(0);
    }

    return () => clearInterval(interval);
  }, [gameOverTimestamp, cooldownDuration, dispatch]);

  const handlePurchasePremium = () => {
    navigate(`/checkout/restore-lives/${lessonId}`);
  };

  // --- Расчет пула слов (ОБЪЕДИНЕННАЯ ЛОГИКА) ---

  const getRemainingList = useCallback(() => {
    // Объединяем прогресс со всех режимов для строгого отбора
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
        // Фильтруем, используя объединенный Set
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

  const allRemainingList = useMemo(
    () => getRemainingList(),
    [getRemainingList]
  );

  const allLessonWords = useMemo(
    () => list?.filter((w) => w.lessonId === lessonId) || [],
    [list, lessonId]
  );

  const totalWordsInLesson = allLessonWords.length;
  const totalCompleted = totalWordsInLesson - allRemainingList.length;

  // --- ЛОГИКА ЗАГРУЗКИ БАТЧА ---

  const loadNextBatch = useCallback(() => {
    const reviewBatch = wordsToReview;
    const needNewWords = CHUNK_SIZE - reviewBatch.length;

    const remainingForNewBatch = allRemainingList.filter(
      (word) => !reviewBatch.some((r) => r.de === word.de)
    );

    const newWordsBatch = remainingForNewBatch.slice(0, needNewWords);

    const nextChunk = [...reviewBatch, ...newWordsBatch].sort(
      () => Math.random() - 0.5
    );

    if (nextChunk.length > 0) {
      setChunk(nextChunk);
      setLeft([...nextChunk].sort(() => Math.random() - 0.5));
      setRight([...nextChunk].sort(() => Math.random() - 0.5));

      setIsSessionComplete(false);
      setWordsToReview([]);
      setMatched([]);
      setSelectedLeft(null);
      setIncorrectRight(null);
      setIndex((prev) => prev + 1);
    } else if (reviewBatch.length === 0 && remainingForNewBatch.length === 0) {
      setIsSessionComplete(true);
    }
  }, [allRemainingList, wordsToReview]);

  // 💡 handleRestartSession теперь использует loadNextBatch для инициализации
  const handleRestartSession = useCallback(() => {
    setIsSessionComplete(false);
    setWordsToReview([]);
    setIndex(0); // Сбрасываем индекс батча

    // ❗ Самый чистый способ: просто вызываем loadNextBatch
    loadNextBatch();
  }, [loadNextBatch]); // Зависит от loadNextBatch

  // --- Эффекты загрузки и подготовки данных ---

  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  useEffect(() => {
    if (allRemainingList.length > 0 && chunk.length === 0 && index === 0) {
      loadNextBatch();
    }
  }, [allRemainingList, loadNextBatch, chunk.length, index]);

  // --- Обработчики кликов и навигации ---

  const handleLeftSelect = (word) => {
    if (matched.includes(word.de) || currentLives <= 0) return;

    if (selectedLeft?.de === word.de) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(word);
      setIncorrectRight(null);
    }
  };

  const handleRightSelect = (word) => {
    if (currentLives <= 0 || !selectedLeft || matched.includes(word.de)) return;

    if (word.de === selectedLeft.de) {
      // ✅ Верное совпадение
      setMatched((m) => [...m, word.de]);
      setIncorrectRight(null);
      setSelectedLeft(null);
    } else {
      // ❌ Неверное совпадение: ТЕРЯЕМ ЖИЗНЬ И ДОБАВЛЯЕМ В ПОВТОРЕНИЕ
      if (currentLives > 0) {
        dispatch(loseLife());
      }

      const wordToReview = chunk.find((w) => w.de === selectedLeft.de);
      if (
        wordToReview &&
        !wordsToReview.some((w) => w.de === wordToReview.de)
      ) {
        setWordsToReview((prev) => [...prev, wordToReview]);
      }

      setIncorrectRight(word.de);
      setTimeout(() => setIncorrectRight(null), 700);
    }
  };

  const handleGoBack = () => navigate(`/lesson/${lessonId}`);

  // ❗ ИСПРАВЛЕНА: Теперь вызывает handleRestartSession для немедленной перезагрузки
  const handleRepeatLesson = useCallback(() => {
    if (
      window.confirm(
        "Вы уверены? Это действие удалит прогресс для этого урока ТОЛЬКО в режиме СОПОСТАВЛЕНИЕ."
      )
    ) {
      dispatch(clearLessonProgress({ lessonId, mode: "matching" }));
      dispatch(resetLives());
      handleRestartSession(); // 💡 Немедленный старт новой сессии
    }
  }, [dispatch, lessonId, handleRestartSession]);

  // --- Переход к следующему батчу ---

  useEffect(() => {
    // 🟢 Если текущий чанк завершен (все слова сопоставлены)
    if (chunk.length > 0 && matched.length === chunk.length) {
      // ❗ Выполняем MarkLearned в Redux
      chunk.forEach((word) => {
        if (!wordsToReview.some((w) => w.de === word.de)) {
          dispatch(markLearned({ word: word, mode: "matching" }));
        }
      });

      // ❗ Используем небольшую задержку, чтобы дать Redux обновиться,
      // прежде чем проверять totalNextWords в UI завершения сессии.
      setTimeout(() => {
        setIsSessionComplete(true);
      }, 300);
    }
  }, [matched, chunk, dispatch, wordsToReview]);

  // ❗ ПРОВЕРКА GAME OVER И ТАЙМЕРА (ЭКРАН ОЖИДАНИЯ)
  if (currentLives <= 0 && gameOverTimestamp) {
    if (timeLeft > 0) {
      return (
        <div className="p-12 text-center text-gray-800 dark:text-gray-50 bg-gray-50 min-h-[50vh] dark:bg-gray-900 transition-colors duration-300 w-full max-w-lg mx-auto rounded-xl shadow-lg mt-10">
          <h2 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-4">
            💔 Жизни закончились!
          </h2>
          <p className="mb-6 font-semibold text-xl">
            Подождите восстановления жизней:
          </p>
          <div className="text-6xl font-mono font-bold text-sky-600 dark:text-sky-400 mb-8 flex items-center justify-center">
            <HiClock className="w-12 h-12 mr-3" />
            {formatTime(timeLeft)}
          </div>

          <p className="mb-4">Или приобретите безлимит (Premium):</p>
          <button
            onClick={handlePurchasePremium}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-md font-bold hover:bg-indigo-700 transition duration-150"
          >
            Купить безлимит / Восстановить мгновенно
          </button>

          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto mt-4 px-6 py-3 text-gray-800 bg-gray-300 rounded-xl font-bold hover:bg-gray-400 transition duration-150 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600"
          >
            Вернуться к уроку
          </button>
        </div>
      );
    }
  }

  const nextRemaining = allRemainingList.length;

  // Экран завершения урока (Проверяем, что не осталось невыученных слов)
  if (
    nextRemaining === 0 &&
    totalWordsInLesson > 0 &&
    wordsToReview.length === 0
  ) {
    return (
      <LessonComplete
        lessonId={lessonId}
        onGoBack={handleGoBack}
        onRepeat={handleRepeatLesson}
      />
    );
  }

  // 🟢 ЭКРАН ЗАВЕРШЕНИЯ СЕССИИ (БАТЧА)
  if (isSessionComplete) {
    const totalNextWords = nextRemaining + wordsToReview.length;

    // ❗ ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА, ЕСЛИ totalNextWords ВДРУГ ОКАЗЫВАЕТСЯ 0
    if (totalNextWords <= 0 && totalWordsInLesson > 0) {
      // Если все слова выучены, но UI еще не обновился, перенаправляем на LessonComplete
      return (
        <LessonComplete
          lessonId={lessonId}
          onGoBack={handleGoBack}
          onRepeat={handleRepeatLesson}
        />
      );
    }

    return (
      <div className="p-12 text-center text-gray-800 dark:text-gray-50 bg-gray-50 min-h-[50vh] dark:bg-gray-900 transition-colors duration-300 w-full max-w-lg mx-auto rounded-xl shadow-lg mt-10">
        <h2 className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mb-4">
          Сессия {index} завершена!
        </h2>

        {wordsToReview.length > 0 && (
          <p className="text-red-500 font-bold mb-4">
            {wordsToReview.length} слов(а) будут повторены в следующем батче.
          </p>
        )}

        {totalNextWords > 0 ? (
          <>
            <p className="mb-6 font-semibold">
              Осталось слов (включая повтор): {totalNextWords}
            </p>
            <button
              onClick={loadNextBatch}
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-xl shadow-md font-bold hover:bg-purple-700 transition duration-150 flex items-center justify-center mx-auto"
            >
              <HiChevronRight className="w-5 h-5 mr-2" />
              Начать следующий батч
            </button>
            <button
              onClick={handleRestartSession}
              className="w-full sm:w-auto mt-3 px-6 py-3 bg-gray-300 text-gray-800 rounded-xl font-semibold hover:bg-gray-400 transition duration-150 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600 flex items-center justify-center mx-auto"
            >
              <HiClock className="w-5 h-5 mr-2" />
              Повторить текущие слова
            </button>
          </>
        ) : (
          <p className="text-xl font-bold text-green-600 dark:text-green-400 mb-6">
            Поздравляем! Вы выучили все слова в этом режиме.
          </p>
        )}
      </div>
    );
  }

  // Загрузка
  if (chunk.length === 0) {
    return (
      <div className="p-6 text-gray-500 text-center dark:bg-gray-900 dark:text-gray-400 min-h-screen">
        Загрузка или переключение батча...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* 🛑 УДАЛЕН БЛОК УПРАВЛЕНИЯ И ИНДИКАТОР ЖИЗНЕЙ */}

      {/* Прогресс */}
      <div className="w-full max-w-lg mb-8 bg-white p-4 rounded-xl shadow-md border border-gray-100 dark:bg-gray-800 dark:shadow-xl dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">
          Прогресс: Батч {index} ({matched.length} из {chunk.length}{" "}
          сопоставлено)
        </h2>

        {/* Индикатор прогресса раунда */}
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(matched.length / (chunk.length || 1)) * 100}%`,
            }}
            title={`Совпало ${matched.length} из ${chunk.length} в батче`}
          ></div>
        </div>

        {/* 💡 ОБЩИЙ ПРОГРЕСС УРОКА (Теперь согласован с Quiz/Flashcards) */}
        <div className="mt-3 text-xs text-gray-500 flex justify-between dark:text-gray-400">
          <span>Осталось всего невыученных: {nextRemaining}</span>
        </div>
      </div>

      {/* Контейнер для колонок */}
      <div className="w-full max-w-lg flex gap-4 sm:gap-8 m">
        {/* Колонка 1: Немецкие слова (Левая) */}
        <div className="flex-1 flex flex-col gap-3 p-3 bg-white rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:shadow-xl dark:border-gray-700">
          {left.map((w) => {
            const isMatched = matched.includes(w.de);
            const isSelected = selectedLeft?.de === w.de;

            let cls =
              "bg-purple-50 border-2 border-purple-100 hover:bg-purple-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-50";
            if (isMatched) {
              cls =
                "bg-green-100 text-green-700 border-green-400 pointer-events-none opacity-60 dark:bg-green-900 dark:text-green-300 dark:border-green-600";
            } else if (isSelected) {
              cls =
                "bg-purple-500 text-white border-purple-700 shadow-xl scale-[1.02]";
            }

            return (
              <button
                key={w.de + "left"}
                disabled={isMatched || currentLives <= 0}
                onClick={() => handleLeftSelect(w)}
                className={`p-3 rounded-lg text-lg font-medium text-center transition duration-150 transform ${cls}`}
              >
                {w.de}
              </button>
            );
          })}
        </div>

        {/* Разделитель */}
        <div className="hidden sm:flex items-center justify-center">
          <HiChevronRight className="w-10 h-10 text-purple-400" />
        </div>

        {/* Колонка 2: Русские слова (Правая) */}
        <div className="flex-1 flex flex-col gap-3 p-3 bg-white rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:shadow-xl dark:border-gray-700">
          {right.map((w) => {
            const isMatched = matched.includes(w.de);
            const isIncorrect = incorrectRight === w.de;

            let cls =
              "bg-sky-50 border-2 border-sky-100 hover:bg-sky-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-50";
            if (isMatched) {
              cls =
                "bg-green-100 text-green-700 border-green-400 pointer-events-none opacity-60 dark:bg-green-900 dark:text-green-300 dark:border-green-600";
            } else if (isIncorrect) {
              cls =
                "bg-red-200 text-red-700 border-red-500 shake-animation dark:bg-red-800 dark:text-red-300 dark:border-red-600";
            } else if (selectedLeft) {
              cls =
                "bg-sky-50 border-2 border-sky-300 hover:bg-sky-100 shadow-sm dark:bg-gray-700 dark:border-sky-500 dark:hover:bg-gray-600 dark:text-gray-50";
            }

            return (
              <button
                key={w.de + "right"}
                disabled={isMatched || !selectedLeft || currentLives <= 0}
                onClick={() => handleRightSelect(w)}
                className={`p-3 rounded-lg text-lg font-medium text-center transition duration-150 ${cls}`}
              >
                {w.ru}
              </button>
            );
          })}
        </div>
      </div>

      {/* Стили для анимации */}
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
