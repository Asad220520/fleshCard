import { useSelector } from "react-redux";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { mockLessons } from "../data/mockLessons";
import { useNavigate } from "react-router-dom";
// Предполагаем, что эти функции доступны:
import { loadLessons, saveLessons } from "../data/lessons-storage";
import {
  HiOutlineBookOpen,
  HiArrowRight,
  HiCheckCircle,
  HiPlus,
  HiTrash,
  HiX,
  HiOutlineDownload,
  HiDotsVertical,
  HiOutlineGlobeAlt,
  HiOutlineChevronLeft,
  HiOutlineUpload,
  HiPencil,
  HiFolder,
  HiFolderOpen,
  HiLightBulb,
  HiFolderAdd,
} from "react-icons/hi";

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

// -----------------------------------------------------------
// ФУНКЦИИ ХРАНЕНИЯ ДАННЫХ ПАПОК
// -----------------------------------------------------------
const loadFolders = () => {
  try {
    const stored = localStorage.getItem(FOLDERS_STORAGE_KEY);
    // Добавление заглушек для примера, если папки пусты
    if (!stored)
      return {
        de_a1: { id: "de_a1", name: "Немецкий A1", defaultLang: "de" },
        en_main: {
          id: "en_main",
          name: " Английский",
          defaultLang: "en",
        },
      };
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Ошибка загрузки папок:", e);
    return {};
  }
};

const saveFolders = (folders) => {
  try {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  } catch (e) {
    console.error("Ошибка сохранения папок:", e);
  }
};

