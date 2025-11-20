import React from "react";
import { HiCheckCircle, HiArrowPath, HiXCircle } from "react-icons/hi2";

/**
 * Модальное окно, отображаемое после прохождения всех слов/предложений в сессии.
 *
 * @param {Object} props
 * @param {Array} [props.wordsToLearn] - Список слов, просмотренных в сессии (для режима слов). По умолчанию [].
 * @param {function} props.onRestart - Функция для перезапуска текущего режима (сброс индекса/состояния).
 * @param {function} props.onClose - Функция для закрытия модального окна и перехода.
 * @param {string} props.modeName - Название текущего режима.
 * @param {number} [props.completedItemsCount] - Количество завершенных элементов (для режима предложений).
 * @param {number} [props.remainingCount] - Сколько элементов осталось для следующего батча.
 * @param {boolean} [props.isFullLessonComplete] - Флаг, указывающий, завершен ли ВЕСЬ урок.
 */
export default function StudyCompletionModal({
  wordsToLearn = [],
  onRestart,
  onClose,
  // ❌ onMarkAll удален из пропсов
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
  let iconColorClass = "text-green-500";
  let iconComponent = HiCheckCircle;

  if (isSentenceMode && isFullLessonComplete) {
    titleText = "Отличная работа! Урок завершен.";
    iconColorClass = "text-green-500";
  } else if (isSentenceMode && remainingCount > 0) {
    titleText = "Батч завершен";
    iconColorClass = "text-sky-500";
  } else if (!isSentenceMode && !isFullLessonComplete) {
    titleText = "Сессия завершена!";
    iconColorClass = "text-sky-500";
  } else if (!isSentenceMode && isFullLessonComplete) {
    titleText = "Поздравляем! Урок завершен.";
    iconColorClass = "text-green-500";
  }

  // Определяем текст описания
  let descriptionText;
  if (isFullLessonComplete) {
    descriptionText = `Вы прошли все ${completedCount} ${
      isSentenceMode ? "предложений" : "слов"
    } в этом уроке!`;
  } else if (isSentenceMode && remainingCount > 0) {
    descriptionText = `Вы завершили ${completedCount} предложений. Осталось: **${remainingCount}**.`;
  } else {
    // Режим слов или режим предложений без оставшихся батчей
    descriptionText = `Вы прошли **${completedCount}** ${
      isSentenceMode ? "элементов" : "слов"
    } в режиме "${modeName}".`;
  }

  // Определяем текст кнопки "Повторить/Продолжить"
  const restartButtonText =
    isSentenceMode && remainingCount > 0
      ? "Продолжить / Следующий батч"
      : "Повторить сессию";

  // --- UI Рендеринг ---

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100 dark:bg-gray-800">
        <div className="text-center mb-6">
          {/* Динамическая иконка и цвет */}
          <iconComponent
            className={`w-12 h-12 ${iconColorClass} mx-auto mb-3`}
          />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50">
            {titleText}
          </h2>
          <p className="text-gray-600 mt-2 dark:text-gray-400">
            {descriptionText}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* 💡 НОВАЯ КНОПКА: "Следующий" или "Выйти" */}
          {/* Если весь урок завершен, эта кнопка не нужна, остается только Выйти и Повторить */}
          {!isFullLessonComplete && (
            <button
              onClick={onRestart} // Используем onRestart для перехода к следующему батчу/повтора сессии
              className="flex items-center justify-center px-4 py-3 bg-sky-500 text-white rounded-xl font-bold shadow-md hover:bg-sky-600 transition duration-150 dark:bg-sky-600 dark:hover:bg-sky-700"
            >
              <HiArrowPath className="w-5 h-5 mr-2" />
              {restartButtonText}
            </button>
          )}

          {/* Кнопка "Повторить сессию" (Только если урок НЕ завершен, иначе становится главной кнопкой) 
             Если урок полностью завершен, кнопка выше исчезает, и эта становится "Повторить урок".
          */}
          {!isFullLessonComplete && (
            <button
              onClick={onRestart}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl font-semibold transition duration-150 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <HiArrowPath className="w-5 h-5 mr-2" />
              Повторить текущую сессию
            </button>
          )}

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
