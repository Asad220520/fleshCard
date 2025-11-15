import { HiCheckCircle } from "react-icons/hi";

// 💡 ДОБАВЛЕН ПРОПС onRepeat
export default function LessonComplete({ lessonId, onGoBack, onRepeat }) {
  return (
    <div className="flex flex-col items-center p-8 bg-gray-50 min-h-[50vh] dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center p-8 text-green-700 bg-white rounded-xl shadow-xl border-4 border-green-500 m-6 max-w-sm dark:bg-gray-800 dark:border-green-600 dark:shadow-2xl">
        <HiCheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 dark:text-green-400" />
        <h2 className="text-2xl font-bold dark:text-gray-50">
          Урок {lessonId.toUpperCase()} завершен!
        </h2>
        <div className="flex flex-col space-y-4 mt-6 *:space-x-0 sm:*space-x-4 sm:flex-row sm:space-y-0 justify-center *:items-center *:justify-center *:text-center *:w-full sm:*w-auto ">
          <button
            // 💡 Вызываем onRepeat (который будет очищать прогресс)
            onClick={onRepeat}
            className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition font-semibold dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            Повторить урок
          </button>
          <button
            onClick={onGoBack}
            className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition font-semibold dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            К уроку
          </button>
        </div>
      </div>
    </div>
  );
}
