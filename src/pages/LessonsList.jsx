import { useSelector } from "react-redux";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { loadLessons, saveLessons } from "../data/lessons-storage";
import {
  HiOutlineBookOpen,
  HiArrowRight,
  HiCheckCircle,
  HiPlus,
  HiTrash,
  HiX,
  HiOutlineChevronRight,
} from "react-icons/hi";

// --- КОМПОНЕНТ ПОДПИСАННОЙ ПОДСКАЗКИ (Tooltip) ---
const TourTooltip = ({ step, totalSteps, onNext, onSkip, targetRef }) => {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowClass, setArrowClass] = useState("hidden");

  const steps = [
    // Шаг 0: Общая информация (center)
    {
      title: "Добро пожаловать в WordMaster! 🚀",
      text: "Это ваша персональная система для изучения иностранных слов. Вы можете добавлять свои собственные списки слов, а затем повторять их с помощью флешкарт, сопоставления, викторин и других режимов тренировки. Чтобы начать работу, добавьте свой первый урок.",
      positioning: "center",
    },
    // Шаг 1: Кнопка Плюс (top-right, fixed)
    {
      title: "Добавление уроков",
      text: "Нажмите на этот плюс, чтобы создать или загрузить новый список слов для изучения.",
      positioning: "top-right",
      isFixed: true,
    },
    // Шаг 2: Карточка урока (bottom-center)
    {
      title: "Карточка урока",
      text: "Каждый блок — это отдельный урок. Нажмите, чтобы открыть режимы тренировки.",
      positioning: "bottom-center",
    },
    // Шаг 3: Прогресс (bottom-center)
    {
      title: "Отслеживание прогресса",
      text: "Здесь вы видите, сколько слов вы уже выучили в этом уроке (0/2).",
      positioning: "bottom-center",
    },
    // Шаг 4: Удаление (top-right-icon)
    {
      title: "Удаление урока",
      text: "Используйте эту иконку, чтобы удалить урок и весь связанный с ним прогресс.",
      positioning: "top-right-icon",
    },
  ];

  const currentStep = steps[step];
  const isMobile = window.innerWidth < 640;

  // 💡 ЭФФЕКТ ДЛЯ РАСЧЕТА ПОЗИЦИИ ПОДСКАЗКИ
  useEffect(() => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const padding = 15;

    let newPos = { top: 0, left: 0 };
    let newArrow = "hidden";

    // Шаг 0: Центрирование
    if (currentStep.positioning === "center") {
      newPos = {
        top: window.innerHeight / 2 - tooltip.offsetHeight / 2,
        left: window.innerWidth / 2 - tooltip.offsetWidth / 2,
      };
      setPosition(newPos);
      setArrowClass("hidden");
      return;
    }

    if (!targetRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();

    // 1. Прокрутка к элементу (только если элемент не фиксирован)
    if (!currentStep.isFixed) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (isMobile) {
      // --- АДАПТИВНАЯ ЛОГИКА ДЛЯ МОБИЛЬНЫХ ---
      let topPosition = targetRect.top - tooltip.offsetHeight - padding;
      newArrow = "bottom-[-8px] left-[50%] -translate-x-1/2 rotate-45";

      if (topPosition < 0 || targetRect.top < window.innerHeight / 2) {
        topPosition = targetRect.bottom + padding;
        newArrow = "top-[-8px] left-[50%] -translate-x-1/2 -rotate-45";
      }

      newPos = {
        top: topPosition,
        left: window.innerWidth / 2 - tooltip.offsetWidth / 2,
      };

      // Коррекция, чтобы подсказка не вышла за края
      newPos.left = Math.max(padding, newPos.left);
      newPos.left = Math.min(
        window.innerWidth - tooltip.offsetWidth - padding,
        newPos.left
      );
    } else {
      // --- ЛОГИКА ДЛЯ ДЕСКТОПА ---

      switch (currentStep.positioning) {
        case "top-right":
          // 💡 Исправление позиционирования стрелки для кнопки "+"
          newPos = {
            top: targetRect.top - tooltip.offsetHeight - padding,
            left: targetRect.right - tooltip.offsetWidth,
          };
          // Стрелка должна указывать на центр кнопки "+"
          newArrow = `bottom-[-8px] right-[${
            targetRect.width / 2 - 6
          }px] rotate-45`;
          break;
        case "top-right-icon":
          // Кнопка удаления
          newPos = {
            top: targetRect.top - tooltip.offsetHeight - padding,
            left: targetRect.right - tooltip.offsetWidth,
          };
          newArrow = "bottom-[-8px] right-5 rotate-45";
          break;
        case "bottom-left":
          newPos = { top: targetRect.bottom + padding, left: targetRect.left };
          newArrow = "top-[-8px] left-5 -rotate-45";
          break;
        case "bottom-center":
          newPos = {
            top: targetRect.bottom + padding,
            left:
              targetRect.left + targetRect.width / 2 - tooltip.offsetWidth / 2,
          };
          newArrow = "top-[-8px] left-[50%] -translate-x-1/2 -rotate-45";
          break;
        default:
          newPos = { top: targetRect.bottom + padding, left: targetRect.left };
          newArrow = "top-[-8px] left-5 -rotate-45";
      }

      // Коррекция, чтобы подсказка не вышла за края
      newPos.left = Math.max(padding, newPos.left);
      newPos.left = Math.min(
        window.innerWidth - tooltip.offsetWidth - padding,
        newPos.left
      );

      // Учитываем прокрутку ТОЛЬКО для не-фиксированных элементов
      if (!currentStep.isFixed) {
        newPos.top += window.scrollY;
      }
    }

    setPosition(newPos);
    setArrowClass(newArrow);
  }, [step, currentStep.positioning, targetRef, isMobile, currentStep.isFixed]);

  return (
    // Общий затемняющий фон
    <div className="fixed inset-0 bg-black/70 z-[100] transition-opacity duration-300 pointer-events-none">
      {/* Сама подсказка */}
      <div
        ref={tooltipRef}
        style={{ top: position.top, left: position.left }}
        className="absolute w-full max-w-xs p-5 bg-white rounded-xl shadow-2xl z-[101] pointer-events-auto dark:bg-gray-800 transition-all duration-300"
      >
        {/* Стрелка-указатель */}
        <div
          className={`absolute w-3 h-3 bg-white dark:bg-gray-800 transform ${arrowClass}`}
        />

        <button
          onClick={onSkip}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Пропустить тур"
        >
          <HiX className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-2">
          {currentStep.title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm whitespace-pre-line">
          {currentStep.text}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Шаг {step + 1} из {totalSteps}
          </span>
          <div className="space-x-2">
            {step < totalSteps - 1 && (
              <button
                onClick={onSkip}
                className="px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Пропустить
              </button>
            )}
            <button
              onClick={onNext}
              className="px-3 py-1.5 text-sm font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition flex items-center"
            >
              {step === totalSteps - 1 ? "Готово" : "Далее"}
              <HiOutlineChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// Функции и моки (без изменений)
const getUniqueLearnedWords = (wordsState) => {
  const allWords = [
    ...wordsState.learnedFlashcards,
    ...wordsState.learnedMatching,
    ...wordsState.learnedQuiz,
    ...wordsState.learnedWriting,
  ];
  const uniqueWordsMap = new Map();
  allWords.forEach((word) => {
    const key = `${word.de}-${word.lessonId}`;
    if (!uniqueWordsMap.has(key)) uniqueWordsMap.set(key, word);
  });
  return Array.from(uniqueWordsMap.values());
};

const mockLessons = {
  moko: [
    {
      de: "der Gast",
      ru: "гость",
      exde: "Der Gast kommt heute Abend an.",
      exru: "Гость прибывает сегодня вечером.",
      distractors: ["Haus", "isst"],
    },
    {
      de: "der Job",
      ru: "работа",
      exde: "Er sucht einen neuen Job in Berlin.",
      exru: "Он ищет новую работу в Берлине.",
      distractors: ["alt", "trinkt"],
    },
  ],
};

const TOUR_STORAGE_KEY = "hasSeenLessonsTour";

export default function LessonsList() {
  const wordsState = useSelector((state) => state.words);
  const [lessonsData, setLessonsData] = useState({});
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const targetRefs = {
    initial: useRef(null),
    addButton: useRef(null),
    mokoCard: useRef(null),
    mokoProgress: useRef(null),
    mokoDelete: useRef(null),
  };

  const tourSteps = [
    { name: "initial", ref: targetRefs.initial, isFixed: false },
    { name: "addButton", ref: targetRefs.addButton, isFixed: true },
    { name: "mokoCard", ref: targetRefs.mokoCard, isFixed: false },
    { name: "mokoProgress", ref: targetRefs.mokoProgress, isFixed: false },
    { name: "mokoDelete", ref: targetRefs.mokoDelete, isFixed: false },
  ];

  useEffect(() => {
    let saved = loadLessons();
    const hasSeenTour = localStorage.getItem(TOUR_STORAGE_KEY);

    if (!saved || Object.keys(saved).length === 0) {
      saveLessons(mockLessons);
      saved = mockLessons;
      if (!hasSeenTour) {
        setShowTour(true);
      }
    } else if (!hasSeenTour) {
      setShowTour(true);
    }

    setLessonsData(saved);
  }, []);

  const handleTourComplete = useCallback(() => {
    setShowTour(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  }, []);

  const handleNextStep = useCallback(() => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep((s) => s + 1);
    } else {
      handleTourComplete();
    }
  }, [tourStep, tourSteps.length, handleTourComplete]);

  const allUniqueLearned = getUniqueLearnedWords(wordsState);

  const getProgress = (lessonId) => {
    const allWords = lessonsData[lessonId] ? lessonsData[lessonId].length : 0;
    const learnedCount = allUniqueLearned.filter(
      (w) => w.lessonId === lessonId
    ).length;

    return {
      learned: learnedCount,
      total: allWords,
      isComplete: allWords > 0 && learnedCount === allWords,
    };
  };

  const handleDeleteLesson = (lessonId) => {
    const confirmDelete = window.confirm(
      `Вы уверены, что хотите удалить урок "${lessonId}"?`
    );
    if (!confirmDelete) return;

    const updatedLessons = { ...lessonsData };
    delete updatedLessons[lessonId];
    setLessonsData(updatedLessons);
    saveLessons(updatedLessons);
  };

  const lessonIds = Object.keys(lessonsData);

  const currentTargetRef = showTour ? tourSteps[tourStep].ref : null;
  // 💡 Класс для элементов, которые должны быть выделены: relative + высокий z-index
  const highlightClasses = "relative z-[102]";
  // 💡 Класс для иконки удаления: только высокий z-index
  const highlightIconClasses = "z-[102]";

  const isActive = (ref) => showTour && ref === currentTargetRef;

  return (
    <div
      ref={targetRefs.initial}
      className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
    >
      <h1
        className={`text-3xl font-extrabold text-center text-gray-800 mb-6 sm:mb-8 dark:text-gray-100 ${
          isActive(targetRefs.title) ? highlightClasses : ""
        }`}
      >
        Выберите урок
      </h1>

      {/* Кнопка добавления урока (fixed) */}
      <Link
        ref={targetRefs.addButton}
        to="/add-lesson"
        className={`fixed bottom-25 right-6 sm:bottom-26 sm:right-8 
             bg-sky-600 text-white w-14 h-14 flex items-center justify-center 
             rounded-full text-3xl font-light shadow-2xl 
             hover:bg-sky-700 active:scale-95 transition duration-150 add-lesson-button z-[102]`}
        title="Добавить новый урок"
        aria-label="Добавить новый урок"
      >
        <HiPlus className="w-8 h-8" />
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {lessonIds.map((lessonId, index) => {
          const progress = getProgress(lessonId);
          const isComplete = progress.isComplete;
          const isMoko = lessonId === "moko";

          return (
            <div key={lessonId} className={`relative`}>
              {/* Кнопка удаления */}
              <button
                ref={isMoko ? targetRefs.mokoDelete : null}
                onClick={() => handleDeleteLesson(lessonId)}
                // 💡 Применяем z-index, но без relative, чтобы не сбивать absolute позицию
                className={`absolute top-3 right-3 p-1 rounded-full bg-white/70 dark:bg-gray-700/70 text-red-500 hover:text-red-700 z-20 transition ${
                  isMoko && isActive(targetRefs.mokoDelete)
                    ? highlightIconClasses
                    : ""
                }`}
                title="Удалить урок"
                aria-label={`Удалить урок ${lessonId}`}
              >
                <HiTrash className="w-5 h-5" />
              </button>

              <Link
                ref={isMoko ? targetRefs.mokoCard : null}
                to={`/lesson/${lessonId}`}
                className={`
                  flex items-center justify-between
                  p-5 bg-white rounded-xl shadow-lg 
                  transition duration-300 ease-in-out
                  transform hover:scale-[1.02] hover:shadow-xl
                  dark:bg-gray-800 dark:shadow-2xl dark:border-gray-700
                  border-l-4 
                  ${
                    isComplete
                      ? "border-green-500 hover:border-green-600"
                      : "border-sky-500 hover:border-sky-600"
                  }
                  ${
                    isMoko && isActive(targetRefs.mokoCard)
                      ? highlightClasses
                      : ""
                  } 
                `}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      isComplete
                        ? "bg-green-100 dark:bg-green-800"
                        : "bg-sky-100 dark:bg-sky-800"
                    }`}
                  >
                    {isComplete ? (
                      <HiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <HiOutlineBookOpen className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    )}
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      карточка {index + 1}
                    </span>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-50">
                      {lessonId.toUpperCase()}
                    </p>

                    <div
                      ref={isMoko ? targetRefs.mokoProgress : null}
                      className={`mt-1 flex items-center text-xs ${
                        isMoko && isActive(targetRefs.mokoProgress)
                          ? highlightClasses
                          : ""
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          isComplete
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {progress.learned} / {progress.total}
                      </span>
                      <div className="w-20 ml-2 bg-gray-200 rounded-full h-1 dark:bg-gray-700">
                        <div
                          className={`${
                            isComplete ? "bg-green-500" : "bg-sky-500"
                          } h-1 rounded-full`}
                          style={{
                            width: `${
                              (progress.learned / progress.total) * 100 || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <HiArrowRight className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* РЕНДЕРИНГ ТУРА */}
      {showTour && (
        <TourTooltip
          step={tourStep}
          totalSteps={tourSteps.length}
          onNext={handleNextStep}
          onSkip={handleTourComplete}
          targetRef={currentTargetRef}
        />
      )}
    </div>
  );
}
