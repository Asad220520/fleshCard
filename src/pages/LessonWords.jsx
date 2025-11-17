import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { removeLearned } from "../store/words/progressSlice";

import AudioPlayer from "../components/AudioPlayer";
import {
  HiTrash,
  HiCheckCircle,
  HiOutlineAnnotation, // Используем HiOutlineSquare вместо HiOutlineAnnotation
  HiArrowLeft,
  HiBookOpen,
} from "react-icons/hi";

// Список всех режимов обучения
const ALL_MODES = [
  "flashcards",
  "matching",
  "quiz",
  "writing",
  "sentence_puzzle",
];

export default function LessonWords() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  } = useSelector((state) => state.words.progress);

  const [selectedWords, setSelectedWords] = useState([]);

  const words = useMemo(() => {
    const allLearned = [
      ...learnedFlashcards,
      ...learnedMatching,
      ...learnedQuiz,
      ...learnedWriting,
      ...(learnedSentencePuzzle || []),
    ].filter((w) => w.lessonId === lessonId);

    const uniqueWordsMap = new Map();
    allLearned.forEach((word) => {
      const key = `${word.de}-${word.lessonId}`;
      if (!uniqueWordsMap.has(key)) {
        uniqueWordsMap.set(key, word);
      }
    });

    return Array.from(uniqueWordsMap.values());
  }, [
    lessonId,
    learnedFlashcards,
    learnedMatching,
    learnedQuiz,
    learnedWriting,
    learnedSentencePuzzle,
  ]);

  // Переменная для чистоты JSX
  const allWordsSelected =
    words.length > 0 && selectedWords.length === words.length;

  const dispatchRemoveFromAll = (word) => {
    // Удаляет слово из ВСЕХ режимов
    ALL_MODES.forEach((mode) => {
      dispatch(
        removeLearned({ de: word.de, lessonId: word.lessonId, mode: mode })
      );
    });
  };

  const handleToggleSelect = (word) => {
    const wordKey = `${word.de}-${word.lessonId}`;

    if (selectedWords.some((w) => `${w.de}-${w.lessonId}` === wordKey)) {
      setSelectedWords(
        selectedWords.filter((w) => `${w.de}-${w.lessonId}` !== wordKey)
      );
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleRemoveSelected = () => {
    // В реальном приложении здесь нужен кастомный модал вместо alert/confirm
    if (selectedWords.length > 0) {
      selectedWords.forEach((word) => {
        dispatchRemoveFromAll(word);
      });
      setSelectedWords([]);
    }
  };

  // NOTE: handleRemoveAll не используется в JSX, но содержит window.confirm.
  // В Canvas средах используйте кастомные модальные окна вместо window.confirm.
  const handleRemoveAll = () => {
    /* ... (логика удаления всего) ... */
  };

  const handleSelectAll = () => {
    if (allWordsSelected) {
      setSelectedWords([]);
    } else {
      setSelectedWords([...words]);
    }
  };

  // --- Состояние: Список пуст ---
  if (words.length === 0)
    return (
      <div className="p-4 sm:p-12 flex justify-center items-start pt-20 text-gray-500 bg-gray-50 min-h-[50vh] dark:bg-gray-900 transition-colors duration-300">
        <div className="p-8 bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:shadow-2xl max-w-sm w-full text-center">
          <HiBookOpen className="w-10 h-10 text-sky-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-50">
            Список пуст
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
            Вы еще не выучили ни одного слова в этом уроке, или все выученные
            слова были удалены.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center justify-center px-4 py-2 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" /> Назад к урокам
          </button>
        </div>
      </div>
    );

  // --- Основной вид ---
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* 1. --- Плавающая Панель Действий (Sticky/Fixed Actions Bar) --- */}
      {selectedWords.length > 0 && (
        <div
          className="sticky top-4 sm:top-6 w-full max-w-lg mb-6 
                  bg-white dark:bg-gray-800 border dark:border-gray-700
                  shadow-2xl shadow-sky-300/30 dark:shadow-sky-800/50 
                  rounded-2xl px-4 py-3 flex justify-between items-center z-50
                  transform transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
            Выбрано: **{selectedWords.length}**
          </span>
          <button
            onClick={handleRemoveSelected}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 dark:bg-red-600 dark:hover:bg-red-700 transition duration-200"
            title="Удалить выбранные слова из списка"
          >
            <HiTrash className="w-5 h-5 mr-1" /> Удалить
          </button>
        </div>
      )}

      {/* 2. --- Выбрать все / снять все --- */}
      <div className="w-full max-w-lg mb-6 flex justify-end">
        <button
          onClick={handleSelectAll}
          className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-700 transition dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title={
            allWordsSelected ? "Снять выделение со всех" : "Выбрать все слова"
          }
        >
          {allWordsSelected ? (
            <>
              <HiCheckCircle className="w-5 h-5 mr-1 text-sky-500" /> Снять все
            </>
          ) : (
            <>
              <HiOutlineAnnotation className="w-5 h-5 mr-1" /> Выбрать все
            </>
          )}
        </button>
      </div>

      {/* 3. --- Список слов --- */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-lg">
        {words.map((word) => {
          const isSelected = selectedWords.some(
            (w) => w.de === word.de && w.lessonId === word.lessonId
          );

          return (
            <div
              key={`${word.de}-${word.lessonId}`}
              className={`p-4 rounded-xl flex justify-between items-start cursor-pointer transition duration-200 ease-in-out border-l-4 ${
                isSelected
                  ? "bg-sky-50/70 border-sky-500 shadow-xl dark:bg-sky-950/50 dark:border-sky-400"
                  : "bg-white border-gray-200 hover:shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700/70"
              }`}
              onClick={() => handleToggleSelect(word)}
            >
              {/* Левая часть: Чекбокс и текст */}
              <div className="flex items-start space-x-3 w-4/5">
                {/* Иконка Выбора */}
                <div className="pt-1">
                  {isSelected ? (
                    <HiCheckCircle className="w-6 h-6 text-sky-500 dark:text-sky-400 transform scale-110" />
                  ) : (
                    <HiOutlineAnnotation className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-500" />
                  )}
                </div>

                {/* Текст слова */}
                <div>
                  <div className="font-extrabold text-xl text-gray-800 flex items-center dark:text-gray-50">
                    {word.de}
                    <AudioPlayer textToSpeak={word.de} lang="de-DE" />
                  </div>
                  <div className="text-gray-600 text-base dark:text-gray-300 mt-0.5">
                    {word.ru}
                  </div>
                </div>
              </div>

              {/* Правая часть: Кнопка удаления */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatchRemoveFromAll(word);
                }}
                className="p-2 ml-4 flex-shrink-0 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
                title="Удалить это слово из выученных"
              >
                <HiTrash className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
