import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
// Импортируем иконки для визуального оформления
import { HiOutlineAcademicCap, HiBookmark } from "react-icons/hi";

// --- Вспомогательная функция для склонения числительных ---
const pluralizeWords = (count) => {
  if (count === 1) return "слово";
  if (count >= 2 && count <= 4) return "слова";
  return "слов";
};

export default function LearnedWords() {
  const { learned } = useSelector((state) => state.words);

  // Собираем уроки, из которых есть выученные слова
  const lessonsMap = learned.reduce((acc, word) => {
    // ✅ ИСПРАВЛЕНИЕ ДАННЫХ: Убеждаемся, что lessonId существует, является строкой и не пустой.
    if (
      word.lessonId &&
      typeof word.lessonId === "string" &&
      word.lessonId.trim() !== ""
    ) {
      const lid = word.lessonId.trim();
      if (!acc[lid]) acc[lid] = [];
      acc[lid].push(word);
    }
    return acc;
  }, {});

  // Получаем массив ID уроков для удобства маппинга
  const lessonIds = Object.keys(lessonsMap).sort(); // Сортируем ID для последовательного отображения

  // --- УСЛОВНЫЙ РЕНДЕРИНГ: Пустой список ---
  if (learned.length === 0)
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 m-6 max-w-sm dark:bg-gray-800 dark:border-gray-700 dark:shadow-xl">
          <HiBookmark className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-50">
            Начните учиться!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Пока нет **выученных слов**. Они появятся здесь, как только вы
            пройдете свой первый урок.
          </p>
        </div>
      </div>
    );

  // --- ОСНОВНОЙ РЕНДЕРИНГ: Список уроков с выученными словами ---
  return (
    <div className="p-4 sm:p-6 flex flex-col items-center w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* Заголовок */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center dark:text-gray-50">
        <HiOutlineAcademicCap className="w-8 h-8 mr-2 text-green-600 dark:text-green-400" />
        Мои **выученные слова**
      </h1>

      <div className="w-full max-w-lg flex flex-col gap-4">
        {lessonIds.map((lessonId) => {
          // Дополнительная защита, хотя благодаря reduce здесь не должно быть undefined
          if (!lessonId) return null;

          const wordCount = lessonsMap[lessonId].length;
          const wordForm = pluralizeWords(wordCount);

          return (
            <Link
              key={lessonId}
              // Ссылка ведет на страницу, где можно просмотреть выученные слова конкретного урока
              to={`/learned/lesson/${lessonId}`}
              className="
                    w-full p-5 bg-white rounded-xl shadow-lg 
                    hover:bg-green-50 transition duration-200 
                    border-l-4 border-green-500 hover:border-green-600 
                    flex justify-between items-center
                    dark:bg-gray-800 dark:shadow-xl dark:border-green-600 
                    dark:hover:bg-gray-700 dark:hover:border-green-500
                "
            >
              <div className="flex items-center space-x-3">
                {/* Иконка */}
                <HiBookmark className="w-6 h-6 text-green-600 dark:text-green-400" />

                {/* Название урока */}
                <span className="font-semibold text-lg text-gray-800 dark:text-gray-50">
                  Урок {lessonId.toUpperCase()}
                </span>
              </div>

              {/* Количество слов с правильным склонением */}
              <div className="flex items-center justify-center px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-sm dark:bg-green-700 dark:text-green-200">
                {wordCount} {wordForm}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
