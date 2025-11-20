import { useEffect } from "react";
import { HiOutlineDownload, HiPencil, HiTrash } from "react-icons/hi";

export const LessonMenu = ({
  lessonId,
  onDelete,
  onExport,
  onEdit,
  onClose,
}) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuElement = document.getElementById(`menu-${lessonId}`);
      const dotsButton = document.querySelector(`[data-menu-id="${lessonId}"]`);
      if (
        menuElement &&
        !menuElement.contains(event.target) &&
        (!dotsButton || !dotsButton.contains(event.target))
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [lessonId, onClose]);
  return (
    <div
      id={`menu-${lessonId}`}
      className="absolute top-10 right-0 z-30 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
      role="menu"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-sky-600 dark:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-600"
        role="menuitem"
      >
        <HiPencil className="w-5 h-5 mr-2" /> Изменить
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExport();
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-sky-600 dark:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-600"
        role="menuitem"
      >
        <HiOutlineDownload className="w-5 h-5 mr-2" /> Экспорт (JSON)
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600"
        role="menuitem"
      >
        <HiTrash className="w-5 h-5 mr-2" /> Удалить урок
      </button>
    </div>
  );
};
