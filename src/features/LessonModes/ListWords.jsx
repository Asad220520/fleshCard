import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
// Импортируем markLearned/removeLearned и selectLesson
import { markLearned, removeLearned, selectLesson } from "../../store/store";
import { lessons } from "../../data";
import AudioPlayer from "../../components/AudioPlayer";

// Импорт иконок
import {
  HiCheckCircle,
  HiArrowLeft,
  HiBookOpen,
  HiEyeOff,
  HiOutlineCheckCircle,
} from "react-icons/hi";

// 💡 КОНСТАНТА: Выбираем целевой режим для ручного управления
const TARGET_MODE = 'flashcards'; // Будем использовать learnedFlashcards для чтения/записи

/**
 * Страница, отображающая ПОЛНЫЙ список слов для текущего урока,
 * с возможностью озвучки и отметки статуса (выучено/не выучено).
 * Включает отображение примеров предложений (exde, exru).
 */
export default function ListWords() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 💡 ИСПОЛЬЗУЕМ learnedFlashcards ВМЕСТО УСТАРЕВШЕГО learned
  const { list, learnedFlashcards } = useSelector((state) => state.words);
  
  // Слова для отображения: полный список из Redux Store
  const words = list?.filter((w) => w.lessonId === lessonId) || [];

  // --- Загрузка данных урока при обновлении ---
  useEffect(() => {
    // Если слова урока не загружены, но урок существует в данных, диспатчим selectLesson.
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, dispatch]);

  // --- Обработчики действий ---

  /** Переключает статус слова между "выучено" и "не выучено". */
  const handleToggleLearned = (word, isLearned) => {
    // ✅ ИСПРАВЛЕНИЕ: Передаем ПОЛНЫЙ объект слова и ОБЯЗАТЕЛЬНО режим (mode).
    const wordData = {
      ...word, // Копируем все поля (de, ru, exde, exru, lessonId и т.д.)
      mode: TARGET_MODE, // 💡 ОБЯЗАТЕЛЬНО ДОБАВЛЯЕМ РЕЖИМ
    };

    if (isLearned) {
      // Отмечаем как невыученное (удаляем из learned).
      // removeLearned ожидает {de, lessonId, mode}
      dispatch(removeLearned(wordData));
    } else {
      // Отмечаем как выученное (добавляем в learned).
      // markLearned ожидает { word: wordData, mode }
      // В Redux Store markLearned извлекает mode из wordData, но лучше передать явно
      dispatch(markLearned({ word: wordData, mode: TARGET_MODE }));
    }
  };

  /** Возврат на главную страницу урока */
  const handleGoBack = () => {
    navigate(`/lesson/${lessonId}`);
  };

  // --- UI Рендеринг ---

  // 1. Состояние, когда в уроке нет слов (после загрузки)
  if (!lessons[lessonId])
    return (
      <div className="p-6 text-red-500 text-center dark:bg-gray-900 dark:text-red-400 min-h-screen">
        Урок не найден.
      </div>
    );

  if (words.length === 0)
    return (
      <div className="p-12 text-center text-gray-500 bg-gray-50 min-h-[50vh] dark:bg-gray-900">
        <div className="p-8 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 w-full max-w-lg mx-auto dark:bg-gray-800 dark:border-gray-700 dark:shadow-xl">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-50">
            Список пуст
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            В этом уроке нет слов или произошла ошибка загрузки.
          </p>
          <Link
            to={`/lesson/${lessonId}`}
            className="mt-4 inline-block px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition font-semibold dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            ← К уроку {lessonId.toUpperCase()}
          </Link>
        </div>
      </div>
    );

  // 2. Основной вид
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* Заголовок и Навигация */}
      <div className="w-full max-w-lg mb-6 flex justify-between items-center">
        {/* Кнопка "Назад" */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-sky-700 hover:text-sky-800 transition font-semibold dark:text-sky-400 dark:hover:text-sky-300"
        >
          <HiArrowLeft className="w-6 h-6 mr-1" />
          <span className="hidden sm:inline">К уроку</span>
        </button>
        {/* Название урока */}
        <div className="flex items-center text-lg sm:text-2xl font-extrabold text-gray-800 dark:text-gray-50">
          <HiBookOpen className="w-6 h-6 mr-2 text-sky-600 dark:text-sky-400" />
          <span>Слова: {lessonId.toUpperCase()}</span>
        </div>
        <div className="w-16"></div> {/* Для выравнивания */}
      </div>

      {/* Инструкция */}
      <p className="w-full max-w-lg mb-4 text-sm text-gray-600 text-center dark:text-gray-400">
        {words.length} слов в уроке. Нажмите на значок справа, чтобы отметить
        слово как выученное/невыученное. (Используется прогресс режима{" "}
        <span className="font-bold">Флеш-карт</span>).
      </p>

      {/* Список слов */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-lg">
        {words.map((word) => {
          // Определяем, выучено ли слово
          const isLearned = learnedFlashcards.some( // 💡 ИСПОЛЬЗУЕМ learnedFlashcards
            // Проверка должна быть по de и lessonId (как и в Redux)
            (w) => w.de === word.de && w.lessonId === word.lessonId
          );

          return (
            <div
              key={`${word.de}-${word.lessonId}`}
              className={`p-4 rounded-xl shadow-md flex justify-between items-start transition duration-150 border-2 ${
                isLearned
                  ? "bg-green-50 border-green-500 hover:shadow-lg dark:bg-green-900 dark:border-green-600 dark:shadow-xl"
                  : "bg-white border-gray-200 hover:border-sky-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-sky-500 dark:shadow-xl"
              }`}
            >
              <div className="flex-1 min-w-0 pr-4">
                {/* 1. Основные слова (DE / RU) и статус */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {/* Статус слова */}
                    {isLearned ? (
                      <HiCheckCircle
                        className="w-6 h-6 text-green-500 flex-shrink-0 dark:text-green-400"
                        title="Выучено"
                      />
                    ) : (
                      <HiEyeOff
                        className="w-6 h-6 text-gray-400 flex-shrink-0 dark:text-gray-500"
                        title="Не выучено"
                      />
                    )}

                    {/* Слова и компонент Аудио */}
                    <div className="min-w-0">
                      <div className="font-bold text-lg text-gray-800 flex items-center dark:text-gray-50">
                        {word.de}
                        <AudioPlayer textToSpeak={word.de} lang="de-DE" />
                      </div>
                      <div className="text-gray-600 text-sm dark:text-gray-300">
                        {word.ru}
                      </div>
                    </div>
                  </div>
                  {/* Перевод */}
                  <span className="font-semibold text-lg text-sky-700 dark:text-sky-400">
                    {word.ru}
                  </span>
                </div>

                {/* 2. БЛОК: Предложения (exde / exru) */}
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Пример:
                  </p>
                  {/* Немецкое предложение */}
                  <div className="text-base text-gray-700 dark:text-gray-200 flex items-center mb-1">
                    **{word.exde || "—"}**
                    {/* Аудиоплеер для предложения */}
                    <AudioPlayer textToSpeak={word.exde} lang="de-DE" />
                  </div>
                  {/* Русское предложение */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {word.exru || "—"}
                  </div>
                </div>
              </div>

              {/* Кнопка "Отметить статус" (Вынесена вправо) */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем всплытие
                  handleToggleLearned(word, isLearned);
                }}
                className={`p-3 rounded-full transition flex-shrink-0 self-center ml-2 ${
                  isLearned
                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-700 dark:text-green-200 dark:hover:bg-green-600"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-700 dark:text-sky-200 dark:hover:bg-sky-600"
                }`}
                title={
                  isLearned
                    ? "Отметить как невыученное"
                    : "Отметить как выученное"
                }
              >
                {isLearned ? (
                  <HiEyeOff className="w-6 h-6" />
                ) : (
                  <HiOutlineCheckCircle className="w-6 h-6" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}