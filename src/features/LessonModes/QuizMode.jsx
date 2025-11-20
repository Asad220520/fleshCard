import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  // markLearned остается в импортах, но не используется в handleSelect
  // markLearned,
  clearLessonProgress,
} from "../../store/words/progressSlice";
import { HiArrowRight, HiClock, HiHeart } from "react-icons/hi"; // Добавлен HiHeart
import LessonComplete from "../../components/LessonComplete";
import AudioPlayer from "../../components/AudioPlayer";

// 💡 НОВЫЕ ИМПОРТЫ ДЛЯ ЖИЗНЕЙ И GAME OVER
import { loseLife, resetLives } from "../../store/lives/livesSlice";
import {
  setGameOver,
  clearGameOver,
} from "../../store/gameState/gameStateSlice";
import ProgressBar from "../../components/UI/ProgressBar";

// КОНСТАНТЫ
const VOICE_STORAGE_KEY = "selectedTtsVoiceName";
const MAX_QUIZ_ROUNDS = 3; // 💡 КОНСТАНТА: Максимальное количество полных проходов сессии
const TARGET_MODE = "quiz";

// --- ФУНКЦИЯ ФОРМАТИРОВАНИЯ ВРЕМЕНИ (ВОССТАНОВЛЕНА) ---
const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec
    .toString()
    .padStart(2, "0")}`;
};

export default function QuizMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 💡 REDUX СОСТОЯНИЯ
  const currentLives = useSelector((state) => state.lives.count);
  const { gameOverTimestamp, cooldownDuration } = useSelector(
    (state) => state.gameState
  );

  // 1. 💡 ИЗВЛЕКАЕМ ВСЕ LEARNED-СПИСКИ ДЛЯ УНИФИЦИРОВАННОЙ ФИЛЬТРАЦИИ
  const { list, currentLessonLang } = useSelector(
    (state) => state.words.navigation
  );
  const {
    learnedQuiz,
    learnedFlashcards,
    learnedMatching,
    learnedWriting,
    learnedSentencePuzzle,
  } = useSelector((state) => state.words.progress);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);
  const [sessionList, setSessionList] = useState([]);
  // restartCount теперь используется для отслеживания полных проходов
  const [restartCount, setRestartCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // 💡 НОВОЕ СОСТОЯНИЕ ДЛЯ ОТОБРАЖЕНИЯ ЭКРАНА ЗАВЕРШЕНИЯ СЕССИИ
  const [isSessionCompletedByLimit, setIsSessionCompletedByLimit] =
    useState(false);

  // --- ЛОГИКА GAME OVER И ТАЙМЕРА (Без изменений) ---

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
    navigate(`/premium-status`);
  };

  // --- ЛОГИКА TTS (Без изменений) ---
  const activeLangCode = useMemo(() => {
    return currentLessonLang || "de";
  }, [currentLessonLang]);

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

  // 🛑 Функция для получения оставшихся слов (УНИФИЦИРОВАННАЯ ФИЛЬТРАЦИЯ)
  const getRemainingList = useCallback(() => {
    // 💡 Объединяем прогресс из всех режимов
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
        // Проверяем по ОБЩЕМУ Set
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
  const totalRemaining = allRemainingList.length;

  // 💡 ЛОГИКА СБОРА СЛОВ ДЛЯ СЛЕДУЮЩЕГО НАБОРА (ТЕПЕРЬ НАЗЫВАЕТСЯ loadNextWords)
  const loadNextWords = useCallback(() => {
    // 💡 ПРОВЕРКА ЛИМИТА СЕССИИ
    if (restartCount >= MAX_QUIZ_ROUNDS) {
      setIsSessionCompletedByLimit(true);
      return;
    }

    // 💡 Используем актуальный список оставшихся слов
    const listToUse = allRemainingList;

    if (listToUse.length > 0) {
      // Берем только первые 15 слов
      const nextSessionList = listToUse.slice(0, 15);

      setSessionList(nextSessionList);
      setIndex(0);
      setRestartCount((prev) => prev + 1);
    }
  }, [allRemainingList, restartCount]); // Добавлена зависимость restartCount

  // 💡 Обработчик повтора сессии (После достижения лимита раундов)
  const handleRestartSession = useCallback(() => {
    // 💡 Сбрасываем только счетчик раундов и флаг завершения
    setIndex(0);
    setRestartCount(0); // Сбрасываем счетчик проходов
    setIsSessionCompletedByLimit(false); // Сбрасываем флаг завершения
    setSessionList([]);
  }, []);

  // 💡 Обработчик сброса прогресса урока
  const allLessonWords = useMemo(
    () => list?.filter((w) => w.lessonId === lessonId) || [],
    [list, lessonId]
  );

  const handleRepeatLesson = useCallback(() => {
    if (
      window.confirm(
        "Вы уверены? Это действие удалит прогресс для этого урока ТОЛЬКО в режиме ВИКТОРИНА."
      )
    ) {
      // 1. Сбрасываем Redux прогресс
      dispatch(clearLessonProgress({ lessonId, mode: TARGET_MODE }));
      dispatch(resetLives());

      // 2. 💡 Сбрасываем локальное состояние, чтобы АСИНХРОННО запустить
      setSessionList([]);
      setIndex(0);
      setRestartCount(0);
      setIsSessionCompletedByLimit(false);
    }
  }, [dispatch, lessonId]);

  // 💡 АВТОМАТИЧЕСКАЯ ЗАГРУЗКА ПРИ ПЕРВОМ РЕНДЕРЕ ИЛИ ИЗМЕНЕНИИ СПИСКА
  useEffect(() => {
    if (
      allRemainingList.length > 0 &&
      sessionList.length === 0 &&
      !isSessionCompletedByLimit
    ) {
      loadNextWords();
    }
  }, [
    allRemainingList,
    loadNextWords,
    sessionList.length,
    isSessionCompletedByLimit,
  ]);

  const current = sessionList[index] || null;

  // 💡 ЛОГИКА TTS: АВТОМАТИЧЕСКОЕ ОЗВУЧИВАНИЕ ПРИ СМЕНЕ СЛОВА (Без изменений)
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

  // 💡 АВТОМАТИЧЕСКАЯ ЗАГРУЗКА СЛЕДУЮЩЕГО НАБОРА, ЕСЛИ ТЕКУЩИЙ ЗАКОНЧИЛСЯ
  useEffect(() => {
    if (sessionList.length > 0 && index >= sessionList.length) {
      // 💡 Если текущий набор закончился, пытаемся загрузить следующий (или завершаем)
      loadNextWords();
    }
  }, [index, sessionList.length, loadNextWords]);

  // 💡 ГЕНЕРАЦИЯ ВАРИАНТОВ ОТВЕТА (Без изменений)
  useEffect(() => {
    if (!current) {
      setOptions([]);
      return;
    }
    // 💡 ИСПОЛЬЗУЕМ allLessonWords для пула, чтобы опции всегда были из текущего урока
    const allWords = allLessonWords;
    const pool = allWords.filter((w) => w.de !== current.de);
    // Случайно выбираем 3 неправильных варианта
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [...shuffled, current].sort(() => Math.random() - 0.5);
    setOptions(opts);
    setSelected(null);
  }, [current, allLessonWords]); // Зависимость list заменена на allLessonWords

  const advance = useCallback((delay = 500) => {
    setTimeout(() => {
      setIndex((i) => i + 1);
      setSelected(null);
    }, delay);
  }, []);

  const handleSelect = (opt) => {
    if (selected || currentLives <= 0) return;
    window.speechSynthesis.cancel();
    setSelected(opt);

    if (opt.de === current.de) {
      // ✅ ПРАВИЛЬНЫЙ ОТВЕТ
      // dispatch(markLearned({ word: current, mode: TARGET_MODE })); // Если требуется маркировать
      advance(1000);
    } else {
      // ❌ НЕПРАВИЛЬНЫЙ ОТВЕТ: ТЕРЯЕМ ЖИЗНЬ
      if (currentLives > 0) {
        dispatch(loseLife());
      }
      advance(1000);
    }
  };

  const handleGoBack = () => {
    window.speechSynthesis.cancel();
    navigate(`/lesson/${lessonId}`);
  };

  // 1. ❗ ЭКРАН GAME OVER
  if (currentLives <= 0 && gameOverTimestamp) {
    if (timeLeft > 0) {
      window.speechSynthesis.cancel();
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

  // 2. 💡 ЭКРАН ЗАВЕРШЕНИЯ СЕССИИ
  if (isSessionCompletedByLimit || totalRemaining === 0)
    return (
      <LessonComplete
        lessonId={lessonId}
        onGoBack={handleGoBack}
        message={
          isSessionCompletedByLimit
            ? "Вы завершили сессию тренировки!"
            : "Урок полностью завершен!"
        }
        repeatText={
          isSessionCompletedByLimit
            ? "Начать новую сессию (Повторить)"
            : "Повторить урок полностью (Сбросить прогресс)"
        }
        onRepeat={() =>
          isSessionCompletedByLimit
            ? handleRestartSession()
            : handleRepeatLesson()
        }
      />
    );

  if (!current) return null;

  // 3. ОСНОВНОЙ РЕНДЕРИНГ
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-xl mb-6 p-4 bg-white rounded-xl shadow-md dark:bg-gray-800 border-b-4 border-green-400 dark:border-green-600">
        <ProgressBar
          current={index}
          totalInSession={sessionList.length}
          totalRemaining={totalRemaining}
          roundInfo={`(Раунд ${restartCount} из ${MAX_QUIZ_ROUNDS})`}
        />
      </div>
      {/* 2. БЛОК ВОПРОСА (НЕМЕЦКОЕ СЛОВО) */}
      <div className="w-full max-w-xl mb-8">
        <div
          className="p-6 sm:p-8 
                    /* 💡 НОВЫЙ ЗЕЛЕНОВАТЫЙ ГРАДИЕНТ */
                    bg-gradient-to-r from-green-500 to-green-500 text-white 
                    rounded-3xl shadow-md
                    flex flex-col sm:flex-row items-center justify-center sm:justify-between 
                    min-h-[120px] space-y-4 sm:space-y-0 sm:space-x-6 
                    border-4 border-white/20 dark:border-white/10"
        >
          {/* Само слово */}
          <span className="text-3xl sm:text-4xl font-extrabold tracking-widest text-center sm:text-left drop-shadow-lg">
            {current?.de}
          </span>

          {/* AudioPlayer: Иконка тоже окрашена в зеленый/изумрудный для гармонии */}
          <AudioPlayer
            textToSpeak={current?.de}
            lang={activeLangCode}
            voice={selectedWordVoice}
            className="p-4 bg-white text-purple-600 border border-white/50 /* 💡 ФИОЛЕТОВЫЙ ЦВЕТ ИКОНКИ */
                   rounded-full flex-shrink-0 shadow-lg 
                   hover:bg-gray-100 transition duration-200 
                   transform hover:scale-105"
            title="Прослушать слово снова"
          />
        </div>
      </div>
      {/* 3. ВАРИАНТЫ ОТВЕТА (РУССКИЕ СЛОВА) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {options.map((opt, i) => {
          let cls =
            // 💡 Невыбранное состояние: Чистое, минимальное
            "bg-white border border-gray-200 hover:bg-gray-100 transition duration-150 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:hover:bg-gray-700 shadow-sm";

          if (selected) {
            if (opt.de === current?.de) {
              // ✅ Правильный ответ: Чистый бирюзовый (teal)
              cls =
                "bg-green-500  border-green-600 shadow-md scale-[1.01] transform-gpu border-2 text-white dark:text-white";
            } else if (opt.de === selected.de) {
              // ❌ Неправильный ответ: Чистый красный (red)
              cls =
                "bg-red-500 text-white border-red-700 shadow-md scale-[1.01] transform-gpu border-2 shake-animation";
            } else {
              // ⚪ Невыбранные, нового неправильные: Тусклые, нейтральные
              cls =
                "bg-gray-200 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 opacity-80";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={!!selected || currentLives <= 0}
              className={`
            p-4 rounded-xl text-lg font-bold text-gray-800 dark:text-gray-50 text-center 
            transition duration-200 transform hover:scale-[1.005] 
            ${cls} 
            disabled:opacity-100 disabled:cursor-not-allowed
          `}
            >
              {opt.ru}
            </button>
          );
        })}
      </div>
      {/* 4. КНОПКА "ДАЛЕЕ" */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-xl">
        {selected && (
          <button
            onClick={() => advance(0)}
            className="w-full px-6 py-3 
                   /* 💡 Чистый, однотонный цвет Teal */
                   bg-teal-600 text-white 
                   rounded-xl shadow-md /* Минимальная тень */
                   font-extrabold text-lg 
                   hover:bg-teal-700 transition duration-200 
                   active:scale-[0.99] transform-gpu"
          >
            <div className="flex items-center justify-center">
              Далее
              <HiArrowRight className="w-6 h-6 ml-2" />
            </div>
          </button>
        )}
      </div>
      {/* Стили для анимации */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) scale(1.02); }
          20%, 60% { transform: translateX(-5px) scale(1.02); }
          40%, 80% { transform: translateX(5px) scale(1.02); }
        }
        .shake-animation {
          animation: shake 0.4s ease-in-out;
        } 
      `}</style>
    </div>
  );
}
