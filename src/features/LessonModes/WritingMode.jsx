import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  // markLearned удален, поскольку прогресс НЕ сохраняется
  clearLessonProgress,
} from "../../store/words/progressSlice";
import { selectLesson } from "../../store/words/wordsSlice";
import { lessons } from "../../data";
import {
  HiCheckCircle,
  HiXCircle,
  HiLightBulb,
  HiArrowRight,
} from "react-icons/hi";
import LessonComplete from "../../components/LessonComplete";
import ProgressBar from "../../components/UI/ProgressBar";

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

export default function WritingMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. ИЗВЛЕКАЕМ ВСЕ LEARNED-СПИСКИ ДЛЯ УНИФИЦИРОВАННОЙ ФИЛЬТРАЦИИ
  const { list } = useSelector((s) => s.words.navigation);
  const {
    learnedWriting,
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedSentencePuzzle,
  } = useSelector((s) => s.words.progress);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checkState, setCheckState] = useState(null); // 'correct', 'wrong'
  const [showHint, setShowHint] = useState(false);
  const [sessionList, setSessionList] = useState([]);
  const [isLessonFullyComplete, setIsLessonFullyComplete] = useState(false);

  // 💡 НОВОЕ: Локальный набор для слов, "выученных" в ТЕКУЩЕЙ СЕССИИ (не сохраняются в Redux)
  const [sessionLearnedSet, setSessionLearnedSet] = useState(new Set());

  // --- Расчет пула слов (УНИФИЦИРОВАННАЯ фильтрация) ---

  const getRemainingList = useCallback(() => {
    // 1. Слова, выученные в Redux (т.е., в других режимах)
    const allReduxLearnedWords = [
      ...learnedFlashcards,
      ...learnedMatching,
      ...learnedQuiz,
      ...learnedWriting,
      ...(learnedSentencePuzzle || []),
    ];
    const reduxLearnedSet = new Set();
    allReduxLearnedWords.forEach((w) =>
      reduxLearnedSet.add(`${w.de}-${w.lessonId}`)
    );

    return (
      list?.filter((word) => {
        const key = `${word.de}-${word.lessonId}`;

        // Слово должно быть из текущего урока И НЕ должно быть выучено в Redux
        const isLessonWord = word.lessonId === lessonId;
        const isReduxLearned = reduxLearnedSet.has(key);

        return isLessonWord && !isReduxLearned;
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

  // Список всех невыученных слов (весь пул, отфильтрованный только по Redux)
  const reduxRemainingList = useMemo(
    () => getRemainingList(),
    [getRemainingList]
  );

  // 💡 Список всех НЕвыученных слов (из Redux), минус слова, которые уже
  // успешно отвечены в текущей ЛОКАЛЬНОЙ сессии. ЭТО НАШ ИСТИННЫЙ ПУЛ.
  const allRemainingList = useMemo(() => {
    return reduxRemainingList.filter((word) => {
      const key = `${word.de}-${word.lessonId}`;
      return !sessionLearnedSet.has(key);
    });
  }, [reduxRemainingList, sessionLearnedSet]);

  const totalRemaining = allRemainingList.length;

  const word = sessionList[index];

  // 💡 ФУНКЦИЯ ДЛЯ ЗАГРУЗКИ НОВОГО БАТЧА
  const loadNewBatch = useCallback(() => {
    // Используем allRemainingList, который уже отфильтрован по sessionLearnedSet
    if (allRemainingList.length > 0) {
      const initialBatch = allRemainingList.slice(0, MAX_SESSION_SIZE);
      setSessionList(initialBatch);
      setIndex(0);
      setInput("");
      setCheckState(null);
      setShowHint(false);
    }
  }, [allRemainingList]);

  // --- Эффекты загрузки и инициализации ---

  // 1. Загружаем урок (Без изменений)
  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  // 2. Инициализация sessionList при загрузке или сбросе
  useEffect(() => {
    if (
      allRemainingList.length > 0 &&
      (sessionList.length === 0 || index === 0)
    ) {
      loadNewBatch();
      setIsLessonFullyComplete(false);
    }

    if (sessionList.length === 0 && allRemainingList.length > 0) {
      setIsLessonFullyComplete(false);
    }

    // 💡 Если allRemainingList стал 0 (например, после последнего успешного ответа),
    // немедленно завершаем урок.
    if (allRemainingList.length === 0 && list && list.length > 0) {
      setIsLessonFullyComplete(true);
    }
  }, [allRemainingList, sessionList.length, index, loadNewBatch, list]);

  // 3. ПРОВЕРКА ЗАВЕРШЕНИЯ БАТЧА И АВТОПЕРЕЗАГРУЗКА
  useEffect(() => {
    if (sessionList.length > 0 && index >= sessionList.length) {
      // Батч закончился
      if (allRemainingList.length > 0) {
        // Есть слова, не отвеченные ЛОКАЛЬНО, загружаем новый батч
        loadNewBatch();
      } else {
        // Нет слов, не отвеченных ЛОКАЛЬНО
        setSessionList([]);
        setIsLessonFullyComplete(true); // ПОЛНОЕ ЗАВЕРШЕНИЕ
      }
    }
  }, [index, sessionList.length, allRemainingList.length, loadNewBatch]);

  // --- Логика переходов и проверки ---

  const advance = (delay = 0) => {
    setTimeout(() => {
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
      setCheckState("correct");

      // 💡 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Отмечаем слово как "выученное" ЛОКАЛЬНО
      const key = `${word.de}-${word.lessonId}`;
      setSessionLearnedSet((prevSet) => {
        const newSet = new Set(prevSet);
        newSet.add(key);
        return newSet;
      });

      advance(1200);
    } else {
      setCheckState("wrong");
      setTimeout(() => setCheckState(null), 1000);
    }
  };

  const handleNext = () => {
    advance(0);
  };

  const handleShowHint = () => {
    if (!showHint) {
      setShowHint(true);
      if (checkState !== "correct") setCheckState("wrong");
    } else {
      setShowHint(false);
      setCheckState(null);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (checkState === "correct") return;

      if (checkState === "wrong" && showHint) {
        handleNext();
      } else {
        handleCheck();
      }
    }
  };

  const handleGoBack = () => {
    navigate(`/lesson/${lessonId}`);
  };

  // 💡 ФУНКЦИЯ: Сброс прогресса (ИСПРАВЛЕНО ДЛЯ СТАБИЛЬНОСТИ)
  const handleRepeatLesson = useCallback(() => {
    if (
      window.confirm(
        "Вы уверены? Это действие удалит прогресс для этого урока ТОЛЬКО в режиме ПИСЬМО."
      )
    ) {
      // Сброс Redux-прогресса
      dispatch(clearLessonProgress({ lessonId, mode: "writing" }));

      // 💡 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Сброс ЛОКАЛЬНОГО прогресса
      setSessionLearnedSet(new Set());

      // Сброс локальных состояний для немедленного выхода из LessonComplete
      setSessionList([]);
      setIndex(0);
      setIsLessonFullyComplete(false); // Гарантируем выход из экрана завершения
    }
  }, [dispatch, lessonId]);

  // --- UI Рендеринг ---

  // 1. Если урок полностью завершен (используем локальный флаг для стабильности)
  if (isLessonFullyComplete)
    return (
      <LessonComplete
        lessonId={lessonId}
        onGoBack={handleGoBack}
        message="Урок полностью завершен!"
        repeatText="Повторить урок полностью (Сбросить прогресс)"
        onRepeat={handleRepeatLesson}
      />
    );

  // 2. Если слово еще не загружено (initial load или переключение батча)
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
      {/* Прогресс-бар с использованием ProgressBar */}
      <ProgressBar
        current={index}
        totalInSession={sessionList.length}
        totalRemaining={totalRemaining}
        roundInfo={`(Слов в батче: ${sessionList.length} / Всего осталось: ${totalRemaining})`}
      />

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
          if (checkState === "wrong" && !showHint) setCheckState(null);
          if (showHint) setShowHint(false);
        }}
        onKeyDown={handleKeyDown}
        className={`rounded-xl p-4 w-full max-w-md text-xl text-center transition-colors duration-200 ${inputClass}`}
        placeholder="Введите немецкое слово..."
        autoFocus
        disabled={checkState === "correct"}
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
