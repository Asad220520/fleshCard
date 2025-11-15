import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  selectLesson,
  markLearned,
  clearLessonProgress,
} from "../../store/store";
import { lessons } from "../../data";
import StudyCompletionModal from "../../components/StudyCompletionModal";

import {
  HiArrowLeft,
  HiArrowRight,
  HiCheck,
  HiOutlineRefresh,
} from "react-icons/hi";
import AudioPlayer from "../../components/AudioPlayer";
import LessonComplete from "../../components/LessonComplete";

const MAX_SESSION_SIZE = 15;

// 💡 ВОССТАНОВЛЕННЫЕ КОНСТАНТЫ
const LANG_STORAGE_KEY = "selectedTtsLang";
const VOICE_STORAGE_KEY = "selectedTtsVoiceName";

const flipCardStyles = {
  perspective: "1000px",
  width: "100%",
  maxWidth: "400px",
  height: "300px",
};

const flipCardInnerStyles = {
  position: "relative",
  width: "100%",
  height: "100%",
  textAlign: "center",
  transition: "transform 0.6s",
  transformStyle: "preserve-3d",
};

const flipCardFaceStyles = {
  position: "absolute",
  width: "100%",
  height: "100%",
  WebkitBackfaceVisibility: "hidden",
  backfaceVisibility: "hidden",
  borderRadius: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
};

