import React from "react";
import { HiCheckCircle, HiArrowPath, HiXCircle } from "react-icons/hi2";

/**
 * Модальное окно, отображаемое после прохождения всех слов/предложений в сессии.
 *
 * @param {Object} props
 * @param {Array} [props.wordsToLearn] - Список слов, просмотренных в сессии (для режима слов). По умолчанию [].
 * @param {function} props.onRestart - Функция для перезапуска текущего режима (сброс индекса/состояния).
 * @param {function} props.onClose - Функция для закрытия модального окна и перехода.
 * @param {function} [props.onMarkAll] - Функция для отметки всех слов как выученных. (Используется только в режиме слов).
 * @param {string} props.modeName - Название текущего режима.
 * @param {number} [props.completedItemsCount] - Количество завершенных элементов (для режима предложений).
 * @param {number} [props.remainingCount] - Сколько элементов осталось для следующего батча.
 * @param {boolean} [props.isFullLessonComplete] - Флаг, указывающий, завершен ли ВЕСЬ урок.
 */
export default function StudyCompletionModal({
  wordsToLearn = [],
  onRestart,
  onClose,
  onMarkAll,
  modeName,
  completedItemsCount,
  remainingCount = 0,
  isFullLessonComplete = false,
}) {
  // Определяем счетчик.
  const completedCount =
    completedItemsCount !== undefined
      ? completedItemsCount
      : wordsToLearn.length;

  // Определяем, работаем ли мы с режимом предложений
  const isSentenceMode = completedItemsCount !== undefined;

  // --- Заголовки и Тексты ---

  let titleText = "Сессия завершена!";
  if (isSentenceMode && remainingCount > 0) {
    titleText = "Батч завершен";
  } else if (isSentenceMode && isFullLessonComplete) {
    titleText = "Отличная работа!";
  } else if (!isSentenceMode && remainingCount === 0) {
    titleText = "Поздравляем!"; // Весь урок слов завершен
  }

  let descriptionText;
  if (isSentenceMode && isFullLessonComplete) {
    descriptionText = `Вы прошли все ${completedCount} предложений в этом уроке!`;
  } else if (isSentenceMode && remainingCount > 0) {
    descriptionText = `Вы завершили ${completedCount} предложений. Осталось: ${remainingCount}.`;
  } else if (isSentenceMode && remainingCount === 0 && !isFullLessonComplete) {
    descriptionText = `Вы завершили ${completedCount} предложений. Нажмите "Выйти", чтобы увидеть полный прогресс.`;
  } else {
    // Режим слов
    descriptionText = `Вы прошли **${completedCount}** слов в режиме "${modeName}".`;
  }

  const restartButtonText =
    isSentenceMode && remainingCount > 0
      ? "Продолжить / Загрузить следующий батч"
      : "Повторить урок";

  const showMarkAllButton = !isSentenceMode; // Кнопка "Отметить все" только для режимов слов

  // --- UI Рендеринг ---

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
          {/* Кнопка "Отметить все как выученные" (Только для режима слов) */}
          {showMarkAllButton && (
            <button
              onClick={onMarkAll}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 transition duration-150 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <HiCheckCircle className="w-5 h-5 mr-2" />
              Отметить все {completedCount} как выученные
            </button>
          )}

          {/* Кнопка "Повторить" / "Продолжить" (Обязательная) */}
          <button
            onClick={onRestart}
            className={`flex items-center justify-center px-4 py-3 text-white rounded-xl font-semibold transition duration-150 ${
              showMarkAllButton
                ? "bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
                : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            }`}
          >
            <HiArrowPath className="w-5 h-5 mr-2" />
            {restartButtonText}
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
