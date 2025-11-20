// FolderContentPage.jsx

import React, { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiPlus, HiOutlineChevronLeft, HiFolderOpen } from "react-icons/hi";
import { LessonCardsView } from "./LessonCardsView";

/**
 * Компонент для отображения уроков внутри выбранной папки.
 * Получает ID папки из URL (useParams) и данные/обработчики через пропсы (или через Redux/Context).
 *
 * @param {object} props - Должен содержать все необходимые данные и функции.
 * @param {object} props.lessonsData - Все уроки.
 * @param {object} props.foldersData - Все папки.
 * @param {object} props.groupedLessons - Уроки, сгруппированные по папкам.
 * @param {function} props.getProgress - Функция для получения прогресса урока.
 * @param {function} props.handleCardClick - Обработчик клика по карточке урока.
 * @param {function} props.handleEditLesson - Обработчик редактирования урока.
 * @param {function} props.handleDeleteLesson - Обработчик удаления урока.
 * @param {function} props.exportSingleLesson - Обработчик экспорта урока.
 * @param {function} props.handleAddLessonToFolder - Обработчик добавления нового урока.
 */
export default function FolderContentPage({
  lessonsData,
  foldersData,
  groupedLessons,
  getProgress,
  handleCardClick,
  handleEditLesson,
  handleDeleteLesson,
  exportSingleLesson,
  handleAddLessonToFolder,
}) {
  // 1. Получение данных из URL
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);

  // 2. Получение данных папки и уроков
  const selectedFolder = useMemo(
    () => foldersData?.[folderId],
    [foldersData, folderId]
  );
  const currentLessons = useMemo(
    () => groupedLessons?.[folderId] || [],
    [groupedLessons, folderId]
  );

  // 3. Обработчик кнопки "Назад"
  const handleGoBack = useCallback(() => {
    navigate("/"); // Возвращаемся на роут со списком папок
  }, [navigate]);

  // 4. Проверка на отсутствие данных папки
  if (!selectedFolder) {
    // Отображаем сообщение о загрузке или ошибке, пока данные не придут
    return (
      <div className="p-6 text-xl text-gray-700 dark:text-gray-300 min-h-screen">
        Загрузка данных папки...
        {/* Можно добавить кнопку для возврата, если загрузка зависла */}
        <button
          onClick={handleGoBack}
          className="mt-4 text-sky-600 hover:underline"
        >
          Вернуться к папкам
        </button>
      </div>
    );
  }

  // 5. Рендеринг содержимого папки
  return (
    <div className="p-4 sm:p-6 pb-24 sm:pb-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50 flex items-center">
          <button
            onClick={handleGoBack}
            className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Вернуться к списку папок"
          >
            <HiOutlineChevronLeft className="w-6 h-6" />
          </button>
          <HiFolderOpen className="w-6 h-6 mr-2 text-amber-500" />
          {/* ✅ Защита не требуется, так как мы проверяем selectedFolder выше */}
          {selectedFolder.name}
          <span className="text-base text-gray-500 dark:text-gray-400 ml-3">
            {/* ✅ Используем опциональную цепочку для дополнительной безопасности, 
                 хотя здесь уже защищено проверкой "if (!selectedFolder)" */}
            ({selectedFolder.defaultLang?.toUpperCase()})
          </span>
        </h2>
      </div>

      <LessonCardsView
        currentLessons={currentLessons}
        selectedLangKey={selectedFolder.defaultLang}
        // 👇 Передача всех обработчиков и функций
        getProgress={getProgress}
        handleCardClick={handleCardClick}
        handleEditLesson={handleEditLesson}
        handleDeleteLesson={handleDeleteLesson}
        exportSingleLesson={exportSingleLesson}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
      />

      {/* КНОПКА ДОБАВИТЬ УРОК */}
      <button
        // Вызов функции с текущим folderId
        onClick={() => handleAddLessonToFolder(folderId)}
        className={`fixed bottom-26 right-6 sm:bottom-28 sm:right-18 
                    bg-sky-600 text-white w-14 h-14 flex items-center justify-center 
                    rounded-full text-3xl font-light shadow-2xl 
                    hover:bg-sky-700 active:scale-95 transition duration-150 z-[201]`}
        title={`Добавить урок в "${selectedFolder.name}"`}
        aria-label={`Добавить урок в "${selectedFolder.name}"`}
      >
        <HiPlus className="w-8 h-8" />
      </button>
    </div>
  );
}
