import React from "react";
import { useDispatch } from "react-redux";
import { markLearned } from "../store/store";
import { HiCheckCircle, HiArrowPath, HiXCircle } from "react-icons/hi2"; // Используем hi2 для более современных иконок

/**
 * Модальное окно, отображаемое после прохождения всех слов в режиме обучения.
 * @param {Object} props
 * @param {Array} props.wordsToLearn - Список слов, которые были просмотрены в текущей сессии.
 * @param {function} props.onRestart - Функция для перезапуска текущего режима (сброс индекса/состояния).
 * @param {function} props.onClose - Функция для закрытия модального окна и перехода (например, на главную).
 * @param {string} props.modeName - Название текущего режима (для текста).
 */
export default function StudyCompletionModal({
  wordsToLearn,
  onRestart,
  onClose,
  modeName,
}) {
  const dispatch = useDispatch();

  // Количество слов, которые нужно выучить
  const count = wordsToLearn.length;

  const handleMarkAllLearned = () => {
    wordsToLearn.forEach((word) => {
      dispatch(markLearned({ word }));
    });
    // Закрываем модальное окно после выполнения действия
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100">
        <div className="text-center mb-6">
          <HiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">
            Сессия завершена!
          </h2>
          <p className="text-gray-600 mt-2">
            Вы прошли **{count}** слов в режиме "{modeName}".
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Кнопка "Выучить все" */}
          <button
            onClick={handleMarkAllLearned}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 transition duration-150"
          >
            <HiCheckCircle className="w-5 h-5 mr-2" />
            Отметить все {count} как выученные
          </button>

          {/* Кнопка "Повторить" */}
          <button
            onClick={onRestart}
            className="flex items-center justify-center px-4 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition duration-150"
          >
            <HiArrowPath className="w-5 h-5 mr-2" />
            Повторить урок
          </button>

          {/* Кнопка "Выход" */}
          <button
            onClick={onClose}
            className="flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition duration-150"
          >
            <HiXCircle className="w-5 h-5 mr-2" />
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
