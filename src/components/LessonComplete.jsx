import { HiCheckCircle, HiHome, HiClock, HiArrowLeft } from "react-icons/hi"; // Добавил иконки для кнопок

// 💡 ДОБАВЛЕН ПРОПС onRepeat
export default function LessonComplete({ lessonId, onGoBack, onRepeat }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-50 min-h-[50vh] dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center w-full max-w-sm p-6 sm:p-8 bg-white rounded-2xl shadow-2xl border-4 border-green-500 dark:bg-gray-800 dark:border-green-600">
        {/* Иконка и заголовок */}
        <HiCheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 dark:text-green-400 animate-pulse" />
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-50 mb-2">
          Успех!
        </h2>
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Урок "{lessonId.toUpperCase()}" завершен!
        </p>

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

        {/* Блок действий с улучшенной типографикой и стилями кнопок */}
        <div className="flex flex-col space-y-3">
          {/* Основное действие: Повторить урок (Primary Button) */}
          <button
            onClick={onRepeat}
            className="w-full flex items-center justify-center space-x-2 
                       px-5 py-3 
                       bg-sky-600 text-white 
                       rounded-xl shadow-md 
                       hover:bg-sky-700 active:scale-[0.98] 
                       transition-all duration-200 font-bold text-base"
          >
            <HiClock className="w-5 h-5" />
            <span>Повторить урок</span>
          </button>

          {/* Второстепенное действие: Вернуться к списку (Secondary Button) */}
          <button
            onClick={onGoBack}
            className="w-full flex items-center justify-center space-x-2 
                       px-5 py-3 
                       bg-gray-200 text-gray-800 
                       rounded-xl 
                       hover:bg-gray-300 active:scale-[0.98] 
                       transition-all duration-200 font-semibold text-base
                       dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>К списку уроков</span>
          </button>
        </div>
      </div>
    </div>
  );
}
