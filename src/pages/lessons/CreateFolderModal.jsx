import { useState } from "react";
import { HiFolderOpen } from "react-icons/hi";
// 💡 Глобальные константы (Без изменений)
const SUPPORTED_TTS_LANGS = [
  "без TTS",
  "de",
  "en",
  "ko",
  "ar",
  "es",
  "fr",
  "it",
  "ja",
  "ru",
  "zh",
];
const FOLDERS_STORAGE_KEY = "wordmasterFolders";
export const CreateFolderModal = ({ onClose, onFolderCreated }) => {
  const defaultLang =
    SUPPORTED_TTS_LANGS.find((l) => l === "de") || SUPPORTED_TTS_LANGS[1];
  const [folderName, setFolderName] = useState("");
  const [selectedLang, setSelectedLang] = useState(defaultLang);
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!folderName.trim()) {
      setError("Введите название папки.");
      return;
    }
    setError("");
    onFolderCreated({ name: folderName.trim(), defaultLang: selectedLang });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-4 flex items-center">
          <HiFolderOpen className="w-6 h-6 mr-2" />
          Создание новой папки
        </h3>

        <div className="mb-4">
          <label
            htmlFor="folder-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Название папки:
          </label>
          <input
            id="folder-name"
            name="folderName"
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Например, Немецкий A1"
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div className="mb-6">
          <label
            htmlFor="new-lesson-lang"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Язык по умолчанию (для новых уроков):
          </label>
          <select
            id="new-lesson-lang"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            {SUPPORTED_TTS_LANGS.slice(1).map(
              (
                lang // Убираем "без TTS"
              ) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              )
            )}
          </select>
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-gray-800 dark:text-gray-100 font-bold transition duration-200"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 p-3 bg-sky-600 hover:bg-sky-700 rounded-xl text-white font-bold transition duration-200 shadow-lg"
          >
            Создать папку
          </button>
        </div>
      </div>
    </div>
  );
};
