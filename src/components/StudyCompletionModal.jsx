import React from "react";
import { HiCheckCircle, HiArrowPath, HiXCircle } from "react-icons/hi2";

/**
 * Модальное окно, отображаемое после прохождения всех слов/предложений в сессии.
 *
 * @param {Object} props
 * @param {Array} [props.wordsToLearn] - Список слов, просмотренных в сессии (для режима слов). По умолчанию [].
 * @param {function} props.onRestart - Функция для перезапуска текущего режима (сброс индекса/состояния).
 * @param {function} props.onClose - Функция для закрытия модального окна и перехода.
 * @param {function} [props.onMarkAll] - Функция для отметки всех слов как выученных. (Нужна только в режиме слов).
 * @param {string} props.modeName - Название текущего режима.
 * @param {number} [props.completedItemsCount] - Количество завершенных элементов (для режима предложений).
 * @param {number} [props.remainingCount] - Сколько элементов осталось для следующего батча.
 * @param {boolean} [props.isFullLessonComplete] - Флаг, указывающий, завершен ли ВЕСЬ урок.
 */
export default function StudyCompletionModal({
  // 🔑 Инициализация wordsToLearn пустым массивом для защиты от ошибки .length
  wordsToLearn = [],
  onRestart,
  onClose,
  onMarkAll,
  modeName,
  // Новые пропсы
  completedItemsCount,
  remainingCount = 0,
  isFullLessonComplete = false,
}) {
  // 🔑 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Определяем счетчик.
  // Если передан completedItemsCount (для предложений), используем его.
  // Иначе используем wordsToLearn.length (для слов).
  const completedCount =
    completedItemsCount !== undefined
      ? completedItemsCount
      : wordsToLearn.length;

  // Определяем, какой текст отображать и какую кнопку "Дальше" использовать
  const isSentenceMode = completedItemsCount !== undefined;

  // Текст для кнопки "Отметить как выученное" (недоступна в режиме предложений)
  const markAllText = isSentenceMode
    ? "Продолжить" // Если это предложения, то кнопка просто продолжает
    : `Отметить все ${completedCount} как выученные`;

  // Текст для заголовка модального окна
  let titleText = "Сессия завершена!";
  if (isSentenceMode && remainingCount > 0) {
    titleText = "Батч завершен";
  } else if (isSentenceMode && isFullLessonComplete) {
    titleText = "Отличная работа!";
  }

  // Текст описания
  let descriptionText;
  if (isSentenceMode && isFullLessonComplete) {
    descriptionText = `Вы прошли все ${completedCount} предложений в этом уроке!`;
  } else if (isSentenceMode && remainingCount > 0) {
    descriptionText = `Вы завершили ${completedCount} предложений. Осталось: ${remainingCount}.`;
  } else {
    descriptionText = `Вы прошли **${completedCount}** слов в режиме "${modeName}".`;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100 dark:bg-gray-800">
        <div className="text-center mb-6">
          <HiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50">
            {titleText}
          </h2>
          <p className="text-gray-600 mt-2 dark:text-gray-400">
            {descriptionText}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Кнопка "Выучить все" / "Продолжить" */}
          <button
            onClick={onMarkAll} // В режиме предложений onMarkAll должен выполнять функцию onRestart/handleContinue
            className={`flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 transition duration-150 ${
              isSentenceMode && isFullLessonComplete ? "hidden" : "" // Скрываем, если весь урок завершен в режиме предложений
            }`}
          >
            <HiCheckCircle className="w-5 h-5 mr-2" />
            {markAllText}
          </button>

          {/* Кнопка "Повторить" */}
          <button
            onClick={onRestart}
            className="flex items-center justify-center px-4 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition duration-150 dark:bg-sky-600 dark:hover:bg-sky-700"
          >
            <HiArrowPath className="w-5 h-5 mr-2" />
            {isSentenceMode ? "Загрузить следующий батч" : "Повторить урок"}
          </button>

          {/* Кнопка "Выход" */}
          <button
            onClick={onClose}
            className="flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition duration-150 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <HiXCircle className="w-5 h-5 mr-2" />
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
