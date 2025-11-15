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
  HiOutlineDownload,
  HiDotsVertical,
} from "react-icons/hi";

// -----------------------------------------------------------
// КОМПОНЕНТ КОНТЕКСТНОГО МЕНЮ
// -----------------------------------------------------------
const LessonMenu = ({ lessonId, onDelete, onExport, onClose }) => {
  useEffect(() => {
    // Закрывает меню при клике вне его
    const handleClickOutside = (event) => {
      // Проверяем, был ли клик внутри самого LessonMenu (по id)
      const menuElement = document.getElementById(`menu-${lessonId}`);
      if (menuElement && !menuElement.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [lessonId, onClose]);

  return (
    <div
      id={`menu-${lessonId}`}
      // 💡 Используем absolute/right-0/top-0 для позиционирования
      className="absolute top-10 right-0 z-30 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
      role="menu"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExport();
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-sky-600 dark:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-600"
        role="menuitem"
      >
        <HiOutlineDownload className="w-5 h-5 mr-2" />
        Экспорт (JSON)
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600"
        role="menuitem"
      >
        <HiTrash className="w-5 h-5 mr-2" />
        Удалить урок
      </button>
    </div>
  );
};
// -----------------------------------------------------------

// --- КОМПОНЕНТ ПОДПИСАННОЙ ПОДСКАЗКИ (Tooltip) - ИСПРАВЛЕННЫЙ 2.0 ---
const TourTooltip = ({ step, totalSteps, onNext, onSkip, targetRef }) => {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Шаги оставлены без изменений (все fixed для стабильности)
  const steps = [
    {
      title: "Добро пожаловать в WordMaster! 🚀",
      text: "Это ваша персональная система для изучения иностранных слов. Вы можете добавлять свои собственные списки слов, а затем повторять их с помощью флешкарт, сопоставления, викторин и других режимов тренировки. Чтобы начать работу, добавьте свой первый урок.",
      positioning: "center",
      isFixed: true,
    },
    {
      title: "Добавление уроков",
      text: "Нажмите на этот плюс, чтобы создать или загрузить новый список слов для изучения.",
      positioning: "top-right-fixed",
      isFixed: true,
    },
    {
      title: "Карточка урока",
      text: "Каждый блок — это отдельный урок. Нажмите, чтобы открыть режимы тренировки.",
      positioning: "center-above",
      isFixed: true,
    },
    {
      title: "Отслеживание прогресса",
      text: "Здесь вы видите, сколько слов вы уже выучили в этом уроке (0/2).",
      positioning: "center-above",
      isFixed: true,
    },
    {
      title: "Меню урока",
      text: "Нажмите на эти три точки, чтобы увидеть опции: 'Удалить урок' или 'Экспорт'.",
      positioning: "center-above", // Направим тултип на меню
      isFixed: true,
    },
  ];

  const currentStep = steps[step];
  const padding = 15;
  const HEADER_HEIGHT = 0;

  useEffect(() => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    let newPos = { top: 0, left: 0 };

    // 1. Шаг 0: Всегда по центру экрана (Fixed)
    if (currentStep.positioning === "center") {
      newPos = {
        top: window.innerHeight / 2 - tooltip.offsetHeight / 2,
        left: window.innerWidth / 2 - tooltip.offsetWidth / 2,
      };
      setPosition(newPos);
      return;
    }

    if (!targetRef.current) return;

    const targetElement = targetRef.current;
    let targetRect = targetElement.getBoundingClientRect();

    // 2. Прокрутка элемента в видимую область, если он вне её
    if (
      targetRect.top < HEADER_HEIGHT ||
      targetRect.bottom > window.innerHeight
    ) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Обязательно пересчитываем позицию после прокрутки
    targetRect = targetElement.getBoundingClientRect();

    // 3. Расчет позиции тултипа (Fixed)
    let finalTop = 0;
    let finalLeft = 0;

    if (currentStep.positioning === "top-right-fixed") {
      finalTop = targetRect.top - tooltip.offsetHeight - padding;
      finalLeft = targetRect.right - tooltip.offsetWidth;
    } else if (currentStep.positioning === "center-above") {
      let potentialTop = targetRect.top - tooltip.offsetHeight - padding;

      if (potentialTop < HEADER_HEIGHT) {
        finalTop = targetRect.bottom + padding;
      } else {
        finalTop = potentialTop;
      }

      finalLeft =
        targetRect.left + targetRect.width / 2 - tooltip.offsetWidth / 2;
    }

    finalLeft = Math.max(padding, finalLeft);
    finalLeft = Math.min(
      window.innerWidth - tooltip.offsetWidth - padding,
      finalLeft
    );

    finalTop = Math.max(HEADER_HEIGHT + padding, finalTop);

    newPos = { top: finalTop, left: finalLeft };

    setPosition(newPos);
  }, [step, currentStep.positioning, targetRef]);

  const overlayStyle = {
    pointerEvents: "auto",
  };

  const tooltipPositionClass = "fixed";

  return (
    // Общий затемняющий фон (fixed)
    <div
      className="fixed inset-0 bg-black/70 z-[100] transition-opacity duration-300"
      style={overlayStyle}
    >
      {/* Сама подсказка */}
      <div
        ref={tooltipRef}
        // 💡 Используем style для динамической установки top/left
        style={{ top: position.top, left: position.left }}
        // 💡 Используем fixed, чтобы тултип не двигался при скролле
        className={`${tooltipPositionClass} w-full max-w-xs p-5 bg-white rounded-xl shadow-2xl z-[101] dark:bg-gray-800 transition-all duration-300`}
      >
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
// --- КОНЕЦ КОМПОНЕНТА TOURTOOLTIP ---

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

// -----------------------------------------------------------
// ГЛАВНЫЙ КОМПОНЕНТ LessonsList
// -----------------------------------------------------------
export default function LessonsList() {
  const wordsState = useSelector((state) => state.words);
  const [lessonsData, setLessonsData] = useState({});
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null); // Состояние для открытого меню

  const targetRefs = {
    initial: useRef(null),
    addButton: useRef(null),
    mokoCard: useRef(null),
    mokoProgress: useRef(null),
    mokoMenu: useRef(null),
  };

  const tourSteps = [
    { name: "initial", ref: targetRefs.initial, isFixed: false },
    { name: "addButton", ref: targetRefs.addButton, isFixed: true },
    { name: "mokoCard", ref: targetRefs.mokoCard, isFixed: false },
    { name: "mokoProgress", ref: targetRefs.mokoProgress, isFixed: false },
    // Обновлен шаг для указания на меню
    { name: "mokoMenu", ref: targetRefs.mokoMenu, isFixed: false },
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
      setOpenMenuId(null); // Закрываем меню при переходе к следующему шагу
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

  // -----------------------------------------------------------
  // НОВАЯ ФУНКЦИЯ: Экспорт урока
  // -----------------------------------------------------------
  const exportSingleLesson = (lessonId, cards) => {
    const exportData = {
      lessonId: lessonId,
      cards: cards,
      meta: {
        app: "WordMaster Lesson Export",
        timestamp: new Date().toISOString(),
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${lessonId}_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Добавим уведомление для пользователя
    console.log(`Урок "${lessonId}" экспортирован как .json файл.`);
    alert(`Урок "${lessonId}" успешно экспортирован! Файл скачан.`);
  };
  // -----------------------------------------------------------

  const lessonIds = Object.keys(lessonsData);

  const currentTargetRef = showTour ? tourSteps[tourStep].ref : null;
  // 💡 Класс для элементов, которые должны быть выделены: relative + высокий z-index
  const highlightClasses = "relative z-[102]";
  // 💡 Класс для иконки меню
  const highlightMenuClasses = "z-[102]";

  const isActive = (ref) => showTour && ref === currentTargetRef;

  return (
    <div
      ref={targetRefs.initial}
      className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
    >
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

      {/* ----------------------------------------------------------- */}
      {/* Сообщение-пояснение для пользователя о новых функциях */}
      {/* ----------------------------------------------------------- */}
      {!localStorage.getItem(TOUR_STORAGE_KEY) && (
        <div className="max-w-4xl mx-auto p-4 mb-6 bg-blue-100 dark:bg-gray-700 rounded-lg text-blue-800 dark:text-blue-300 border border-blue-300">
          👋 **Добро пожаловать!** Обратите внимание: теперь в карточке каждого
          урока есть **меню (три точки)**, где вы найдете опции **"Удалить
          урок"** и **"Экспорт (JSON)"** для создания резервной копии слов.
        </div>
      )}
      {/* ----------------------------------------------------------- */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {lessonIds.map((lessonId, index) => {
          const progress = getProgress(lessonId);
          const isComplete = progress.isComplete;
          const isMoko = lessonId === "moko";

          return (
            // 💡 Весь блок должен быть relative для позиционирования меню
            <div key={lessonId} className={`relative`}>
              {/* Кнопка меню (Три точки) */}
              <div
                ref={isMoko ? targetRefs.mokoMenu : null}
                className={`absolute top-2 right-2 z-20 ${
                  isMoko && isActive(targetRefs.mokoMenu)
                    ? highlightMenuClasses
                    : ""
                }`}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === lessonId ? null : lessonId);
                  }}
                  className="p-1 rounded-full bg-white/70 dark:bg-gray-700/70 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                  title="Опции урока"
                >
                  <HiDotsVertical className="w-6 h-6" />
                </button>

                {/* Контекстное меню */}
                {openMenuId === lessonId && (
                  <LessonMenu
                    lessonId={lessonId}
                    onDelete={() => handleDeleteLesson(lessonId)}
                    onExport={() =>
                      exportSingleLesson(lessonId, lessonsData[lessonId])
                    }
                    onClose={() => setOpenMenuId(null)}
                  />
                )}
              </div>

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
