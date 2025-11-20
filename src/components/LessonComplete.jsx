import { HiCheckCircle, HiHome, HiClock, HiArrowLeft } from "react-icons/hi";

/**
 * Компонент LessonComplete
 * * @param {string} lessonId - ID завершенного урока.
 * @param {function} onGoBack - Функция для возврата к списку уроков.
 * @param {function} onRepeat - Функция, вызываемая при нажатии кнопки "Повторить".
 * @param {string} [message] - Кастомное сообщение о завершении.
 * @param {string} [repeatText] - Кастомный текст для кнопки повтора.
 */
export default function LessonComplete({
  lessonId,
  onGoBack,
  onRepeat,
  message,
  repeatText,
}) {
  const completionMessage =
    message || `Урок "${lessonId.toUpperCase()}" завершен!`;
  const buttonText = repeatText || "Повторить урок";

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-50 dark:bg-gray-900  transition-colors duration-300">
      {/* Основная карточка: чистая, с мягкой тенью и тонкой границей */}
      <div className="text-center w-full max-w-sm p-8 sm:p-12 bg-white rounded-3xl shadow-lg border-t-4 border-teal-500 dark:bg-gray-800 transform transition-all duration-500 hover:shadow-xl">
        {/* Иконка с изысканной анимацией */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Уменьшен размер иконок */}
          <HiCheckCircle className="w-full h-full text-teal-500 dark:text-teal-400 opacity-20 absolute top-0 left-0 animate-spin-slow" />
          <HiCheckCircle className="w-full h-full text-teal-500 dark:text-teal-400 absolute top-0 left-0 animate-pulse-subtle" />
        </div>

        {/* Текст */}
        <h2 className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mb-2 tracking-wide">
          Успех!
        </h2>
        <p className="text-base text-gray-700 dark:text-gray-300">
          {completionMessage}
        </p>

        <hr className="my-6 border-gray-100 dark:border-gray-700/50" />

        {/* Блок действий */}
        <div className="flex flex-col space-y-3">
          {/* Кнопка 1: Повтор (Чистый Teal цвет) */}
          <button
            onClick={onRepeat}
            className="w-full flex items-center justify-center space-x-2 
                       px-5 py-3 
                       bg-teal-600 text-white 
                       rounded-xl shadow-md hover:bg-teal-700 
                       active:scale-[0.99] 
                       transition-all duration-200 font-bold text-lg transform"
          >
            <HiClock className="w-5 h-5" />
            <span>{buttonText}</span>
          </button>

          {/* Кнопка 2: Аккуратный возврат */}
          <button
            onClick={onGoBack}
            className="w-full flex items-center justify-center space-x-2 
                       px-5 py-3 
                       bg-gray-100 text-gray-700 border border-gray-300 
                       rounded-xl shadow-sm
                       hover:bg-gray-200 active:scale-[0.99] 
                       transition-all duration-200 font-semibold text-base
                       dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>К списку уроков</span>
          </button>
        </div>
      </div>

      {/* Стили для аккуратной и завораживающей анимации */}
      {/* 💡 ИСПРАВЛЕНИЕ ОШИБКИ: Заменил 'jsx' на 'true' */}
      <style global="true">{`
        @keyframes pulse-subtle {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7; /* Сделал пульсацию менее заметной */
            transform: scale(1.03);
          }
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
