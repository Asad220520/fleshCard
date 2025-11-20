import { HiFolderOpen, HiLightBulb, HiOutlineUpload } from "react-icons/hi";

export const ImportOrAddModal = ({
  onClose,
  onStartImport,
  onStartCreateFolder,
}) => {
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
          <HiLightBulb className="w-6 h-6 mr-2" />
          Действие
        </h3>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Создать новую папку или импортировать урок/папку.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onStartCreateFolder}
            className="p-4 flex flex-col items-center bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 rounded-xl text-amber-700 dark:text-amber-300 font-bold transition duration-200"
          >
            <HiFolderOpen className="w-8 h-8 mb-1" />
            Создать папку
          </button>
          <button
            onClick={onStartImport}
            className="p-4 flex flex-col items-center bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-xl text-green-700 dark:text-green-300 font-bold transition duration-200"
          >
            <HiOutlineUpload className="w-8 h-8 mb-1" />
            Импорт (JSON)
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 p-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl text-gray-800 dark:text-gray-100 font-bold transition duration-200"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};
