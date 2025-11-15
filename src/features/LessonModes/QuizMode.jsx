import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  markLearned,
  selectLesson,
  clearLessonProgress,
} from "../../store/store";
import { lessons } from "../../data";
import {
  HiCheck,
  HiX,
  HiArrowRight,
  HiArrowLeft,
  HiOutlineRefresh,
} from "react-icons/hi";
import LessonComplete from "../../components/LessonComplete";
// 🆕 ИМПОРТ: AudioPlayer для озвучивания
import AudioPlayer from "../../components/AudioPlayer";

const MAX_SESSION_SIZE = 15;
const LANG_STORAGE_KEY = "selectedTtsLang";
const VOICE_STORAGE_KEY = "selectedTtsVoiceName";

// ❌ УДАЛЕНО: ALL_MODES не используется в QuizMode

export default function QuizMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    list,
    learnedFlashcards,
    learnedMatching,
    learnedQuiz, // <-- Единственное состояние, которое мы используем для фильтрации
    learnedWriting,
    learnedSentencePuzzle,
  } = useSelector((state) => state.words);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);
  const [sessionList, setSessionList] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [restartCount, setRestartCount] = useState(0);
  const [wordsToReview, setWordsToReview] = useState([]);

  // 1. 💡 ЛОГИКА TTS: ЧТЕНИЕ НАСТРОЕК
  const activeLangCode = useMemo(() => {
    return localStorage.getItem(LANG_STORAGE_KEY) || "de";
  }, []);

  const savedVoiceName = useMemo(() => {
    return localStorage.getItem(VOICE_STORAGE_KEY) || "";
  }, []);

  const [voices, setVoices] = useState([]);
  const [selectedWordVoice, setSelectedWordVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    if (voices.length > 0) {
      let voiceFound = null;
      if (savedVoiceName) {
        voiceFound = voices.find(
          (v) => v.name === savedVoiceName && v.lang.startsWith(activeLangCode)
        );
      }
      if (!voiceFound) {
        const defaultVoice = voices.find((v) =>
          v.lang.startsWith(activeLangCode)
        );
        voiceFound = defaultVoice || null;
      }
      setSelectedWordVoice(voiceFound);
    }
  }, [voices, activeLangCode, savedVoiceName]);
  // 🛑 ИСПРАВЛЕНИЕ: Функция для получения оставшихся слов, фильтруем ТОЛЬКО по learnedQuiz
  const getRemainingList = useCallback(() => {
    // 1. Создаем Set выученных слов ТОЛЬКО ИЗ РЕЖИМА QUIZ
    const learnedSet = new Set();
    learnedQuiz.forEach((w) => learnedSet.add(`${w.de}-${w.lessonId}`));

    // 2. Фильтруем list: оставляем только те слова, которых НЕТ в learnedQuiz
    return (
      list?.filter((word) => {
        const key = `${word.de}-${word.lessonId}`;
        // Теперь слово исключается, только если оно выучено В РЕЖИМЕ QUIZ
        return word.lessonId === lessonId && !learnedSet.has(key);
      }) || []
    );
  }, [
    list,
    learnedQuiz, // <-- В зависимости оставляем только learnedQuiz
    lessonId,
  ]);

  const allRemainingList = useMemo(
    () => getRemainingList(),
    [getRemainingList]
  );
  const totalRemaining = allRemainingList.length;

  const loadNextBatch = useCallback(() => {
    const reviewBatch = wordsToReview;
    const needNewWords = MAX_SESSION_SIZE - reviewBatch.length;

    // Исключаем слова для повторения из общего списка невыученных
    const remainingForNewBatch = allRemainingList.filter(
      (word) => !reviewBatch.some((r) => r.de === word.de)
    );

    const newWordsBatch = remainingForNewBatch.slice(0, needNewWords);
    const nextSessionList = [...reviewBatch, ...newWordsBatch].sort(
      () => Math.random() - 0.5
    );

    if (nextSessionList.length > 0) {
      setSessionList(nextSessionList);
      setIndex(0);
      setIsSessionComplete(false);
      setWordsToReview([]);
      setRestartCount((prev) => prev + 1);
    }
  }, [allRemainingList, wordsToReview]);

  const handleRestartSession = useCallback(() => {
    setIsSessionComplete(false);
    setIndex(0);
    setSessionList(allRemainingList.slice(0, MAX_SESSION_SIZE));
    setWordsToReview([]);
  }, [allRemainingList]);

  const handleRepeatLesson = () => {
    if (
      window.confirm(
        "Вы уверены? Это действие удалит прогресс для этого урока ТОЛЬКО в режиме ВИКТОРИНА."
      )
    ) {
      dispatch(clearLessonProgress({ lessonId, mode: "quiz" }));
      handleGoBack();
    }
  };

  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  useEffect(() => {
    if (allRemainingList.length > 0 && sessionList.length === 0) {
      loadNextBatch();
    }
  }, [allRemainingList, loadNextBatch, sessionList.length]);

  const current = sessionList[index] || null;

  // 2. 💡 ЛОГИКА TTS: АВТОМАТИЧЕСКОЕ ОЗВУЧИВАНИЕ ПРИ СМЕНЕ СЛОВА
  useEffect(() => {
    if (current && selectedWordVoice) {
      try {
        const utterance = new SpeechSynthesisUtterance(current.de);
        utterance.lang = selectedWordVoice.lang;
        utterance.voice = selectedWordVoice;
        utterance.rate = 0.8; // Немного медленнее, чтобы было понятнее
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("TTS failed:", e);
      }
    }
    // Озвучивание происходит при смене 'current' и при готовности 'selectedWordVoice'
  }, [current, selectedWordVoice]);

  useEffect(() => {
    if (sessionList.length > 0 && index >= sessionList.length) {
      setIsSessionComplete(true);
      setIndex(sessionList.length);
      setSelected(null);
    }
  }, [index, sessionList.length]);

  useEffect(() => {
    if (!current) {
      setOptions([]);
      return;
    }
    const allWords = list.filter((w) => w.lessonId === lessonId);
    const pool = allWords.filter((w) => w.de !== current.de);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [...shuffled, current].sort(() => Math.random() - 0.5);
    setOptions(opts);
    setSelected(null);
  }, [current, list, lessonId]);

  const advance = useCallback((delay = 500) => {
    setTimeout(() => {
      setIndex((i) => i + 1);
      setSelected(null);
    }, delay);
  }, []);

  const handleSelect = (opt) => {
    if (selected) return;

    // 🛑 ОСТАНОВКА: Останавливаем автоматическое озвучивание при выборе ответа
    window.speechSynthesis.cancel();

    setSelected(opt);

    if (opt.de === current.de) {
      // 💡 markLearned сработает только для learnedQuiz
      dispatch(markLearned({ word: current, mode: "quiz" }));
      advance(1000);
    } else {
      setWordsToReview((prev) => [...prev, current]);
      advance(1000); // Переходим дальше после показа ошибки
    }
  };

  const handleKnow = () => {
    if (current) {
      // 🛑 ОСТАНОВКА: Останавливаем автоматическое озвучивание
      window.speechSynthesis.cancel();

      // 💡 markLearned сработает только для learnedQuiz
      dispatch(markLearned({ word: current, mode: "quiz" }));
      advance(0);
    }
  };

  const handleDontKnow = () => {
    // 🛑 ОСТАНОВКА: Останавливаем автоматическое озвучивание
    window.speechSynthesis.cancel();

    setWordsToReview((prev) => [...prev, current]);
    advance(0);
  };

  const handleGoBack = () => {
    // 🛑 ОСТАНОВКА: Останавливаем автоматическое озвучивание при выходе
    window.speechSynthesis.cancel();
    navigate(`/lesson/${lessonId}`);
  };

  if (totalRemaining === 0)
    return (
      <LessonComplete
        lessonId={lessonId}
        onGoBack={handleGoBack}
        onRepeat={handleRepeatLesson}
      />
    );

  if (isSessionComplete) {
    const nextRemaining = allRemainingList.length;

    // 🛑 ОСТАНОВКА: Если сессия завершена, отменяем любые активные TTS
    window.speechSynthesis.cancel();

    return (
      <div className="p-12 text-center text-gray-800 dark:text-gray-50 bg-gray-50 min-h-[50vh] dark:bg-gray-900 transition-colors duration-300 w-full max-w-lg mx-auto rounded-xl shadow-lg mt-10">
        <h2 className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 mb-4">
          Сессия завершена!
        </h2>

        {wordsToReview.length > 0 && (
          <p className="text-red-500 font-bold mb-4">
            {wordsToReview.length} слов(а) будут повторены в следующем батче.
          </p>
        )}

        {nextRemaining > 0 || wordsToReview.length > 0 ? (
          <>
            <p className="mb-6 font-semibold">
              Осталось невыученных слов (в пуле): {nextRemaining}
            </p>
            <button
              onClick={loadNextBatch}
              className="w-full sm:w-auto px-6 py-3 bg-sky-600 text-white rounded-xl shadow-md font-bold hover:bg-sky-700 transition duration-150 dark:bg-sky-700 dark:hover:bg-sky-800 flex items-center justify-center mx-auto"
            >
              <HiArrowRight className="w-5 h-5 mr-2" />
              Начать следующий батч
            </button>
            <button
              onClick={handleRestartSession}
              className="w-full sm:w-auto mt-3 px-6 py-3 bg-gray-300 text-gray-800 rounded-xl font-semibold hover:bg-gray-400 transition duration-150 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600 flex items-center justify-center mx-auto"
            >
              <HiOutlineRefresh className="w-5 h-5 mr-2" />
              Повторить текущий батч
            </button>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-green-600 dark:text-green-400 mb-6">
              Поздравляем! Вы выучили все слова в этом режиме.
            </p>
            <button
              onClick={handleGoBack}
              className="w-full sm:w-auto px-6 py-3 bg-sky-600 text-white rounded-xl shadow-md font-bold hover:bg-sky-700 transition duration-150 dark:bg-sky-700 dark:hover:bg-sky-800 flex items-center justify-center mx-auto"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              Вернуться к уроку
            </button>
          </>
        )}
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-lg mb-4 self-center">
        <button
          onClick={handleGoBack}
          className="flex items-center text-sky-700 hover:text-sky-800 transition font-semibold dark:text-sky-400 dark:hover:text-sky-300"
        >
          <HiArrowLeft className="w-6 h-6 mr-1" />
          <span className="hidden sm:inline">
            К уроку {lessonId.toUpperCase()}
          </span>
        </button>
      </div>

      <div className="w-full max-w-lg mb-6 text-center">
        <div className="text-sm font-medium text-gray-600 mb-2 dark:text-gray-400">
          Вопрос {index + 1} из {sessionList.length} (Батч)
          <span className="block text-xs text-gray-400 mt-1 dark:text-gray-500">
            Осталось всего невыученных: {totalRemaining}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / sessionList.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="w-full max-w-lg mb-8">
        <div className="p-8 bg-sky-600 text-white rounded-2xl shadow-xl flex items-center justify-between min-h-[150px] space-x-4">
          <span className="text-4xl font-bold tracking-wide">
            {current?.de.toUpperCase()}
          </span>
          {/* 🆕 ДОБАВЛЕНО: Кнопка для ручного повтора озвучивания */}
          <AudioPlayer
            textToSpeak={current?.de}
            lang={activeLangCode}
            voice={selectedWordVoice}
            className="p-3 bg-sky-500 hover:bg-sky-400 transition rounded-full flex-shrink-0"
            title="Прослушать слово снова"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {options.map((opt, i) => {
          let cls =
            "bg-white border-2 border-gray-200 hover:bg-sky-50 transition duration-150 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:hover:bg-gray-700";

          if (selected) {
            if (opt.de === current?.de) {
              cls =
                "bg-green-500 text-white border-green-700 shadow-lg scale-[1.02] dark:bg-green-600 dark:border-green-800";
            } else if (opt.de === selected.de) {
              cls =
                "bg-red-500 text-white border-red-700 shadow-lg scale-[1.02] dark:bg-red-600 dark:border-red-800";
            } else {
              cls =
                "bg-gray-200 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
              className={`p-4 rounded-xl shadow-md text-lg font-semibold text-gray-800 dark:text-gray-50 text-left ${cls} disabled:opacity-100 disabled:cursor-not-allowed`}
            >
              {opt.ru}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-lg">
        {!selected && (
          <>
            <button
              onClick={handleKnow}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl shadow-md font-bold hover:bg-green-600 transition duration-150 dark:bg-green-600 dark:hover:bg-green-700"
            >
              <div className="flex items-center justify-center">
                <HiCheck className="w-5 h-5 mr-2" />Я знаю это слово
              </div>
            </button>
            <button
              onClick={handleDontKnow}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl shadow-md font-bold hover:bg-red-600 transition duration-150 dark:bg-red-600 dark:hover:bg-red-700"
            >
              <div className="flex items-center justify-center">
                <HiX className="w-5 h-5 mr-2" />
                Пропустить
              </div>
            </button>
          </>
        )}

        {selected && selected.de !== current?.de && (
          <button
            onClick={() => advance(0)}
            className="w-full px-6 py-3 bg-sky-600 text-white rounded-xl shadow-md font-bold hover:bg-sky-700 transition duration-150 dark:bg-sky-700 dark:hover:bg-sky-800"
          >
            <div className="flex items-center justify-center">
              Далее
              <HiArrowRight className="w-5 h-5 ml-2" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
