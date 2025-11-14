import { lessonsList } from "../data";
import { Link } from "react-router-dom";
// Импортируем иконку книги для каждого урока
import { HiOutlineBookOpen } from "react-icons/hi";

export default function LessonsList() {
  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
      {/* Заголовок */}
      <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6 sm:mb-8">
        Выберите урок
      </h1>

      {/* Адаптивная сетка уроков */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {lessonsList.map((lesson, index) => (
          <Link
            key={lesson}
            to={`/lesson/${lesson}`}
            className="
              flex items-center justify-between
              p-5 bg-white rounded-xl shadow-lg 
              transition duration-300 ease-in-out
              transform hover:scale-[1.02] hover:shadow-xl
              border-l-4 border-sky-500 hover:border-sky-600
            "
          >
            {/* Левая часть: Иконка и название урока */}
            <div className="flex items-center space-x-4">
              {/* Иконка */}
              <HiOutlineBookOpen className="w-6 h-6 text-sky-500" />

              {/* Название урока */}
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Урок {index + 1}
                </span>
                <p className="text-lg font-semibold text-gray-800">
                  {lesson.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Правая часть: Указатель (опционально, можно добавить стрелку) */}
            {/* <HiArrowRight className="w-5 h-5 text-gray-400" /> */}
          </Link>
        ))}
      </div>
    </div>
  );
}
