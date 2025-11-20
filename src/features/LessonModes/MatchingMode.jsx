import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  clearLessonProgress,
  // markLearned удален, чтобы не сохранять прогресс
} from "../../store/words/progressSlice";
import { selectLesson } from "../../store/words/wordsSlice";
import { lessons } from "../../data";

import { loseLife, resetLives } from "../../store/lives/livesSlice";
import {
  setGameOver,
  clearGameOver,
} from "../../store/gameState/gameStateSlice";

import { HiClock, HiHeart, HiChevronRight } from "react-icons/hi";
import LessonComplete from "../../components/LessonComplete";
import ProgressBar from "../../components/UI/ProgressBar";

// КОНСТАНТЫ
const CHUNK_SIZE = 3; // Размер батча (по 3 слова)
const MAX_ROUNDS = 3; // Лимит раундов в сессии
const TARGET_MODE = "matching";

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

  const currentLives = useSelector((state) => state.lives.count);
  const { gameOverTimestamp, cooldownDuration } = useSelector(
    (state) => state.gameState
  );
  const { list } = useSelector((state) => state.words.navigation);

  // --- Состояния Компонента ---
  const [chunk, setChunk] = useState([]);
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matched, setMatched] = useState([]);
  const [incorrectRight, setIncorrectRight] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- Состояния Сессии ---
  const [sessionRoundCount, setSessionRoundCount] = useState(0);
  const [isSessionCompletedByLimit, setIsSessionCompletedByLimit] =
    useState(false);

  // --- Прогресс Redux ---
  const {
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  } = useSelector((state) => state.words.progress);

  // --- Логика Game Over и Таймера (Без изменений) ---
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

  // --- Расчет пула слов (Логика фильтрации - теперь игнорирует learnedMatching) ---

  const getRemainingList = useCallback(() => {
    // 💡 Фильтруем все режимы КРОМЕ ТЕКУЩЕГО (Matching), чтобы
    // MatchingMode всегда тренировал слова, не выученные в других режимах.
    const allLearnedWords = [
      ...learnedFlashcards,
      // learnedMatching исключен, т.к. мы не сохраняем прогресс в этом режиме
      ...learnedQuiz,
      ...learnedWriting,
      ...(learnedSentencePuzzle || []),
    ];

    const learnedSet = new Set();
    allLearnedWords.forEach((w) => learnedSet.add(`${w.de}-${w.lessonId}`));

    // В отличие от предыдущей версии, здесь мы берем ВСЕ слова урока,
    // которые НЕ ВЫУЧЕНЫ В ДРУГИХ РЕЖИМАХ.
    return (
      list?.filter((word) => {
        const key = `${word.de}-${word.lessonId}`;
        return word.lessonId === lessonId && !learnedSet.has(key);
      }) || []
    );
  }, [
    list,
    learnedFlashcards,
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

  const totalRemaining = allRemainingList.length;

  // --- ЛОГИКА ЗАГРУЗКИ БАТЧА ---
  const loadNextBatch = useCallback(() => {
    if (sessionRoundCount >= MAX_ROUNDS) {
      setIsSessionCompletedByLimit(true);
      return;
    }

    // Берем только новые слова из allRemainingList
    const newWordsBatch = allRemainingList.slice(0, CHUNK_SIZE);

    const nextChunk = newWordsBatch.sort(() => Math.random() - 0.5);

    if (nextChunk.length > 0) {
      setChunk(nextChunk);
      setLeft([...nextChunk].sort(() => Math.random() - 0.5));
      setRight([...nextChunk].sort(() => Math.random() - 0.5));

      setMatched([]);
      setSelectedLeft(null);
      setIncorrectRight(null);

      setSessionRoundCount((prev) => prev + 1);
    } else {
      setChunk([]);
      if (allRemainingList.length === 0) {
        setIsSessionCompletedByLimit(true);
      }
    }
  }, [allRemainingList, sessionRoundCount]);

  const handleRestartSession = useCallback(() => {
    setSessionRoundCount(0);
    setIsSessionCompletedByLimit(false);
    setChunk([]);
  }, []);

  // --- Эффекты загрузки и подготовки данных (Без изменений) ---

  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  useEffect(() => {
    if (
      allRemainingList.length > 0 &&
      chunk.length === 0 &&
      !isSessionCompletedByLimit
    ) {
      loadNextBatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allRemainingList,
    loadNextBatch,
    chunk.length,
    isSessionCompletedByLimit,
  ]);

  // --- Обработчики кликов ---

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

    // 💡 ОБЩАЯ ЛОГИКА ПРОПУСКА: слово всегда удаляется из текущего батча через setMatched
    const wordToSkip = selectedLeft.de;

    if (word.de === selectedLeft.de) {
      // ✅ Верное совпадение
      setMatched((m) => [...m, word.de]);
      setIncorrectRight(null);
      setSelectedLeft(null);

      // 🛑 ПРОГРЕСС НЕ СОХРАНЯЕТСЯ: dispatch(markLearned) отсутствует.
      // Слово останется в пуле для следующей сессии.
    } else {
      // ❌ Неверное совпадение: ТЕРЯЕМ ЖИЗНЬ
      if (currentLives > 0) {
        dispatch(loseLife());
      }

      // 💡 ПРОПУСК: При ошибке слово помечается как "сопоставленное" (пропущенное)
      setMatched((m) => {
        if (!m.includes(wordToSkip)) {
          return [...m, wordToSkip];
        }
        return m;
      });

      setIncorrectRight(word.de);
      setSelectedLeft(null);
      setTimeout(() => setIncorrectRight(null), 700);
    }
  };

  const handleGoBack = () => navigate(`/lesson/${lessonId}`);

  const handleRepeatLesson = useCallback(() => {
    if (
      window.confirm(
        "Вы уверены? Это действие удалит прогресс для этого урока ТОЛЬКО в режиме СОПОСТАВЛЕНИЕ."
      )
    ) {
      // 1. Сбрасываем Redux прогресс
      dispatch(clearLessonProgress({ lessonId, mode: TARGET_MODE }));
      dispatch(resetLives());

      // 2. Сброс локальных состояний
      setSessionRoundCount(0);
      setIsSessionCompletedByLimit(false);
      setChunk([]);
    }
  }, [dispatch, lessonId]);

  // --- Переход к следующему батчу ---
  useEffect(() => {
    if (chunk.length > 0 && matched.length === chunk.length) {
      // АВТОМАТИЧЕСКАЯ ЗАГРУЗКА СЛЕДУЮЩЕГО БАТЧА
      setTimeout(() => {
        loadNextBatch();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched.length, chunk.length]);

  // --- РЕНДЕРИНГ ЭКРАНОВ СОСТОЯНИЯ (Без изменений) ---

  // 1. ПРОВЕРКА GAME OVER И ТАЙМЕРА
  if (currentLives <= 0 && gameOverTimestamp) {
    if (timeLeft > 0) {
      return (
        <div className="p-12 text-center text-gray-800 dark:text-gray-50 bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors duration-300 w-full max-w-lg mx-auto">
          <h2 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-4 pt-10">
            💔 Жизни закончились!
          </h2>
          <p className="mb-6 font-semibold text-xl">
            Подождите восстановления жизней:
          </p>
          <div className="text-6xl font-mono font-bold text-sky-600 dark:text-sky-400 mb-8 flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            <HiClock className="w-12 h-12 mr-3" />
            {formatTime(timeLeft)}
          </div>

          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Или:</p>
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

  // 2. Экран завершения урока
  if (
    isSessionCompletedByLimit ||
    (totalRemaining === 0 && totalWordsInLesson > 0)
  ) {
    const isRestartSession = isSessionCompletedByLimit;

    return (
      <LessonComplete
        lessonId={lessonId}
        onGoBack={handleGoBack}
        message={
          isRestartSession
            ? `Вы завершили ${MAX_ROUNDS} раундов тренировки! Хотите начать новую?`
            : "Урок полностью завершен!"
        }
        repeatText={
          isRestartSession
            ? "Начать новую сессию (Повторить)"
            : "Повторить урок полностью (Сбросить прогресс)"
        }
        onRepeat={() =>
          isRestartSession ? handleRestartSession() : handleRepeatLesson()
        }
      />
    );
  }

  // 3. Загрузка / Нет слов
  if (totalWordsInLesson === 0) {
    return (
      <div className="p-12 text-center text-gray-500 bg-gray-50 min-h-screen dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-50 mb-3">
          Нет слов для тренировки
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          В этом уроке нет данных для режима сопоставления.
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

  if (chunk.length === 0) {
    return (
      <div className="p-6 text-gray-500 text-center dark:bg-gray-900 dark:text-gray-400 min-h-screen">
        Загрузка следующего батча...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* 1. HEADER: PROGRESS BAR и ЖИЗНИ */}
      <div className="w-full max-w-xl mb-6 p-4 bg-white rounded-xl shadow-2xl dark:bg-gray-800 border-b-4 border-indigo-400 dark:border-indigo-600">
        <ProgressBar
          current={matched.length}
          totalInSession={chunk.length}
          totalRemaining={totalRemaining}
          roundInfo={`(Раунд ${sessionRoundCount} из ${MAX_ROUNDS})`}
        />
      </div>

      {/* 2. КОНТЕЙНЕР ДЛЯ КОЛОНОК */}
      <div className="w-full max-w-xl flex flex-col sm:flex-row gap-3 sm:gap-6">
        {/* Колонка 1: Немецкие слова (Левая) */}
        <div className="flex-1 flex flex-col gap-3 p-3 bg-white rounded-xl shadow-lg border-l-4 border-purple-500 dark:bg-gray-800 dark:shadow-xl dark:border-purple-600">
          <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-1">
            Немецкий (DE)
          </p>
          {left.map((w, index) => {
            const isMatched = matched.includes(w.de);
            const isSelected = selectedLeft?.de === w.de;

            let cls =
              "bg-purple-50 border-2 border-purple-100 hover:bg-purple-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-50 shadow-md";
            if (isMatched) {
              cls =
                "bg-green-100 text-green-700 border-green-400 pointer-events-none opacity-50 dark:bg-green-900 dark:text-green-300 dark:border-green-600 shadow-inner";
            } else if (isSelected) {
              cls =
                "bg-purple-600 text-white border-4 border-purple-300 shadow-2xl scale-[1.03] transform-gpu ring-2 ring-purple-500 dark:ring-purple-400";
            }

            return (
              <button
                key={`${w.de}-${w.lessonId}-${index}-left`}
                disabled={isMatched || currentLives <= 0}
                onClick={() => handleLeftSelect(w)}
                className={`p-3 rounded-xl text-lg font-bold text-center transition duration-200 transform ${cls}`}
              >
                {w.de}
              </button>
            );
          })}
        </div>

        {/* Разделитель на мобильных (невидимый) и десктопе */}
        <div className="hidden sm:flex items-center justify-center">
          <HiChevronRight className="w-8 h-8 text-indigo-400" />
        </div>

        {/* Колонка 2: Русские слова (Правая) */}
        <div className="flex-1 flex flex-col gap-3 p-3 bg-white rounded-xl shadow-lg border-l-4 border-sky-500 dark:bg-gray-800 dark:shadow-xl dark:border-sky-600">
          <p className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-1">
            Русский (RU)
          </p>
          {right.map((w, index) => {
            const isMatched = matched.includes(w.de);
            const isIncorrect = incorrectRight === w.de;

            let cls =
              "bg-sky-50 border-2 border-sky-100 hover:bg-sky-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-50 shadow-md";
            if (isMatched) {
              cls =
                "bg-green-100 text-green-700 border-green-400 pointer-events-none opacity-50 dark:bg-green-900 dark:text-green-300 dark:border-green-600 shadow-inner";
            } else if (isIncorrect) {
              cls =
                "bg-red-200 text-red-700 border-red-500 shake-animation-hard dark:bg-red-800 dark:text-red-300 dark:border-red-600 shadow-xl";
            } else if (selectedLeft) {
              cls =
                "bg-sky-100 border-2 border-sky-400 hover:bg-sky-200 shadow-lg dark:bg-sky-700 dark:border-sky-500 dark:hover:bg-sky-600 dark:text-gray-50";
            }

            return (
              <button
                key={`${w.de}-${w.lessonId}-${index}-right`}
                disabled={isMatched || !selectedLeft || currentLives <= 0}
                onClick={() => handleRightSelect(w)}
                className={`p-3 rounded-xl text-lg font-medium text-center transition duration-150 ${cls}`}
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
          10%, 50% { transform: translateX(-8px); }
          30%, 70% { transform: translateX(8px); }
        }
        .shake-animation-hard {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
