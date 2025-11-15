import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  selectLesson,
  markLearned,
  clearLessonProgress,
} from "../../store/store";
import { lessons } from "../../data";

import { HiCheckCircle, HiChevronRight, HiArrowLeft } from "react-icons/hi";
import LessonComplete from "../../components/LessonComplete";

const CHUNK_SIZE = 5;

export default function MatchingMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    list,
    learnedMatching, // <-- Используем только этот массив для фильтрации в этом режиме
    // Остальные массивы импортируем, но не используем в фильтрации, если нужен независимый прогресс
    learnedFlashcards,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  } = useSelector((state) => state.words);

  const [round, setRound] = useState(0);
  const [chunk, setChunk] = useState([]);
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matched, setMatched] = useState([]);
  const [incorrectRight, setIncorrectRight] = useState(null);

  // --- Расчет пула слов (ИЗОЛИРОВАННАЯ фильтрация) ---

  const getRemainingList = useCallback(() => {
    // 🛑 ИСПРАВЛЕНИЕ: Используем ТОЛЬКО learnedMatching для фильтрации

    const learnedSet = new Set();
    learnedMatching.forEach((w) => learnedSet.add(`${w.de}-${w.lessonId}`)); // <-- Только learnedMatching

    return (
      list?.filter((word) => {
        const key = `${word.de}-${word.lessonId}`;
        // Слово исключается, только если оно выучено В РЕЖИМЕ СОПОСТАВЛЕНИЕ
        return word.lessonId === lessonId && !learnedSet.has(key);
      }) || []
    );
  }, [
    list,
    learnedMatching, // <-- В зависимости оставляем только learnedMatching
    lessonId,
  ]);

  const remainingList = useMemo(() => getRemainingList(), [getRemainingList]);

  const chunks = useMemo(() => {
    const lessonChunks = [];
    for (let i = 0; i < remainingList.length; i += CHUNK_SIZE) {
      lessonChunks.push(remainingList.slice(i, i + CHUNK_SIZE));
    }
    return lessonChunks;
  }, [remainingList]);

  const totalWordsInLesson = list.filter((w) => w.lessonId === lessonId).length;
  const totalCompleted = totalWordsInLesson - remainingList.length;

  // --- Эффекты загрузки и подготовки данных (Остальной код не меняется) ---

  // 1. Загружаем урок, если списка нет
  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  // 2. Контроль за актуальностью текущего раунда.
  useEffect(() => {
    if (round >= chunks.length && chunks.length > 0) {
      setRound(chunks.length - 1);
    } else if (round >= chunks.length && remainingList.length > 0) {
      setRound(0);
    }
  }, [round, chunks.length, remainingList.length]);

  // 3. Загружаем/Перезагружаем текущий раунд
  useEffect(() => {
    if (remainingList.length === 0) return;
    if (round >= chunks.length && chunks.length > 0) return;

    const current = chunks[round] || [];
    setChunk(current);

    const shuffledLeft = [...current].sort(() => Math.random() - 0.5);
    const shuffledRight = [...current].sort(() => Math.random() - 0.5);

    setLeft(shuffledLeft);
    setRight(shuffledRight);

    setMatched([]);
    setSelectedLeft(null);
    setIncorrectRight(null);
  }, [round, chunks, remainingList.length]);

  // --- Обработчики кликов и навигации ---

  const handleLeftSelect = (word) => {
    if (selectedLeft?.de === word.de) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(word);
      setIncorrectRight(null);
    }
  };

  const handleRightSelect = (word) => {
    if (!selectedLeft) return;

    if (word.de === selectedLeft.de) {
      // Верное совпадение
      setMatched((m) => [...m, word.de]);
      setIncorrectRight(null);
      setSelectedLeft(null);
    } else {
      // Неверное совпадение
      setIncorrectRight(word.de);
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
      // Используем mode: "matching"
      dispatch(clearLessonProgress({ lessonId, mode: "matching" }));
      handleGoBack();
    }
  }, [dispatch, lessonId, navigate, handleGoBack]);

  // --- Переход к следующему раунду ---

  useEffect(() => {
    // Проверяем, совпали ли все слова в текущем чанке
    if (chunk.length > 0 && matched.length === chunk.length) {
      // ДИСПАТЧ: Отмечаем слова как выученные ТОЛЬКО в режиме matching
      chunk.forEach((word) => {
        dispatch(markLearned({ word: word, mode: "matching" }));
      });

      // Переход к следующему раунду
      setTimeout(() => {
        setRound((r) => r + 1);
      }, 0);
    }
  }, [matched, chunk, dispatch]);

  // --- UI Рендеринг (Код не меняется) ---

  if (totalCompleted === totalWordsInLesson && totalWordsInLesson > 0) {
    return (
      <LessonComplete
        lessonId={lessonId}
        onGoBack={handleGoBack}
        onRepeat={handleRepeatLesson}
      />
    );
  }

  if (totalWordsInLesson === 0) {
    return (
      <div className="p-6 text-gray-500 text-center dark:bg-gray-900 dark:text-gray-400 min-h-screen">
        Загрузка урока...
      </div>
    );
  }

  if (!chunk.length && chunks.length > 0) return null;

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* Заголовок и Навигация */}
      <div className="w-full max-w-lg mb-6 flex justify-between items-center">
        <button
          onClick={handleGoBack}
          className="flex items-center text-sky-700 hover:text-sky-800 transition font-semibold dark:text-sky-400 dark:hover:text-sky-300"
        >
          <HiArrowLeft className="w-6 h-6 mr-1" />
          <span className="hidden sm:inline">К уроку</span>
        </button>
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-50">
          Сопоставление: {lessonId.toUpperCase()}
        </h1>
        <div className="w-12"></div>
      </div>

      {/* Прогресс */}
      <div className="w-full max-w-lg mb-8 bg-white p-4 rounded-xl shadow-md border border-gray-100 dark:bg-gray-800 dark:shadow-xl dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">
          Прогресс: Раунд {round + 1} из {chunks.length || 1}
        </h2>

        {/* Индикатор прогресса раунда */}
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(matched.length / (chunk.length || 1)) * 100}%`,
            }}
            title={`Совпало ${matched.length} из ${chunk.length} в раунде`}
          ></div>
        </div>

        {/* Общий прогресс урока */}
        <div className="mt-3 text-xs text-gray-500 flex justify-between dark:text-gray-400">
          <span>
            Выучено: {totalCompleted} из {totalWordsInLesson}
          </span>
          <span>Осталось в пуле: {remainingList.length}</span>
        </div>
      </div>

      {/* Контейнер для колонок */}
      <div className="w-full max-w-lg flex gap-4 sm:gap-8 mt-4">
        {/* Колонка 1: Немецкие слова (Левая) */}
        <div className="flex-1 flex flex-col gap-3 p-3 bg-white rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:shadow-xl dark:border-gray-700">
          <h3 className="text-lg font-bold text-purple-600 mb-2 dark:text-purple-400">
            Немецкий (Wort)
          </h3>
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
                disabled={isMatched}
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
          <h3 className="text-lg font-bold text-sky-600 mb-2 dark:text-sky-400">
            Русский (Перевод)
          </h3>
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
                disabled={isMatched || !selectedLeft}
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