export default function FlashCardsMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    list,
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  } = useSelector((state) => state.words);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionList, setSessionList] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [restartCount, setRestartCount] = useState(0);

  // 💡 ВОССТАНОВЛЕНИЕ: Чтение активного языка
  const activeLangCode = useMemo(() => {
    return localStorage.getItem(LANG_STORAGE_KEY) || "de";
  }, []);

  // 💡 ВОССТАНОВЛЕНИЕ: Чтение сохраненного имени голоса
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

  // 💡 ИСПРАВЛЕННЫЙ БЛОК: Логика поиска сохраненного голоса
  useEffect(() => {
    if (voices.length > 0) {
      let voiceFound = null;

      if (savedVoiceName) {
        // 1. Ищем голос по сохраненному имени И активному языку
        voiceFound = voices.find(
          (v) => v.name === savedVoiceName && v.lang.startsWith(activeLangCode)
        );
      }

      if (!voiceFound) {
        // 2. Если не нашли, ищем первый голос для активного языка (запасной вариант)
        const defaultVoice = voices.find((v) =>
          v.lang.startsWith(activeLangCode)
        );
        voiceFound = defaultVoice || null;
      }
      setSelectedWordVoice(voiceFound);
    }
  }, [voices, activeLangCode, savedVoiceName]);
  // ----------------------------------------------------

  // ❌ УДАЛЕНИЕ НЕНУЖНОЙ ФУНКЦИИ (была в оригинале)
  // const getVoiceByLang = (lang) => { ... }

  // ❌ УДАЛЕНИЕ НЕНУЖНЫХ ХУКОВ (были в оригинале)
  // const getWordVoices = useMemo(() => { ... }
  // useEffect(() => { if (selectedWordVoice && ...) { ... }

  const getRemainingList = useCallback(() => {
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

  const finalRemainingList = useMemo(
    () => getRemainingList(),
    [getRemainingList]
  );
  const totalRemaining = finalRemainingList.length;

  const current = sessionList[index];

  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  const loadNewBatch = useCallback(() => {
    const actualRemainingList = finalRemainingList;
    if (actualRemainingList.length > 0) {
      const initialBatch = actualRemainingList.slice(0, MAX_SESSION_SIZE);
      setSessionList(initialBatch);
      setIndex(0);
      setFlipped(false);
      setIsSessionComplete(false);
    } else if (list && list.length > 0) {
      setIsSessionComplete(true);
      setSessionList([]);
    }
  }, [finalRemainingList, list]);

  useEffect(() => {
    if (finalRemainingList.length > 0) {
      const currentBatchKeys = sessionList
        .map((w) => `${w.de}-${w.lessonId}`)
        .join(",");
      const newBatchKeys = finalRemainingList
        .slice(0, MAX_SESSION_SIZE)
        .map((w) => `${w.de}-${w.lessonId}`)
        .join(",");

      if (
        currentBatchKeys !== newBatchKeys ||
        sessionList.length === 0 ||
        restartCount > 0
      ) {
        loadNewBatch();
      }
    }
    setRestartCount(0);
  }, [
    finalRemainingList,
    list,
    loadNewBatch,
    restartCount,
    sessionList.length,
  ]);

  useEffect(() => {
    if (sessionList.length > 0 && index >= sessionList.length) {
      setIndex(sessionList.length - 1);
      setFlipped(false);
      setIsSessionComplete(true);
    }
  }, [index, sessionList.length]);

  const handleRestartSession = useCallback(() => {
    loadNewBatch();
    setRestartCount((prev) => prev + 1);
  }, [loadNewBatch]);

  const handleRepeatLesson = useCallback(() => {
    if (
      window.confirm(
        "Вы уверены? Это действие удалит прогресс для этого урока ТОЛЬКО в режиме ФЛЕШ-КАРТЫ."
      )
    ) {
      dispatch(clearLessonProgress({ lessonId, mode: "flashcards" }));
      navigate(`/lesson/${lessonId}`);
    }
  }, [dispatch, lessonId, navigate]);

  const next = useCallback(() => {
    setFlipped(false);
    // 🛑 ОСТАНОВКА: Отменяем озвучивание при переходе
    window.speechSynthesis.cancel();
    if (index < sessionList.length) setIndex((i) => i + 1);
  }, [sessionList.length, index]);

  const prev = useCallback(() => {
    setFlipped(false);
    // 🛑 ОСТАНОВКА: Отменяем озвучивание при переходе
    window.speechSynthesis.cancel();
    setIndex((i) => (i - 1 >= 0 ? i - 1 : 0));
  }, []);

  const handleKnow = () => {
    if (current) {
      // 🛑 ОСТАНОВКА: Отменяем озвучивание
      window.speechSynthesis.cancel();
      dispatch(markLearned({ word: current, mode: "flashcards" }));
      next();
    }
  };

  const handleFlip = () => {
    // 🛑 ОСТАНОВКА: Отменяем озвучивание при перевороте (чтобы избежать наложения)
    window.speechSynthesis.cancel();
    setFlipped((f) => !f);
  };

  const handleMarkAllAsLearned = useCallback(() => {
    sessionList.forEach((word) =>
      dispatch(markLearned({ word, mode: "flashcards" }))
    );
    handleRestartSession();
  }, [sessionList, dispatch, handleRestartSession]);

  const handleCloseModal = () => handleRestartSession();

  const handleGoBack = () => {
    // 🛑 ОСТАНОВКА: Отменяем озвучивание при выходе
    window.speechSynthesis.cancel();
    navigate(`/lesson/${lessonId}`);
  };

  // 💡 Динамическое получение текста слова для отображения и озвучивания
  // wordText будет, например, 'der Gast' или 'der Job'
  const wordText = current?.[activeLangCode] || current?.de;

  if (finalRemainingList.length === 0 && list && list.length > 0)
    return (
      <LessonComplete
        lessonId={lessonId}
        onGoBack={handleGoBack}
        onRepeat={handleRepeatLesson}
      />
    );

  if (isSessionComplete)
    return (
      <StudyCompletionModal
        wordsToLearn={sessionList}
        onRestart={handleRestartSession}
        onClose={handleCloseModal}
        onMarkAll={handleMarkAllAsLearned}
        modeName={`Флеш-карты (Батч ${MAX_SESSION_SIZE})`}
        isBatchComplete={
          finalRemainingList.length > MAX_SESSION_SIZE ||
          (finalRemainingList.length > 0 &&
            finalRemainingList.length <= MAX_SESSION_SIZE)
        }
      />
    );

  if (!current) return null;

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-sm mb-4 self-center">
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

      <div className="w-full max-w-sm mb-6 text-center">
        <div className="text-sm font-medium text-gray-600 mb-2 dark:text-gray-400">
          Прогресс **батча**: {index + 1} из {sessionList.length}
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

      <div
        style={flipCardStyles}
        onClick={handleFlip}
        className="cursor-pointer mb-8"
      >
        <div
          style={{
            ...flipCardInnerStyles,
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            style={flipCardFaceStyles}
            className="bg-sky-500 text-white shadow-xl flex-col"
          >
            <span className="text-4xl font-bold mb-4">{wordText}</span>

            <AudioPlayer
              textToSpeak={wordText}
              lang={
                // 💡 Используем язык из голоса, если он есть, иначе активный код
                selectedWordVoice?.lang ||
                `${activeLangCode}-${activeLangCode.toUpperCase()}`
              }
              voice={selectedWordVoice}
              className="!text-white !bg-sky-600 hover:!bg-sky-700 p-3 rounded-full"
              title={`Прослушать ${wordText} (${activeLangCode.toUpperCase()})`}
            />
          </div>

          <div
            style={{ ...flipCardFaceStyles, transform: "rotateY(180deg)" }}
            className="bg-white text-gray-800 shadow-xl border-2 border-sky-500 dark:bg-gray-700 dark:text-gray-50 dark:border-sky-600"
          >
            <span className="text-4xl font-bold">{current.ru}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm">
        <button
          onClick={handleFlip}
          className="flex items-center justify-center w-full sm:w-auto px-4 py-3 bg-sky-200 text-sky-800 rounded-xl font-semibold hover:bg-sky-300 transition duration-150 dark:bg-sky-800 dark:text-sky-300 dark:hover:bg-sky-700"
        >
          <HiOutlineRefresh className="w-5 h-5 mr-2" />
          {flipped ? "Скрыть перевод" : "Перевернуть"}
        </button>

        <div className="flex justify-between w-full sm:w-auto sm:space-x-3 mt-3 sm:mt-0">
          <button
            onClick={prev}
            disabled={index === 0}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-white rounded-xl shadow-md text-gray-600 font-semibold hover:bg-gray-100 transition duration-150 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:shadow-none"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span className="ml-2 hidden sm:inline">Назад</span>
          </button>
          <button
            onClick={next}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-white rounded-xl shadow-md text-gray-600 font-semibold hover:bg-gray-100 transition duration-150 ml-3 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:shadow-none"
          >
            <span className="mr-2 hidden sm:inline">
              {index === sessionList.length - 1 ? "Завершить батч" : "Далее"}
            </span>
            <HiArrowRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleKnow}
          className="w-full mt-3 sm:mt-0 px-4 py-3 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition duration-150 dark:bg-green-700 dark:hover:bg-green-800"
        >
          <div className="flex items-center justify-center">
            <HiCheck className="w-6 h-6 mr-2" />Я знаю это слово! (Скип)
          </div>
        </button>
      </div>
    </div>
  );
}
