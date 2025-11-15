import { useSelector } from "react-redux";
import { lessonsList, lessons } from "../data";
import { Link } from "react-router-dom";
// Импортируем иконки
import { HiOutlineBookOpen, HiArrowRight, HiCheckCircle } from "react-icons/hi";

// --- Вспомогательная функция для получения уникальных выученных слов ---
const getUniqueLearnedWords = (wordsState) => {
    const allWords = [
      ...wordsState.learnedFlashcards,
      ...wordsState.learnedMatching,
      ...wordsState.learnedQuiz,
      ...wordsState.learnedWriting,
    ];
    
    const uniqueWordsMap = new Map();
    
    allWords.forEach((word) => {
      // Ключ для уникальности: Немецкое слово + ID урока
      const key = `${word.de}-${word.lessonId}`;
      if (!uniqueWordsMap.has(key)) {
        uniqueWordsMap.set(key, word);
      }
    });

    return Array.from(uniqueWordsMap.values());
};

export default function LessonsList() {
  // 💡 ОБНОВЛЕНИЕ: Получаем все необходимые части стейта
  const wordsState = useSelector((state) => state.words);
  const { list } = wordsState;
  
  // Рассчитываем уникальный объединенный список выученных слов один раз
  const allUniqueLearned = getUniqueLearnedWords(wordsState);

  // 💡 ОБНОВЛЕНИЕ: Функция для расчета прогресса
  const getProgress = (lessonId) => {
    // 1. Все слова в этом уроке (из data.js)
    const allWords = lessons[lessonId] ? lessons[lessonId].length : 0;

    // 2. Выученные слова в этом уроке (из объединенного списка)
    const learnedCount = allUniqueLearned.filter((w) => w.lessonId === lessonId).length;

    // 3. Слов в Redux (иногда нужно для полной картины)
    const totalInStore = list
      ? list.filter((w) => w.lessonId === lessonId).length
      : 0;

    // Если список слов в Redux еще не загружен, используем данные из data.js
    const total = totalInStore > 0 ? totalInStore : allWords;

    return {
      learned: learnedCount,
      total: total,
      // 💡 Проверка завершенности: выученные слова должны совпадать с общим количеством слов
      isComplete: total > 0 && learnedCount === total,
    };
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Заголовок */}
      <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6 sm:mb-8 dark:text-gray-100">
        Выберите урок
      </h1>

      {/* Адаптивная сетка уроков */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {lessonsList.map((lesson, index) => {
          const progress = getProgress(lesson);
          const isComplete = progress.isComplete;

          return (
            <Link
              key={lesson}
              to={`/lesson/${lesson}`}
              className={`
                flex items-center justify-between
                p-5 bg-white rounded-xl shadow-lg 
                transition duration-300 ease-in-out
                transform hover:scale-[1.02] hover:shadow-xl
                
                // 🆕 Стили для Dark Mode
                dark:bg-gray-800 dark:shadow-2xl dark:border-gray-700
                
                // 🆕 Стиль границы в зависимости от прогресса
                border-l-4 
                ${
                  isComplete
                    ? "border-green-500 hover:border-green-600"
                    : "border-sky-500 hover:border-sky-600"
                }
              `}
            >
              {/* Левая часть: Иконка, название и прогресс */}
              <div className="flex items-center space-x-4">
                {/* Иконка */}
                <div
                  className={`p-2 rounded-full ${
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

                {/* Название урока и прогресс */}
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Урок {index + 1}
                  </span>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-50">
                    {lesson.toUpperCase()}
                  </p>

                  {/* 🆕 Индикатор прогресса */}
                  <div className="mt-1 flex items-center text-xs">
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

              {/* 🆕 Правая часть: Стрелка */}
              <HiArrowRight className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}