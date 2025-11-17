import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  markLearned,
  clearLessonProgress,
} from "../../store/words/progressSlice";
import { selectLesson } from "../../store/words/wordsSlice";
import { lessons } from "../../data";
import {
  HiCheck,
  HiX,
  HiArrowRight,
  HiArrowLeft,
  HiOutlineRefresh,
  HiClock,
} from "react-icons/hi";
import LessonComplete from "../../components/LessonComplete";
import AudioPlayer from "../../components/AudioPlayer";
import { loseLife, resetLives } from "../../store/lives/livesSlice";
import {
  setGameOver,
  clearGameOver,
} from "../../store/gameState/gameStateSlice";

// КОНСТАНТЫ
const MAX_SESSION_SIZE = 15;
// const MAX_LIVES = 3; // Не используется, так как жизни берутся из Redux
const LANG_STORAGE_KEY = "selectedTtsLang";
const VOICE_STORAGE_KEY = "selectedTtsVoiceName";

// --- ФУНКЦИЯ ФОРМАТИРОВАНИЯ ВРЕМЕНИ ---
const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec
    .toString()
    .padStart(2, "0")}`;
};

export default function QuizMode() {
  const { languageId, lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ❗ REDUX СОСТОЯНИЯ
  const currentLives = useSelector((state) => state.lives.count);
  const { gameOverTimestamp, cooldownDuration } = useSelector(
    (state) => state.gameState
  );

  const { list } = useSelector((state) => state.words.navigation);
  const { learnedQuiz } = useSelector((state) => state.words.progress);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);
  const [sessionList, setSessionList] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [restartCount, setRestartCount] = useState(0);
  const [wordsToReview, setWordsToReview] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // ❗ Обработка покупки (перенаправляет)
  const handlePurchasePremium = () => {
    window.speechSynthesis.cancel();
    navigate(`/checkout/restore-lives/${lessonId}`);
  };

  // --- ЛОГИКА TTS ---
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

  // --- ЛОГИКА ТАЙМЕРА И GAME OVER ---

  // 1. Установка временной метки при проигрыше
  useEffect(() => {
    if (currentLives <= 0 && !gameOverTimestamp) {
      window.speechSynthesis.cancel();
      dispatch(setGameOver({ timestamp: Date.now() }));
    }
  }, [currentLives, gameOverTimestamp, dispatch]);

  // 2. Логика отсчета таймера
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

  // 🛑 Функция для получения оставшихся слов
  const getRemainingList = useCallback(() => {
    const learnedSet = new Set();
    learnedQuiz.forEach((w) => learnedSet.add(`${w.de}-${w.lessonId}`));

    return (
      list?.filter((word) => {
        const key = `${word.de}-${word.lessonId}`;
        return word.lessonId === lessonId && !learnedSet.has(key);
      }) || []
    );
  }, [list, learnedQuiz, lessonId]);

  const allRemainingList = useMemo(
    () => getRemainingList(),
    [getRemainingList]
  );
  const totalRemaining = allRemainingList.length;

  // 💡 ЛОГИКА СБОРА СЛОВ ДЛЯ БАТЧА (слова на повторение + новые слова)
  const loadNextBatch = useCallback(() => {
    const reviewBatch = wordsToReview;
    const needNewWords = MAX_SESSION_SIZE - reviewBatch.length;

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
    const initialBatch = allRemainingList.slice(0, MAX_SESSION_SIZE);
    setSessionList(initialBatch);
    setWordsToReview([]);
    setRestartCount((prev) => prev + 1);
  }, [allRemainingList]);

  const handleRepeatLesson = () => {
    if (
      window.confirm(
        "Вы уверены? Это действие удалит прогресс для этого урока ТОЛЬКО в режиме ВИКТОРИНА."
      )
    ) {
      dispatch(clearLessonProgress({ lessonId, mode: "quiz" }));
      handleRestartSession();
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

  // 💡 ЛОГИКА TTS: АВТОМАТИЧЕСКОЕ ОЗВУЧИВАНИЕ ПРИ СМЕНЕ СЛОВА
  useEffect(() => {
    window.speechSynthesis.cancel();

    if (current && selectedWordVoice) {
      try {
        const utterance = new SpeechSynthesisUtterance(current.de);
        utterance.lang = selectedWordVoice.lang;
        utterance.voice = selectedWordVoice;
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("TTS failed:", e);
      }
    }
  }, [current, selectedWordVoice, restartCount]);

  useEffect(() => {
    if (sessionList.length > 0 && index >= sessionList.length) {
      setIsSessionComplete(true);
      setIndex(sessionList.length);
      setSelected(null);
    }
  }, [index, sessionList.length]);

  // 💡 ГЕНЕРАЦИЯ ВАРИАНТОВ ОТВЕТА
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
    window.speechSynthesis.cancel();
    setSelected(opt);

    if (opt.de === current.de) {
      // ✅ ПРАВИЛЬНЫЙ ОТВЕТ: Отмечаем как выученное
      dispatch(markLearned({ word: current, mode: "quiz" }));
      advance(1000);
    } else {
      // ❌ НЕПРАВИЛЬНЫЙ ОТВЕТ: Уменьшаем жизнь и добавляем слово в список на повторение
      if (currentLives > 0) {
        dispatch(loseLife());
      }
      if (!wordsToReview.some((w) => w.de === current.de)) {
        setWordsToReview((prev) => [...prev, current]);
      }
      advance(1000);
    }
  };

  const handleKnow = () => {
    if (current) {
      window.speechSynthesis.cancel();
      dispatch(markLearned({ word: current, mode: "quiz" }));
      advance(0);
    }
  };

  const handleDontKnow = () => {
    if (current) {
      window.speechSynthesis.cancel();
      if (!wordsToReview.some((w) => w.de === current.de)) {
        setWordsToReview((prev) => [...prev, current]);
      }
      advance(0);
    }
  };

  const handleGoBack = () => {
    window.speechSynthesis.cancel();
    navigate(`/lessons-list/${languageId}/${lessonId}`);
  };

  // ❗ ПРОВЕРКА GAME OVER И ТАЙМЕРА (ЭКРАН ОЖИДАНИЯ)
  if (currentLives <= 0 && gameOverTimestamp) {
    window.speechSynthesis.cancel();

    if (timeLeft > 0) {
      // 🛑 ЭКРАН ОЖИДАНИЯ
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
            onClick={handleGoBack} // Используем handleGoBack для чистого перехода
            className="w-full sm:w-auto mt-4 px-6 py-3 text-gray-800 bg-gray-300 rounded-xl font-bold hover:bg-gray-400 transition duration-150 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600"
          >
            Вернуться к уроку
          </button>
        </div>
      );
    }
  }

  // ЭКРАН ЗАВЕРШЕНИЯ УРОКА
  if (totalRemaining === 0 && wordsToReview.length === 0)
    return (
      <LessonComplete
        lessonId={lessonId}
        onGoBack={handleGoBack}
        onRepeat={handleRepeatLesson}
      />
    );

  // ЭКРАН ЗАВЕРШЕНИЯ СЕССИИ (БАТЧА)
  if (isSessionComplete) {
    const nextRemaining = allRemainingList.length;

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
      {/* 🛑 УДАЛЕН БЛОК УПРАВЛЕНИЯ И ЖИЗНЕЙ */}

      <div className="w-full max-w-lg mb-6 text-center">
        <div className="text-sm font-medium text-gray-600 mb-2 dark:text-gray-400">
          Вопрос **{index + 1}** из **{sessionList.length}** (Батч)
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
