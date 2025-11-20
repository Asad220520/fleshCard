import { useEffect } from "react";
import { HiOutlineDownload, HiPencil, HiTrash } from "react-icons/hi";

export const FolderMenu = ({
  folderId,
  onExport,
  onAddNewLesson,
  onDeleteFolder,
  onRenameFolder,
  onClose,
}) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuElement = document.getElementById(`folder-menu-${folderId}`);
      const dotsButton = document.querySelector(
        `[data-folder-menu-id="${folderId}"]`
      );
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
  }, [folderId, onClose]);

  return (
    <div
      id={`folder-menu-${folderId}`}
      className="absolute top-10 right-0 z-30 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
      role="menu"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddNewLesson(folderId);
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-sky-600 dark:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-600"
        role="menuitem"
      >
        {/* <HiPlus className="w-5 h-5 mr-2" /> */}
        Добавить урок
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
        <HiOutlineDownload className="w-5 h-5 mr-2" />
        Экспорт папки (JSON)
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRenameFolder(); // Вызов без folderId, так как он передается через пропс в RenameFolderModal
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
        role="menuitem"
      >
        <HiPencil className="w-5 h-5 mr-2" />
        Переименовать
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteFolder(folderId);
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600"
        role="menuitem"
      >
        <HiTrash className="w-5 h-5 mr-2" /> Удалить папку
      </button>
    </div>
  );
};
