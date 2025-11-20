import { useState } from "react";
import { HiPencil } from "react-icons/hi";

export const RenameFolderModal = ({ onClose, folder, onRename }) => {
  const [newName, setNewName] = useState(folder.name);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!newName.trim()) {
      setError("Введите название папки.");
      return;
    }
    if (newName.trim() === folder.name) {
      onClose();
      return;
    }
    setError("");
    onRename(folder.id, newName.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[400] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-4 flex items-center">
          <HiPencil className="w-6 h-6 mr-2" />
          Переименовать папку
        </h3>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Текущий язык: **{folder.defaultLang.toUpperCase()}**
        </p>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Новое название:
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 rounded-md shadow-sm"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        <div className="flex justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 rounded-xl"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="flex-1 p-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
