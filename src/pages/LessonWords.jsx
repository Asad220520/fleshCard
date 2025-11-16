import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { removeLearned } from "../store/words/progressSlice"; // removeLearned

import AudioPlayer from "../components/AudioPlayer";
import {
  HiTrash,
  HiCheckCircle,
  HiOutlineAnnotation,
  HiArrowLeft,
  HiBookOpen,
  HiOutlineRefresh, // Добавлено для иконки "Удалить все"
} from "react-icons/hi";

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

  const dispatchRemoveFromAll = (word) => {
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
    if (
      window.confirm(
        `Вы уверены, что хотите удалить ${selectedWords.length} выбранных слов?`
      )
    ) {
      selectedWords.forEach((word) => {
        dispatchRemoveFromAll(word);
      });
      setSelectedWords([]);
    }
  };

  const handleRemoveAll = () => {
    if (
      window.confirm(
        `ВНИМАНИЕ! Вы уверены, что хотите удалить ${
          words.length
        } выученных слов из урока ${lessonId.toUpperCase()} ИЗ ВСЕХ РЕЖИМОВ? Это действие необратимо.`
      )
    ) {
      words.forEach((word) => {
        dispatchRemoveFromAll(word);
      });
      setSelectedWords([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedWords.length === words.length) {
      setSelectedWords([]);
    } else {
      setSelectedWords([...words]);
    }
  };

  if (words.length === 0)
    return (
      <div className="p-12 text-center text-gray-500 bg-gray-50 min-h-[50vh] dark:bg-gray-900 transition-colors duration-300">
        <div className="p-8 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:shadow-xl">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-50">
            Список пуст
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Вы еще не выучили ни одного слова в этом уроке.
          </p>
          <Link
            to="/learned"
            className="mt-4 inline-block px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            ← Назад к урокам
          </Link>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* 1. Блок Заголовка */}
      <div className="w-full max-w-lg mb-6 flex justify-between items-center">
        <div className="flex items-center text-lg sm:text-2xl font-extrabold text-gray-800 dark:text-gray-50">
          <HiBookOpen className="w-6 h-6 mr-2 text-sky-600 dark:text-sky-400" />
          <span>Выучено: {lessonId.toUpperCase()}</span>
        </div>
        <button
          onClick={() => navigate("/learned")}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition dark:text-gray-400 dark:hover:text-gray-300"
        >
          <HiArrowLeft className="w-4 h-4 mr-1" /> Назад
        </button>
      </div>

      {/* 2. НОВЫЙ БЛОК УПРАВЛЕНИЯ (Объединенный и центрированный) */}
      <div className="w-full max-w-lg mb-4 p-4 bg-white rounded-xl shadow-md border border-gray-100 dark:bg-gray-800 dark:shadow-xl dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          {/* Кнопка 1: Выбрать все/Снять все */}
          <button
            onClick={handleSelectAll}
            className="flex items-center text-sm font-semibold text-sky-700 hover:text-sky-800 transition dark:text-sky-400 dark:hover:text-sky-300"
          >
            {selectedWords.length === words.length && words.length > 0 ? (
              <>
                <HiCheckCircle className="w-5 h-5 mr-1" /> Снять все (
                {selectedWords.length})
              </>
            ) : (
              <>
                <HiOutlineAnnotation className="w-5 h-5 mr-1" /> Выбрать все (
                {words.length})
              </>
            )}
          </button>

          {/* Кнопка 2: Удалить все */}
          <button
            onClick={handleRemoveAll}
            disabled={words.length === 0}
            className="flex items-center text-xs font-semibold text-red-500 hover:text-red-700 transition disabled:text-gray-400 dark:text-red-400 dark:hover:text-red-300 dark:disabled:text-gray-600"
            title="Удалить ВСЕ выученные слова из урока"
          >
            <HiTrash className="w-4 h-4 mr-1" />
            Удалить все
          </button>
        </div>

        {/* Кнопка 3: Удалить выбранные (Крупная, если что-то выбрано) */}
        {selectedWords.length > 0 && (
          <button
            onClick={handleRemoveSelected}
            className="w-full mt-2 flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-xl shadow-lg font-bold hover:bg-red-600 transition"
            title="Удалить выбранные слова из всех режимов"
          >
            <HiTrash className="w-6 h-6 mr-2" />
            Удалить выбранные ({selectedWords.length})
          </button>
        )}
      </div>

      {/* 3. Список слов */}
      <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
        {words.map((word) => {
          const isSelected = selectedWords.some(
            (w) => w.de === word.de && w.lessonId === word.lessonId
          );

          return (
            <div
              key={`${word.de}-${word.lessonId}`}
              className={`p-4 rounded-xl shadow-md flex justify-between items-center cursor-pointer transition duration-150 border-2 ${
                isSelected
                  ? "bg-sky-100 border-sky-500 dark:bg-sky-900 dark:border-sky-600 dark:shadow-xl"
                  : "bg-white border-transparent hover:shadow-lg dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:shadow-xl"
              }`}
              onClick={() => handleToggleSelect(word)}
            >
              <div className="flex items-center space-x-3">
                {isSelected ? (
                  <HiCheckCircle className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                ) : (
                  <HiOutlineAnnotation className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                )}

                <div>
                  <div className="font-bold text-lg text-gray-800 flex items-center dark:text-gray-50">
                    {word.de}
                    <AudioPlayer textToSpeak={word.de} lang="de-DE" />
                  </div>
                  <div className="text-gray-600 text-sm dark:text-gray-300">
                    {word.ru}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatchRemoveFromAll(word);
                }}
                className="p-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition dark:bg-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-600"
                title="Удалить это слово из выученных (из всех режимов)"
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
