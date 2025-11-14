import { useEffect, useState } from "react"; // <-- Добавляем useEffect
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
// Импортируем markLearned/removeLearned и selectLesson
import { markLearned, removeLearned, selectLesson } from "../../store/store";
import { lessons } from "../../data"; // <-- Импортируем список уроков
import AudioPlayer from "../../components/AudioPlayer";

// Импорт иконок
import {
  HiCheckCircle,
  HiArrowLeft,
  HiBookOpen,
  HiEyeOff,
  HiOutlineCheckCircle,
} from "react-icons/hi";

/**
 * Страница, отображающая ПОЛНЫЙ список слов для текущего урока,
 * с возможностью озвучки и отметки статуса (выучено/не выучено).
 */
export default function ListWords() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list, learned } = useSelector((state) => state.words);

  // Слова для отображения: полный список из Redux Store
  // ✅ Убедимся, что words всегда является массивом
  const words = list?.filter((w) => w.lessonId === lessonId) || [];

  // --- Загрузка данных урока при обновлении ---
  useEffect(() => {
    // Если слова урока не загружены, но урок существует в данных, диспатчим selectLesson.
    // Это предотвратит потерю данных при обновлении страницы.
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, dispatch]); // Зависимости: lessonId и dispatch

  // --- Обработчики действий ---

  /** Переключает статус слова между "выучено" и "не выучено". */
const handleToggleLearned = (word, isLearned) => {
  // Создаем чистый объект слова (на всякий случай)
  const wordData = {
    de: word.de,
    ru: word.ru,
    lessonId: word.lessonId,
  };

  if (isLearned) {
    // Отмечаем как невыученное (удаляем из learned)
    // removeLearned принимает чистый объект, поэтому здесь ничего не меняем
    dispatch(removeLearned(wordData));
  } else {
    // Отмечаем как выученное (добавляем в learned)
    // ✅ КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Оборачиваем wordData в объект с полем 'word'
    dispatch(markLearned({ word: wordData }));
  }
};

  /** Возврат на главную страницу урока */
  const handleGoBack = () => {
    navigate(`/lesson/${lessonId}`);
  };

  // --- UI Рендеринг ---

  // 1. Состояние, когда в уроке нет слов (после загрузки)
  if (!lessons[lessonId])
    return <div className="p-6 text-red-500 text-center">Урок не найден.</div>;

  if (words.length === 0)
    return (
      <div className="p-12 text-center text-gray-500 bg-gray-50 min-h-[50vh]">
        <div className="p-8 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 w-full max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-gray-700">Список пуст</h2>
          <p className="mt-2 text-gray-600">
            В этом уроке нет слов или произошла ошибка загрузки.
          </p>
          <Link
            to={`/lesson/${lessonId}`}
            className="mt-4 inline-block px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition font-semibold"
          >
            ← К уроку {lessonId.toUpperCase()}
          </Link>
        </div>
      </div>
    );

  // 2. Основной вид
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Заголовок и Навигация */}
      <div className="w-full max-w-lg mb-6 flex justify-between items-center">
        {/* Кнопка "Назад" */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-sky-700 hover:text-sky-800 transition font-semibold"
        >
          <HiArrowLeft className="w-6 h-6 mr-1" />
          <span className="hidden sm:inline">К уроку</span>
        </button>

        {/* Название урока */}
        <div className="flex items-center text-lg sm:text-2xl font-extrabold text-gray-800">
          <HiBookOpen className="w-6 h-6 mr-2 text-sky-600" />
          <span>Слова: {lessonId.toUpperCase()}</span>
        </div>
      </div>

      {/* Инструкция */}
      <p className="w-full max-w-lg mb-4 text-sm text-gray-600 text-center">
        {words.length} слов в уроке. Нажмите на значок справа, чтобы отметить
        слово как выученное/невыученное.
      </p>

      {/* Список слов */}
      <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
        {words.map((word) => {
          // Определяем, выучено ли слово
          const isLearned = learned.some(
            (w) => w.de === word.de && w.lessonId === word.lessonId
          );

          return (
            <div
              key={`${word.de}-${word.lessonId}`}
              className={`p-4 rounded-xl shadow-md flex justify-between items-center transition duration-150 border-2 ${
                isLearned
                  ? "bg-green-50 border-green-500 hover:shadow-lg"
                  : "bg-white border-gray-200 hover:border-sky-300"
              }`}
              // ✅ Удалили onClick из родительского div, чтобы избежать конфликтов
            >
              <div className="flex items-center space-x-3">
                {/* Статус слова */}
                {isLearned ? (
                  <HiCheckCircle
                    className="w-6 h-6 text-green-500"
                    title="Выучено"
                  />
                ) : (
                  <HiEyeOff
                    className="w-6 h-6 text-gray-400"
                    title="Не выучено"
                  />
                )}

                {/* Слова и компонент Аудио */}
                <div>
                  <div className="font-bold text-lg text-gray-800 flex items-center">
                    {word.de}
                    <AudioPlayer textToSpeak={word.de} lang="de-DE" />
                  </div>
                  <div className="text-gray-600 text-sm">{word.ru}</div>
                </div>
              </div>

              {/* Кнопка "Отметить статус" */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // ✅ Предотвращаем всплытие
                  handleToggleLearned(word, isLearned);
                }}
                className={`p-2 rounded-full transition ${
                  isLearned
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                }`}
                title={
                  isLearned
                    ? "Отметить как невыученное"
                    : "Отметить как выученное"
                }
              >
                {isLearned ? (
                  <HiEyeOff className="w-5 h-5" />
                ) : (
                  <HiOutlineCheckCircle className="w-5 h-5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