// -----------------------------------------------------------
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (Ваши реализации)
// -----------------------------------------------------------
const LessonMenu = ({ lessonId, onDelete, onExport, onEdit, onClose }) => {
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

const FolderMenu = ({
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
const CreateFolderModal = ({ onClose, onFolderCreated }) => {
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
const RenameFolderModal = ({ onClose, folder, onRename }) => {
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
const ImportOrAddModal = ({ onClose, onStartImport, onStartCreateFolder }) => {
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
const LanguageFolderView = ({
  folders,
  groupedLessons,
  getFolderProgress,
  onFolderClick,
  onExportFolder,
  onAddNewLesson,
  onDeleteFolder,
  onRenameFolder,
  openMenuId,
  setOpenMenuId,
}) => {
  const handleOpenMenu = useCallback(
    (e, folderId) => {
      e.stopPropagation();
      setOpenMenuId(
        openMenuId === `folder-${folderId}` ? null : `folder-${folderId}`
      );
    },
    [openMenuId, setOpenMenuId]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {folders.map((folder) => {
        const lessonsInFolder = groupedLessons[folder.id] || [];
        const folderProgress = getFolderProgress(folder.id, lessonsInFolder);
        const totalLessons = lessonsInFolder.length;
        const isComplete = folderProgress.isComplete;
        const menuId = `folder-${folder.id}`;

        return (
          <div key={folder.id} className="relative">
            <div className="absolute top-2 right-2 z-20">
              <button
                data-folder-menu-id={folder.id}
                onClick={(e) => handleOpenMenu(e, folder.id)}
                className="p-1 rounded-full bg-white/70 dark:bg-gray-700/70 text-gray-500 hover:text-gray-700 dark:text-gray-200 transition"
                title="Опции папки"
              >
                <HiDotsVertical className="w-6 h-6" />
              </button>

              {openMenuId === menuId && (
                <FolderMenu
                  folderId={folder.id}
                  onExport={() => onExportFolder(folder.id, lessonsInFolder)}
                  onAddNewLesson={onAddNewLesson}
                  onDeleteFolder={onDeleteFolder}
                  onRenameFolder={() => onRenameFolder(folder)} // Передаем объект папки
                  onClose={() => setOpenMenuId(null)}
                />
              )}
            </div>

            <div
              onClick={() => {
                onFolderClick(folder.id);
                setOpenMenuId(null);
              }}
              className={`
                                flex items-center justify-between
                                p-5 rounded-xl shadow-lg 
                                transition duration-300 ease-in-out
                                transform hover:scale-[1.02] hover:shadow-xl
                                border-l-4 
                                cursor-pointer
                                bg-amber-50 dark:bg-gray-800 
                                ${
                                  isComplete
                                    ? "border-green-500 hover:border-green-600"
                                    : "border-amber-500 hover:border-amber-600"
                                }
                            `}
              aria-label={`Открыть папку ${folder.name}`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`p-2 rounded-full flex-shrink-0 ${
                    isComplete
                      ? "bg-green-100 dark:bg-green-800"
                      : "bg-amber-100 dark:bg-amber-800"
                  }`}
                >
                  <HiFolder className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-50">
                    {folder.name}
                  </p>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <HiOutlineGlobeAlt className="w-4 h-4 mr-1" />
                    {folder.defaultLang.toUpperCase()} • {totalLessons} урок(а)
                  </span>
                  <div className="mt-1 flex items-center text-xs">
                    <span
                      className={`font-semibold ${
                        isComplete
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {folderProgress.learned} / {folderProgress.total} слов
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
const LessonCardsView = ({
  currentLessons,
  selectedLangKey,
  getProgress,
  handleCardClick,
  handleEditLesson,
  handleDeleteLesson,
  exportSingleLesson,
  openMenuId,
  setOpenMenuId,
}) => {
  const handleOpenMenu = useCallback(
    (e, lessonId) => {
      e.stopPropagation();
      setOpenMenuId(
        openMenuId === `lesson-${lessonId}` ? null : `lesson-${lessonId}`
      );
    },
    [openMenuId, setOpenMenuId]
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {currentLessons.map((lesson) => {
          const lessonId = lesson.id;
          const progress = getProgress(lessonId);
          const isComplete = progress.isComplete;
          const lessonLang = lesson.lang || selectedLangKey || "N/A";

          return (
            <div key={lessonId} className={`relative`}>
              <div className="absolute top-2 right-2 z-20">
                <button
                  data-menu-id={lessonId}
                  onClick={(e) => handleOpenMenu(e, lessonId)}
                  className="p-1 rounded-full bg-white/70 dark:bg-gray-700/70 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                  title="Опции урока"
                >
                  <HiDotsVertical className="w-6 h-6" />
                </button>

                {openMenuId === `lesson-${lessonId}` && (
                  <LessonMenu
                    lessonId={lessonId}
                    onDelete={() => handleDeleteLesson(lessonId)}
                    onExport={() => exportSingleLesson(lessonId, lesson)}
                    onEdit={() => handleEditLesson(lessonId)}
                    onClose={() => setOpenMenuId(null)}
                  />
                )}
              </div>

              <div
                onClick={() => handleCardClick(lessonId)}
                className={`
                                    flex items-center justify-between
                                    p-5 bg-white rounded-xl shadow-lg 
                                    transition duration-300 ease-in-out
                                    transform hover:scale-[1.02] hover:shadow-xl
                                    dark:bg-gray-800 dark:shadow-2xl dark:border-gray-700
                                    border-l-4 
                                    cursor-pointer
                                    ${
                                      isComplete
                                        ? "border-green-500 hover:border-green-600"
                                        : "border-sky-500 hover:border-sky-600"
                                    }
                                `}
                aria-label={`Начать урок ${lessonId.toUpperCase()}`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${
                      isComplete
                        ? "bg-green-100 dark:bg-green-800"
                        : "bg-sky-100 dark:bg-sky-800"
                    }`}
                  >
                    {isComplete ? (
                      <HiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <HiOutlineBookOpen className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    )}
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Язык: {lessonLang.toUpperCase()}
                    </span>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-50">
                      Урок {lessonId.toUpperCase()}
                    </p>

                    <div className="mt-1 flex items-center text-xs">
                      <span
                        className={`font-semibold ${
                          isComplete
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {progress.learned} / {progress.total}
                      </span>
                      <div className="w-20 ml-2 bg-gray-200 rounded-full h-1 dark:bg-gray-700">
                        <div
                          className={`${
                            isComplete ? "bg-green-500" : "bg-sky-500"
                          } h-1 rounded-full`}
                          style={{
                            width: `${
                              (progress.learned / progress.total) * 100 || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
// -----------------------------------------------------------
// ГЛАВНЫЙ КОМПОНЕНТ LessonsList
// -----------------------------------------------------------
export default function LessonsList() {
  const navigate = useNavigate();
  const progressState = useSelector((state) => state.words.progress);

  const [lessonsData, setLessonsData] = useState({});
  const [foldersData, setFoldersData] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showImportOrAddModal, setShowImportOrAddModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [renameTargetFolder, setRenameTargetFolder] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const importFileInputRef = useRef(null);

  // --- ЭФФЕКТ ЗАГРУЗКИ И МИГРАЦИИ ДАННЫХ ---
  useEffect(() => {
    let savedLessons = loadLessons();
    let savedFolders = loadFolders();
    if (!savedLessons || Object.keys(savedLessons).length === 0) {
      savedLessons = mockLessons;
      saveLessons(savedLessons);
    }
    let newFolders = { ...savedFolders };
    let needsLessonMigration = false;
    let needsFolderMigration = false;
    const lessonValues = Object.values(savedLessons);

    // 1. Создание папок, если их нет (инициализация)
    if (Object.keys(savedFolders).length === 0) {
      const uniqueFolderIds = [
        ...new Set(
          lessonValues.map((l) => l.folderId || l.lang || "de_default")
        ),
      ];

      uniqueFolderIds.forEach((folderId) => {
        const lessonsWithId = lessonValues.filter(
          (l) => (l.folderId || l.lang || "de_default") === folderId
        );
        const defaultLang = lessonsWithId[0]?.lang || "de";

        newFolders[folderId] = {
          id: folderId,
          name: `${defaultLang.toUpperCase()} - Папка`,
          defaultLang: defaultLang,
        };
        needsFolderMigration = true;
      });
    }

    // 2. Привязка уроков к папкам (миграция, если folderId отсутствует)
    Object.keys(savedLessons).forEach((lessonId) => {
      const lesson = savedLessons[lessonId];
      if (!lesson.folderId) {
        const lang = lesson.lang || "de";
        // Поиск существующей папки для этого языка
        const existingFolder = Object.values(newFolders).find(
          (f) => f.defaultLang === lang
        );

        if (existingFolder) {
          lesson.folderId = existingFolder.id;
        } else {
          // Если папки нет, создаем временную
          const tempFolderId = lang;
          newFolders[tempFolderId] = {
            id: tempFolderId,
            name: `${lang.toUpperCase()} - Temp`,
            defaultLang: lang,
          };
          lesson.folderId = tempFolderId;
          needsFolderMigration = true;
        }
        needsLessonMigration = true;
      }
    });

    if (needsLessonMigration) saveLessons(savedLessons);
    if (needsFolderMigration) saveFolders(newFolders);

    setLessonsData(savedLessons);
    setFoldersData(newFolders);
  }, []);

  // --- Логика Данных и Прогресса ---
  const foldersArray = useMemo(
    () =>
      Object.values(foldersData).sort((a, b) => a.name.localeCompare(b.name)),
    [foldersData]
  );

  const groupedLessons = useMemo(() => {
    const groups = {};
    Object.keys(lessonsData).forEach((id) => {
      const lesson = lessonsData[id];
      const folderId = lesson.folderId || "unassigned";

      if (!groups[folderId]) {
        groups[folderId] = [];
      }
      groups[folderId].push({ id: id, ...lesson });
    });
    return groups;
  }, [lessonsData]);

  const allUniqueLearned = useMemo(() => {
    if (
      !progressState ||
      !Object.keys(progressState).some((key) =>
        Array.isArray(progressState[key])
      )
    )
      return [];

    const {
      learnedFlashcards,
      learnedMatching,
      learnedQuiz,
      learnedWriting,
      learnedSentencePuzzle,
    } = progressState;
    const allWords = [
      ...learnedFlashcards,
      ...learnedMatching,
      ...learnedQuiz,
      ...learnedWriting,
      ...(learnedSentencePuzzle || []),
    ];
    const uniqueWordsMap = new Map();
    allWords.forEach((word) => {
      const key = `${word.de}-${word.ru}-${word.lessonId}`;
      if (!uniqueWordsMap.has(key)) uniqueWordsMap.set(key, word);
    });
    return Array.from(uniqueWordsMap.values());
  }, [progressState]);

  const getProgress = useCallback(
    (lessonId) => {
      const lesson = lessonsData[lessonId];
      const allWords = lesson && lesson.cards ? lesson.cards.length : 0;
      const learnedCount = allUniqueLearned.filter(
        (w) => w.lessonId === lessonId
      ).length;
      return {
        learned: learnedCount,
        total: allWords,
        isComplete: allWords > 0 && learnedCount === allWords,
      };
    },
    [lessonsData, allUniqueLearned]
  );

  const getFolderProgress = useCallback(
    (folderId, lessonsInFolder) => {
      let totalWords = 0;
      let totalLearned = 0;

      lessonsInFolder.forEach((lesson) => {
        const progress = getProgress(lesson.id);
        totalWords += progress.total;
        totalLearned += progress.learned;
      });

      const isComplete = totalWords > 0 && totalLearned === totalWords;

      return {
        learned: totalLearned,
        total: totalWords,
        isComplete: isComplete,
      };
    },
    [getProgress]
  );

  // --- ОБРАБОТЧИКИ ДЕЙСТВИЙ С ПАПКАМИ ---
  const handleCreateFolder = useCallback(
    ({ name, defaultLang }) => {
      const newFolderId = `f_${Date.now()}`;
      const newFolder = {
        id: newFolderId,
        name: name,
        defaultLang: defaultLang,
      };

      const updatedFolders = { ...foldersData, [newFolderId]: newFolder };
      setFoldersData(updatedFolders);
      saveFolders(updatedFolders);
      setShowCreateFolderModal(false);
      alert(`Папка "${name}" успешно создана!`);
    },
    [foldersData]
  );

  const startRenameFolder = useCallback((folder) => {
    setRenameTargetFolder(folder);
    setShowRenameFolderModal(true);
  }, []);

  const handleRenameFolder = useCallback(
    (folderId, newName) => {
      const folder = foldersData[folderId];
      if (!folder) return;

      const updatedFolders = {
        ...foldersData,
        [folderId]: { ...folder, name: newName },
      };

      setFoldersData(updatedFolders);
      saveFolders(updatedFolders);
      setRenameTargetFolder(null);
      setShowRenameFolderModal(false);
    },
    [foldersData]
  );

  const handleDeleteFolder = useCallback(
    (folderId) => {
      const folderName = foldersData[folderId]?.name;
      const lessonsInFolder = groupedLessons[folderId] || [];
      const confirmDelete = window.confirm(
        `Вы уверены, что хотите удалить папку "${folderName}" и ВСЕ ${lessonsInFolder.length} урок(а) в ней? Это действие необратимо.`
      );
      if (!confirmDelete) return;

      const updatedLessons = { ...lessonsData };
      lessonsInFolder.forEach((lesson) => delete updatedLessons[lesson.id]);

      const updatedFolders = { ...foldersData };
      delete updatedFolders[folderId];

      setLessonsData(updatedLessons);
      setFoldersData(updatedFolders);
      saveLessons(updatedLessons);
      saveFolders(updatedFolders);
      setSelectedFolderId(null);

      alert(`Папка "${folderName}" и её содержимое удалены.`);
    },
    [lessonsData, foldersData, groupedLessons]
  );

  // 🟢 КРИТИЧЕСКИЙ ОБРАБОТЧИК: Передача folderId
  const handleAddLessonToFolder = useCallback(
    (folderId) => {
      const folder = foldersData[folderId];
      if (!folder) return;

      // Передача УНИКАЛЬНОГО folderId и языка в AddLessonPage
      navigate("/add-lesson", {
        state: { folderId: folderId, ttsLang: folder.defaultLang },
      });
    },
    [foldersData, navigate]
  );

  const handleFolderClick = useCallback((folderId) => {
    setSelectedFolderId(folderId);
    setOpenMenuId(null);
  }, []);

  // --- ОБРАБОТЧИКИ ЭКСПОРТА/ИМПОРТА ---

  // 🔴 ЗАВЕРШЕННАЯ ФУНКЦИЯ handleImport
  const handleImport = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setShowImportOrAddModal(false);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          let newLessons = {};
          let message = "";
          let successfulImport = false;
          let folderToUse = null;

          const findOrCreateFolder = (lang, nameSuffix) => {
            let folder = Object.values(foldersData).find(
              (f) => f.defaultLang === lang
            );
            if (!folder) {
              const newFolderId = `f_${Date.now()}`;
              folder = {
                id: newFolderId,
                name: `${lang.toUpperCase()} - ${nameSuffix}`,
                defaultLang: lang,
              };

              // Обновляем состояние foldersData
              setFoldersData((prev) => {
                const updated = { ...prev, [newFolderId]: folder };
                saveFolders(updated);
                return updated;
              });
            }
            return folder;
          };

          if (importedData.folderLang && importedData.lessons) {
            // Импорт папки (Множество уроков)
            const lang = importedData.folderLang;
            folderToUse = findOrCreateFolder(lang, "Импорт");

            importedData.lessons.forEach((lesson) => {
              let lessonId = lesson.lessonId;
              let count = 1;
              // Генерация уникального ID
              while (lessonsData[lessonId]) {
                lessonId = `${lesson.lessonId}_imp${count}`;
                count++;
              }
              newLessons[lessonId] = {
                lang: lesson.lang || lang,
                folderId: folderToUse.id,
                cards: lesson.cards || [],
              };
            });
            message = `Папка "${folderToUse.name}" успешно импортирована! Добавлено ${importedData.lessons.length} урок(а).`;
            successfulImport = true;
          } else if (importedData.lessonId && importedData.cards) {
            // Импорт одного урока
            const lang = importedData.lang || "de"; // Использование 'de' по умолчанию
            folderToUse = findOrCreateFolder(lang, "Импорт");

            let lessonId = importedData.lessonId;
            let count = 1;
            // Генерация уникального ID
            while (lessonsData[lessonId]) {
              lessonId = `${importedData.lessonId}_imp${count}`;
              count++;
            }
            newLessons[lessonId] = {
              lang: lang,
              folderId: folderToUse.id,
              cards: importedData.cards,
            };
            message = `Урок "${lessonId.toUpperCase()}" (${lang.toUpperCase()}) успешно импортирован в папку "${
              folderToUse.name
            }"!`;
            successfulImport = true;
          } else {
            throw new Error(
              "Неверный формат JSON-файла. Файл должен содержать 'lessonId' и 'cards' или 'folderLang' и 'lessons'."
            );
          }

          // 🔴 ОБНОВЛЕНИЕ СОСТОЯНИЙ ПОСЛЕ УСПЕШНОГО ИМПОРТА
          if (successfulImport) {
            const updatedLessons = { ...lessonsData, ...newLessons };
            setLessonsData(updatedLessons);
            saveLessons(updatedLessons);
            alert(message);
            // Переход в папку, куда произошел импорт
            setSelectedFolderId(folderToUse.id);
          } else {
            alert("Файл не содержит данных для импорта.");
          }
        } catch (error) {
          alert(`Ошибка импорта: ${error.message}`);
          console.error("Ошибка при чтении или парсинге файла:", error);
        }
      };

      reader.readAsText(file);
      e.target.value = null;
    },
    [lessonsData, foldersData]
  );
  // -----------------------------------------------------------

  const exportFolder = useCallback(
    (folderId, lessonsInFolder) => {
      alert(
        `Экспорт папки "${foldersData[folderId].name}"... (Не реализовано в этом примере)`
      );
      console.log("Уроки для экспорта:", lessonsInFolder);
    },
    [foldersData]
  );
  const exportSingleLesson = useCallback((lessonId, lesson) => {
    alert(
      `Экспорт урока "${lessonId.toUpperCase()}"... (Не реализовано в этом примере)`
    );
    console.log("Урок для экспорта:", lesson);
  }, []);

  const handleDeleteLesson = useCallback(
    (lessonId) => {
      if (
        !window.confirm(
          `Вы уверены, что хотите удалить урок ${lessonId.toUpperCase()}?`
        )
      )
        return;
      const updatedLessons = { ...lessonsData };
      delete updatedLessons[lessonId];
      setLessonsData(updatedLessons);
      saveLessons(updatedLessons);
      alert(`Урок ${lessonId.toUpperCase()} удален.`);
    },
    [lessonsData]
  );
  const handleEditLesson = useCallback(
    (lessonId) => {
      navigate(`/edit-lesson/${lessonId}`);
    },
    [navigate]
  );
  const handleCardClick = useCallback(
    (lessonId) => {
      navigate(`/lesson/${lessonId}`);
    },
    [navigate]
  );

  // --- РЕНДЕРИНГ ---
  const currentLessons = groupedLessons[selectedFolderId] || [];
  const selectedFolder = foldersData[selectedFolderId];

  return (
    <div className="p-4 sm:p-6 pb-24 sm:pb-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      {!selectedFolderId ? (
        <>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50 mb-6 max-w-4xl mx-auto flex items-center">
            <HiFolderOpen className="w-7 h-7 mr-2 text-sky-600" />
            Ваши языковые папки
          </h2>

          <LanguageFolderView
            folders={foldersArray}
            groupedLessons={groupedLessons}
            getFolderProgress={getFolderProgress}
            onFolderClick={handleFolderClick}
            onExportFolder={exportFolder}
            onAddNewLesson={handleAddLessonToFolder}
            onDeleteFolder={handleDeleteFolder}
            onRenameFolder={startRenameFolder}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
        </>
      ) : (
        <>
          <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50 flex items-center">
              <button
                onClick={() => setSelectedFolderId(null)}
                className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title="Вернуться к списку папок"
              >
                <HiOutlineChevronLeft className="w-6 h-6" />
              </button>
              <HiFolderOpen className="w-6 h-6 mr-2 text-amber-500" />
              {selectedFolder?.name}
              <span className="text-base text-gray-500 dark:text-gray-400 ml-3">
                ({selectedFolder?.defaultLang.toUpperCase()})
              </span>
            </h2>
          </div>

          <LessonCardsView
            currentLessons={currentLessons}
            selectedLangKey={selectedFolder?.defaultLang}
            getProgress={getProgress}
            handleCardClick={handleCardClick}
            handleEditLesson={handleEditLesson}
            handleDeleteLesson={handleDeleteLesson}
            exportSingleLesson={exportSingleLesson}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
        </>
      )}
      <input
        type="file"
        ref={importFileInputRef}
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={() => {
          if (selectedFolderId) {
            // Если выбрана папка, сразу добавляем урок в нее
            handleAddLessonToFolder(selectedFolderId);
          } else {
            // Если папка не выбрана, показываем модалку Импорт/Создать папку
            setShowImportOrAddModal(true);
          }
        }}
        className={`fixed bottom-26 right-6 sm:bottom-28 sm:right-18 
                    bg-sky-600 text-white w-14 h-14 flex items-center justify-center 
                    rounded-full text-3xl font-light shadow-2xl 
                    hover:bg-sky-700 active:scale-95 transition duration-150 z-[201]`}
        title={
          selectedFolderId
            ? `Добавить урок в "${selectedFolder?.name}"`
            : "Добавить/Импортировать"
        }
        aria-label={
          selectedFolderId
            ? `Добавить урок в "${selectedFolder?.name}"`
            : "Добавить/Импортировать"
        }
      >
        {selectedFolderId ? (
          <HiPlus className="w-8 h-8" />
        ) : (
          <HiFolderAdd className="w-7 h-7" />
        )}
      </button>
      {showImportOrAddModal && (
        <ImportOrAddModal
          onClose={() => setShowImportOrAddModal(false)}
          onStartCreateFolder={() => {
            setShowImportOrAddModal(false);
            setShowCreateFolderModal(true);
          }}
          onStartImport={() => {
            importFileInputRef.current.click();
            setShowImportOrAddModal(false);
          }}
        />
      )}

      {showCreateFolderModal && (
        <CreateFolderModal
          onClose={() => setShowCreateFolderModal(false)}
          onFolderCreated={handleCreateFolder}
        />
      )}

      {showRenameFolderModal && renameTargetFolder && (
        <RenameFolderModal
          onClose={() => setShowRenameFolderModal(false)}
          folder={renameTargetFolder}
          onRename={handleRenameFolder}
        />
      )}
    </div>
  );
}
