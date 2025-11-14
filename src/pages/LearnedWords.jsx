import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
// Импортируем иконки для визуального оформления
import { HiOutlineAcademicCap, HiBookmark } from "react-icons/hi";

export default function LearnedWords() {
  const { learned } = useSelector((state) => state.words);

  // Собираем уроки, из которых есть выученные слова
  const lessonsMap = learned.reduce((acc, word) => {
    if (!acc[word.lessonId]) acc[word.lessonId] = [];
    acc[word.lessonId].push(word);
    return acc;
  }, {});

  // Получаем массив ID уроков для удобства маппинга
  const lessonIds = Object.keys(lessonsMap);

  if (learned.length === 0)
    return (
      <div className="flex flex-col items-center p-12 bg-gray-50 min-h-[50vh]">
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 m-6 max-w-sm">
          <HiBookmark className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-700">Начните учиться!</h2>
          <p className="mt-2 text-gray-600">
            Пока нет выученных слов. Они появятся здесь, как только вы пройдете
            свой первый урок.
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center w-full bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Заголовок */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
        <HiOutlineAcademicCap className="w-8 h-8 mr-2 text-green-600" />
        Мои выученные слова
      </h1>

      <div className="w-full max-w-lg flex flex-col gap-4">
        {lessonIds.map((lessonId) => {
          const wordCount = lessonsMap[lessonId].length;

          return (
            <Link
              key={lessonId}
              to={`/learned/lesson/${lessonId}`}
              className="
                    w-full p-5 bg-white rounded-xl shadow-lg 
                    hover:bg-green-50 transition duration-200 
                    border-l-4 border-green-500 hover:border-green-600 
                    flex justify-between items-center
                "
            >
              <div className="flex items-center space-x-3">
                {/* Иконка */}
                <HiBookmark className="w-6 h-6 text-green-600" />

                {/* Название урока */}
                <span className="font-semibold text-lg text-gray-800">
                  Урок {lessonId.toUpperCase()}
                </span>
              </div>

              {/* Количество слов */}
              <div className="flex items-center justify-center px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                {wordCount} {wordCount === 1 ? "слово" : "слов"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
