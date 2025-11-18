import { useSelector } from "react-redux";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// ⚠️ Предполагается, что mockLessons теперь в новом формате: { moko: { lang: 'de', cards: [...] } }
import { mockLessons } from "../data/mockLessons";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

// 💡 Глобальные константы
const SUPPORTED_TTS_LANGS = [
  "без TTS",
  "de",
  "en",
  "ko",
  "ar",
  "es",
  "fr",
  "it",
  "ja",
  "ru",
  "zh",
];
const LANG_STORAGE_KEY = "selectedTtsLang";
const VOICE_STORAGE_KEY = "selectedTtsVoiceName";
const TOUR_STORAGE_KEY = "hasSeenLessonsTour";

// -----------------------------------------------------------
// КОМПОНЕНТ КОНТЕКСТНОГО МЕНЮ (LessonMenu)
// -----------------------------------------------------------
const LessonMenu = ({ lessonId, onDelete, onExport, onEdit, onClose }) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuElement = document.getElementById(`menu-${lessonId}`);
      const dotsButton = document.querySelector(`[data-menu-id="${lessonId}"]`);

      if (
        menuElement &&
        !menuElement.contains(event.target) &&
        (!dotsButton || !dotsButton.contains(event.target))
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [lessonId, onClose]);

  return (
    <div
      id={`menu-${lessonId}`}
      className="absolute top-10 right-0 z-30 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
      role="menu"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-sky-600 dark:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-600"
        role="menuitem"
      >
        <HiArrowRight className="w-5 h-5 mr-2 transform rotate-180" />
        Изменить
      </button>

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
// КОМПОНЕНТ МОДАЛЬНОГО ОКНА: Выбор языка для нового урока (AddLessonLangModal)
// -----------------------------------------------------------
const AddLessonLangModal = ({ onClose, onLangSelected }) => {
  const defaultLang = useMemo(() => {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
    return savedLang && SUPPORTED_TTS_LANGS.includes(savedLang)
      ? savedLang
      : SUPPORTED_TTS_LANGS[0];
  }, []);

  const [selectedLang, setSelectedLang] = useState(defaultLang);

  const handleConfirm = () => {
    if (selectedLang) {
      onLangSelected(selectedLang);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-4 flex items-center">
          <HiPlus className="w-6 h-6 mr-2" />
          Выберите язык для нового урока
        </h3>

        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Выберите основной язык, на котором вы будете изучать слова в новом
          уроке.
        </p>

        <div className="mb-6">
          <label
            htmlFor="new-lesson-lang"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Язык:
          </label>
          <select
            id="new-lesson-lang"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            {SUPPORTED_TTS_LANGS.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-gray-800 dark:text-gray-100 font-bold transition duration-200"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 p-3 bg-sky-600 hover:bg-sky-700 rounded-xl text-white font-bold transition duration-200 shadow-lg"
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
};
// -----------------------------------------------------------

// --- КОМПОНЕНТ ПОДПИСАННОЙ ПОДСКАЗКИ (TourTooltip) ---
const TourTooltip = ({ step, totalSteps, onNext, onSkip, targetRef }) => {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

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
      isFixed: false,
    },
    {
      title: "Отслеживание прогресса",
      text: "Здесь вы видите, сколько слов вы уже выучили в этом уроке (0/2).",
      positioning: "center-above",
      isFixed: false,
    },
    {
      title: "Меню урока",
      text: "Нажмите на эти три точки, чтобы увидеть опции: 'Удалить урок' или 'Экспорт'.",
      positioning: "center-above",
      isFixed: false,
    },
  ];

  const currentStep = steps[step];
  const padding = 15;
  const HEADER_HEIGHT = 0;

  useEffect(() => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    let newPos = { top: 0, left: 0 };

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

    if (
      targetRect.top < HEADER_HEIGHT ||
      targetRect.bottom > window.innerHeight
    ) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    targetRect = targetElement.getBoundingClientRect();

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

  const tooltipPositionClass = "fixed";

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[100] transition-opacity duration-300"
      style={{ pointerEvents: "auto" }}
    >
      <div
        ref={tooltipRef}
        style={{ top: position.top, left: position.left }}
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
// -----------------------------------------------------------

// -----------------------------------------------------------
// ФУНКЦИЯ: getUniqueLearnedWords
// -----------------------------------------------------------
const getUniqueLearnedWords = (progressState) => {
  const {
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  } = progressState;

  const allWords = [
    ...learnedFlashcards,
    ...learnedMatching,
    ...learnedQuiz,
    ...learnedWriting,
    ...(learnedSentencePuzzle || []), // 💡 Безопасное чтение
  ];

  const uniqueWordsMap = new Map();
  allWords.forEach((word) => {
    // Ключ должен быть максимально уникальным: слово + перевод + lessonId
    const key = `${word.de}-${word.ru}-${word.lessonId}`;
    if (!uniqueWordsMap.has(key)) uniqueWordsMap.set(key, word);
  });
  return Array.from(uniqueWordsMap.values());
};

// -----------------------------------------------------------
// ГЛАВНЫЙ КОМПОНЕНТ LessonsList
// -----------------------------------------------------------
export default function LessonsList() {
  const navigate = useNavigate();
  const progressState = useSelector((state) => state.words.progress);

  const [lessonsData, setLessonsData] = useState({});
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [showAddLessonModal, setShowAddLessonModal] = useState(false);

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
    { name: "mokoMenu", ref: targetRefs.mokoMenu, isFixed: false },
  ];

  useEffect(() => {
    let saved = loadLessons();
    const hasSeenTour = localStorage.getItem(TOUR_STORAGE_KEY);
    let initialLessons = {};
    let needsMigration = false;

    // 1. ПЕРВАЯ ЗАГРУЗКА ИЛИ ПУСТОЙ LOCALSTORAGE: Используем новый mockLessons
    if (!saved || Object.keys(saved).length === 0) {
      // 🟢 ИСПРАВЛЕНО: Используем mockLessons напрямую, так как они уже в нужном формате
      initialLessons = mockLessons;
      saveLessons(initialLessons);
      saved = initialLessons;

      if (!hasSeenTour) {
        setShowTour(true);
      }
    } else {
      // 2. МИГРАЦИЯ СТАРЫХ ДАННЫХ В LOCALSTORAGE
      const migratedLessons = {};
      for (const id in saved) {
        // Если значением является массив, это старый формат
        if (Array.isArray(saved[id])) {
          migratedLessons[id] = {
            lang: id === "moko" ? "de" : SUPPORTED_TTS_LANGS[0],
            cards: saved[id],
          };
          needsMigration = true;
        } else {
          // Если это уже объект, сохраняем его, но гарантируем наличие 'cards' и 'lang'
          migratedLessons[id] = {
            ...saved[id],
            cards: saved[id].cards || [],
            lang: saved[id].lang || SUPPORTED_TTS_LANGS[0],
          };
        }
      }

      if (needsMigration) {
        saveLessons(migratedLessons);
        saved = migratedLessons;
      }

      // Если уроки уже есть, но тур не виден, показываем тур
      if (!hasSeenTour) {
        setShowTour(true);
      }
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
      setOpenMenuId(null);
    } else {
      handleTourComplete();
    }
  }, [tourStep, tourSteps.length, handleTourComplete]);

  // Убедимся, что progressState.words существует, прежде чем вызывать getUniqueLearnedWords
  const allUniqueLearned = useMemo(() => {
    if (
      !progressState ||
      !Object.keys(progressState).some((key) =>
        Array.isArray(progressState[key])
      )
    )
      return [];
    return getUniqueLearnedWords(progressState);
  }, [progressState]);

  const getProgress = (lessonId) => {
    const lesson = lessonsData[lessonId];
    // 🟢 ИСПРАВЛЕНИЕ: Безопасное чтение lesson.cards.length
    const allWords = lesson && lesson.cards ? lesson.cards.length : 0;

    // Фильтрация выученных слов по lessonId
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
    const lessonTitle = lessonsData[lessonId]?.lang
      ? `${lessonId.toUpperCase()} (${lessonsData[
          lessonId
        ].lang.toUpperCase()})`
      : lessonId;

    const confirmDelete = window.confirm(
      `Вы уверены, что хотите удалить урок "${lessonTitle}"?`
    );
    if (!confirmDelete) return;

    const updatedLessons = { ...lessonsData };
    delete updatedLessons[lessonId];
    setLessonsData(updatedLessons);
    saveLessons(updatedLessons);
  };

  const handleEditLesson = (lessonId) => {
    const lessonLang = lessonsData[lessonId]?.lang;
    navigate(`/add-lesson/${lessonId}`, { state: { ttsLang: lessonLang } });
    setOpenMenuId(null);
  };

  const exportSingleLesson = (lessonId, lessonData) => {
    const exportData = {
      lessonId: lessonId,
      lang: lessonData.lang,
      cards: lessonData.cards,
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

    console.log(`Урок "${lessonId}" экспортирован как .json файл.`);
    alert(`Урок "${lessonId}" успешно экспортирован! Файл скачан.`);
  };

  const handleCardClick = (lessonId) => {
    const lessonLang = lessonsData[lessonId]?.lang;
    navigate(`/lesson/${lessonId}`, { state: { ttsLang: lessonLang } });
  };

  const handleLangSelectAndNavigate = (selectedLang) => {
    setShowAddLessonModal(false);

    // 🔴 УДАЛЕНО: Сохранение в Local Storage (LANG_STORAGE_KEY)
    // if (SUPPORTED_TTS_LANGS.includes(selectedLang)) {
    //   localStorage.setItem(LANG_STORAGE_KEY, selectedLang);
    //   localStorage.removeItem(VOICE_STORAGE_KEY);
    // }

    // Передаем выбранный язык как state для использования на AddLessonPage
    // В Local Storage сохраняется только язык для следующего НОВОГО урока,
    // но не здесь, чтобы не влиять на уже существующие уроки.
    navigate("/add-lesson", { state: { ttsLang: selectedLang } });
  };

  const lessonIds = Object.keys(lessonsData);

  const currentTargetRef = showTour ? tourSteps[tourStep].ref : null;
  const highlightClasses = "relative z-[102]";
  const highlightMenuClasses = "z-[102]";

  const isActive = (ref) => showTour && ref === currentTargetRef;

  return (
    <div
      ref={targetRefs.initial}
      // 💡 Добавлен отступ снизу, чтобы скрыть кнопку добавления (HiPlus)
      className="p-4 sm:p-6 pb-24 sm:pb-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen"
    >
      {/* Кнопка добавления урока (fixed) */}
      <button
        ref={targetRefs.addButton}
        onClick={() => setShowAddLessonModal(true)}
        className={`fixed bottom-16 right-6 sm:bottom-8 sm:right-8 
             bg-sky-600 text-white w-14 h-14 flex items-center justify-center 
             rounded-full text-3xl font-light shadow-2xl 
             hover:bg-sky-700 active:scale-95 transition duration-150 add-lesson-button z-[102]`}
        title="Добавить новый урок"
        aria-label="Добавить новый урок"
      >
        <HiPlus className="w-8 h-8" />
      </button>

      {/* Сообщение-пояснение для пользователя о новых функциях */}
      {!localStorage.getItem(TOUR_STORAGE_KEY) && (
        <div className="max-w-4xl mx-auto p-4 mb-6 bg-blue-100 dark:bg-gray-700 rounded-lg text-blue-800 dark:text-blue-300 border border-blue-300">
          👋 **Добро пожаловать!** Обратите внимание: теперь в карточке каждого
          урока есть **меню (три точки)**, где вы найдете опции **"Изменить"**,
          **"Удалить урок"** и **"Экспорт (JSON)"** для создания резервной копии
          слов.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {lessonIds.map((lessonId) => {
          const progress = getProgress(lessonId);
          const isComplete = progress.isComplete;
          const isMoko = lessonId === "moko";
          const lesson = lessonsData[lessonId];
          const lessonLang = lesson?.lang || "N/A";

          if (!lesson) return null;

          return (
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
                  data-menu-id={lessonId}
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
                    onExport={() => exportSingleLesson(lessonId, lesson)}
                    onEdit={() => handleEditLesson(lessonId)}
                    onClose={() => setOpenMenuId(null)}
                  />
                )}
              </div>

              {/* КАРТОЧКА УРОКА: div с onClick для прямой навигации */}
              <div
                ref={isMoko ? targetRefs.mokoCard : null}
                onClick={() => handleCardClick(lessonId)}
                className={`
                  flex items-center justify-between
                  p-5 bg-white rounded-xl shadow-lg 
                  transition duration-300 ease-in-out
                  transform hover:scale-[1.02] hover:shadow-xl
                  dark:bg-gray-800 dark:shadow-2xl dark:border-gray-700
                  border-l-4 
                  cursor-pointer
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
                aria-label={`Начать урок ${lessonId.toUpperCase()}`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${
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
                      Урок {lessonId.toUpperCase()}
                    </span>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-50">
                      Язык: {lessonLang.toUpperCase()}
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
              </div>
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

      {/* РЕНДЕРИНГ МОДАЛЬНОГО ОКНА ВЫБОРА ЯЗЫКА (для кнопки "+") */}
      {showAddLessonModal && (
        <AddLessonLangModal
          onClose={() => setShowAddLessonModal(false)}
          onLangSelected={handleLangSelectAndNavigate}
        />
      )}
    </div>
  );
}
