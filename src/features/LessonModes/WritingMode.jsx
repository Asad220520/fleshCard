import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  markLearned,
  clearLessonProgress,
} from "../../store/words/progressSlice";
import { selectLesson } from "../../store/words/wordsSlice";
import { lessons } from "../../data";
// Импорт иконок
import {
  HiCheckCircle,
  HiXCircle,
  HiLightBulb,
  HiArrowRight,
  HiArrowLeft,
} from "react-icons/hi";
import LessonComplete from "../../components/LessonComplete";

// Функция нормализации (оставлена без изменений)
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .trim();
}

// КОНСТАНТА: Максимальное количество слов в одной учебной сессии
const MAX_SESSION_SIZE = 10;
// Константа для очистки всех режимов (для контекста) - Обновлена
const ALL_MODES = [
  "flashcards",
  "matching",
  "quiz",
  "writing",
  "sentence_puzzle",
];

export default function WritingMode() {
  const { languageId, lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ ИСПРАВЛЕНИЕ 1: list теперь находится в state.words.navigation
  const { list } = useSelector((s) => s.words.navigation);

  // ✅ ИСПРАВЛЕНИЕ 2: learned* массивы теперь находятся в state.words.progress
  const {
    // 🛑 Используем только learnedWriting для фильтрации в этом режиме
    learnedWriting,
    // Остальные массивы импортируем, но не используем в фильтрации, если нужен независимый прогресс
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedSentencePuzzle,
  } = useSelector((s) => s.words.progress);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checkState, setCheckState] = useState(null); // 'correct', 'wrong'
  const [showHint, setShowHint] = useState(false);
  // Фиксированный список слов для текущей сессии
  const [sessionList, setSessionList] = useState([]);
  // Состояние для отслеживания завершения сессии (все слова просмотрены)
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // --- Расчет пула слов (ИЗОЛИРОВАННАЯ фильтрация) ---

  // 💡 ФУНКЦИЯ: для получения оставшихся слов ТОЛЬКО из learnedWriting
  const getRemainingList = useCallback(() => {
    // 1. Создаем Set уникальных выученных ключей ТОЛЬКО ИЗ РЕЖИМА ПИСЬМО
    const learnedSet = new Set();
    learnedWriting.forEach((w) => learnedSet.add(`${w.de}-${w.lessonId}`)); // <-- Используем только learnedWriting

    // 2. Фильтруем list: оставляем только те слова, которых НЕТ в learnedSet
    return (
      list?.filter((word) => {
        const key = `${word.de}-${word.lessonId}`;
        // Слово исключается, только если оно выучено В РЕЖИМЕ ПИСЬМО
        return word.lessonId === lessonId && !learnedSet.has(key);
      }) || []
    );
  }, [
    list,
    learnedWriting, // <-- В зависимости оставляем только learnedWriting
    lessonId,
  ]);

  // Список всех невыученных слов (весь пул) - используем useMemo
  const allRemainingList = useMemo(
    () => getRemainingList(),
    [getRemainingList]
  );

  const word = sessionList[index];

  // --- Эффекты загрузки и инициализации ---

  // 1. Загружаем урок
  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  // 2. Инициализация sessionList (батча) при загрузке
  useEffect(() => {
    // Убедиться, что sessionList сбрасывается, если remainingList изменился
    if (allRemainingList.length > 0) {
      // Создаем уникальные строки ключей для сравнения
      const currentBatchKeys = sessionList
        .map((w) => `${w.de}-${w.lessonId}`)
        .join(",");
      const newBatchKeys = allRemainingList
        .slice(0, MAX_SESSION_SIZE)
        .map((w) => `${w.de}-${w.lessonId}`)
        .join(",");

      // Сравниваем, если текущий батч отличается от того, который должен быть
      if (currentBatchKeys !== newBatchKeys || sessionList.length === 0) {
        const initialBatch = allRemainingList.slice(0, MAX_SESSION_SIZE);
        setSessionList(initialBatch);
        setIndex(0); // Сбрасываем индекс, чтобы начать с первого слова нового батча
        setIsSessionComplete(false); // Сбрасываем завершение
      }
    }
  }, [allRemainingList, sessionList.length]);

  // 3. Проверка завершения сессии
  useEffect(() => {
    if (sessionList.length > 0 && index >= sessionList.length) {
      setIsSessionComplete(true);
      setIndex(0);
    }
  }, [index, sessionList.length]);

  // --- Логика переходов и проверки ---

  const advance = (delay = 0) => {
    setTimeout(() => {
      // Переход к следующему индексу в рамках sessionList
      setIndex((i) => i + 1);
      setInput("");
      setCheckState(null);
      setShowHint(false);
    }, delay);
  };

  const handleCheck = () => {
    if (!word || input.trim() === "") return;

    const correct = normalize(word.de) === normalize(input);

    if (correct) {
      // ✅ Отмечаем как выученное в Redux ТОЛЬКО для режима 'writing'
      dispatch(markLearned({ word, mode: "writing" }));
      setCheckState("correct");

      // Даем пользователю увидеть "Верно!" и переходим
      advance(1200);
    } else {
      setCheckState("wrong");
      setTimeout(() => setCheckState(null), 1000);
    }
  };

  const handleNext = () => {
    // Используется для перехода после ошибки или после просмотра подсказки
    advance(0);
  };

  const handleShowHint = () => {
    if (!showHint) {
      setShowHint(true);
      setCheckState("wrong");
    } else {
      // Скрываем подсказку
      setShowHint(false);
      setCheckState(null);
      // Опционально: Очистить поле, чтобы пользователь попробовал снова
      setInput("");
    }
  };

  // Обработка нажатия Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Если ответ верный, кнопка проверки отключена, ничего не делаем.
      if (checkState === "correct") return;

      // Если была ошибка и ответ показан, Enter переходит к следующему
      if (checkState === "wrong" && showHint) {
        handleNext();
      } else {
        // В остальных случаях (первая проверка или ошибка без подсказки), проверяем
        handleCheck();
      }
    }
  };

  const handleGoBack = () => {
    navigate(`/lessons-list/${languageId}/${lessonId}`);
  };

  // 💡 ФУНКЦИЯ: Сброс прогресса ТОЛЬКО для WritingMode
  const handleRepeatLesson = useCallback(() => {
    if (
      window.confirm(
        "Вы уверены? Это действие удалит прогресс для этого урока ТОЛЬКО в режиме ПИСЬМО."
      )
    ) {
      dispatch(clearLessonProgress({ lessonId, mode: "writing" }));
      handleGoBack();
    }
  }, [dispatch, lessonId, navigate, handleGoBack]);

  // --- UI Рендеринг ---

  // 1. Если все слова в пуле выучены
  if (allRemainingList.length === 0 && list && list.length > 0)
    return (
      <LessonComplete
        lessonId={lessonId}
        onGoBack={handleGoBack}
        onRepeat={handleRepeatLesson} // 💡 ИСПОЛЬЗУЕМ handleRepeatLesson
      />
    );

  // 2. Если сессия завершена (конец батча)
  if (isSessionComplete) {
    return (
      <div className="p-12 text-sky-600 text-center text-xl font-semibold bg-white rounded-xl shadow-lg m-6 dark:bg-gray-800 dark:text-sky-400 dark:shadow-2xl">
        <span role="img" aria-label="trophy" className="text-3xl">
          🏆
        </span>{" "}
        Вы завершили текущий батч из {MAX_SESSION_SIZE} слов. <br />
        Осталось слов в уроке: {allRemainingList.length}.
        <div className="mt-4">
          {/* Кнопка для старта нового батча */}
          <button
            onClick={() => {
              // Сброс состояния для загрузки нового батча
              setIsSessionComplete(false);
              setSessionList([]);
              setIndex(0);
            }}
            className="mt-4 mr-3 px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition font-semibold dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            Начать следующий батч
          </button>
          <button
            onClick={handleGoBack}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition font-semibold dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-50"
          >
            К уроку
          </button>
        </div>
      </div>
    );
  }

  // 3. Если слово еще не загружено (initial load)
  if (!word) return null;

  // Классы для поля ввода на основе состояния
  let inputClass =
    "border-2 border-gray-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-50 dark:placeholder-gray-400";
  if (checkState === "correct") {
    inputClass =
      "border-2 border-green-500 bg-green-50 dark:bg-green-900 dark:border-green-600 dark:text-green-200";
  } else if (checkState === "wrong") {
    inputClass =
      "border-2 border-red-500 bg-red-50 shake-animation dark:bg-red-900 dark:border-red-600 dark:text-red-200";
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* Прогресс */}
      <div className="w-full max-w-lg mb-8 text-center">
        <div className="text-sm font-medium text-gray-600 mb-2 dark:text-gray-400">
          Слово {index + 1} из {sessionList.length} (Батч)
          <span className="block text-xs text-gray-400 mt-1 dark:text-gray-500">
            Осталось всего невыученных: {allRemainingList.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / sessionList.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Слово для перевода */}
      <div className="p-8 bg-white rounded-2xl shadow-lg mb-8 w-full max-w-md text-center dark:bg-gray-800 dark:shadow-xl">
        <p className="text-gray-500 text-lg mb-2 dark:text-gray-400">
          Переведите слово:
        </p>
        <div className="text-4xl font-bold text-gray-800 dark:text-gray-50">
          {word.ru}
        </div>
      </div>

      {/* Поле ввода */}
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          // При вводе сбрасываем состояние ошибки
          if (checkState === "wrong" && !showHint) setCheckState(null);
          if (showHint) setShowHint(false); // Скрываем подсказку при новом вводе
        }}
        onKeyDown={handleKeyDown}
        className={`rounded-xl p-4 w-full max-w-md text-xl text-center transition-colors duration-200 ${inputClass}`}
        placeholder="Введите немецкое слово..."
        autoFocus
        disabled={checkState === "correct"} // Деактивируем после верного ответа
      />

      {/* Обратная связь */}
      <div className="h-10 w-full max-w-md text-center mt-3">
        {checkState === "wrong" && !showHint && (
          <div className="text-red-600 font-semibold flex items-center justify-center dark:text-red-400">
            <HiXCircle className="w-5 h-5 mr-1" /> Неверно. Попробуйте снова или
            воспользуйтесь подсказкой.
          </div>
        )}
        {checkState === "correct" && (
          <div className="text-green-600 font-bold text-xl flex items-center justify-center dark:text-green-400">
            <HiCheckCircle className="w-6 h-6 mr-1" /> Верно!
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-4 mt-6 w-full max-w-md">
        {/* Кнопка "Подсказка" / "Скрыть" */}
        <button
          onClick={handleShowHint}
          disabled={checkState === "correct"}
          className="flex-1 px-4 py-3 bg-yellow-400 text-yellow-900 rounded-xl font-semibold hover:bg-yellow-500 transition duration-150 disabled:opacity-70 dark:bg-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-600"
        >
          <div className="flex items-center justify-center">
            <HiLightBulb className="w-5 h-5 mr-2" />
            {showHint ? "Скрыть ответ" : "Показать ответ"}
          </div>
        </button>

        {/* Основная кнопка: Проверить / Далее */}
        <button
          onClick={
            checkState === "correct" || (checkState === "wrong" && showHint)
              ? handleNext
              : handleCheck
          }
          disabled={
            input.trim() === "" &&
            checkState !== "correct" &&
            !(checkState === "wrong" && showHint)
          }
          className={`flex-1 px-4 py-3 rounded-xl font-bold transition duration-150 
          ${
            checkState === "correct"
              ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              : checkState === "wrong" && showHint
              ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              : "bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-800"
          }
           text-white`}
        >
          {checkState === "correct" || (checkState === "wrong" && showHint) ? (
            <div className="flex items-center justify-center">
              Далее
              <HiArrowRight className="w-5 h-5 ml-2" />
            </div>
          ) : (
            "Проверить"
          )}
        </button>
      </div>

      {/* Показ правильного ответа после ошибки или по запросу */}
      {showHint && word && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-xl mt-4 w-full max-w-md text-center dark:bg-red-900 dark:border-red-600">
          <span className="text-sm text-red-700 dark:text-red-300">
            Правильный ответ:
          </span>
          <p className="text-xl font-bold text-red-800 dark:text-red-200">
            {word.de}
          </p>
        </div>
      )}

      {/* Добавляем стили для анимации */}
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
