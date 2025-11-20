import { useSelector } from "react-redux";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { mockLessons } from "../../data/mockLessons";
import { useNavigate, useParams } from "react-router-dom"; // 🟢 КЛЮЧ: Для чтения folderId из URL
// Предполагаем, что эти функции доступны:
import { loadLessons, saveLessons } from "../../data/lessons-storage";
import {
  HiPlus,
  HiOutlineChevronLeft,
  HiFolderOpen,
  HiFolderAdd,
} from "react-icons/hi";
// Вспомогательные компоненты (предполагаем, что они существуют)
import { LanguageFolderView } from "./LanguageFolderView";
import { ImportOrAddModal } from "./ImportOrAddModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { RenameFolderModal } from "./RenameFolderModal";
import { LessonCardsView } from "./LessonCardsView";
import { loadFolders } from "./loadFolders";

// 💡 Глобальные константы
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


const saveFolders = (folders) => {
  try {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  } catch (e) {
    console.error("Ошибка сохранения папок:", e);
  }
};

// -----------------------------------------------------------
// ОСНОВНОЙ КОМПОНЕНТ
// -----------------------------------------------------------
export default function LessonsList() {
  const navigate = useNavigate();
  // 🟢 ЧИТАЕМ folderId ПРЯМО ИЗ URL (будет undefined на маршруте '/')
  const { folderId } = useParams();

  const progressState = useSelector((state) => state.words.progress);

  const [lessonsData, setLessonsData] = useState({});
  const [foldersData, setFoldersData] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showImportOrAddModal, setShowImportOrAddModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [renameTargetFolder, setRenameTargetFolder] = useState(null);
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
        const existingFolder = Object.values(newFolders).find(
          (f) => f.defaultLang === lang
        );

        if (existingFolder) {
          lesson.folderId = existingFolder.id;
        } else {
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
    (id, lessonsInFolder) => {
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

  // --- ОБРАБОТЧИКИ ДЕЙСТВИЙ С ПАПКАМИ И УРОКАМИ ---

  // 🟢 КЛЮЧ: Переход на новый маршрут /lessons/:folderId
  const handleFolderClick = useCallback(
    (id) => {
      navigate(`/lessons/${id}`);
      setOpenMenuId(null);
    },
    [navigate]
  );

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
    (id, newName) => {
      const folder = foldersData[id];
      if (!folder) return;

      const updatedFolders = {
        ...foldersData,
        [id]: { ...folder, name: newName },
      };

      setFoldersData(updatedFolders);
      saveFolders(updatedFolders);
      setRenameTargetFolder(null);
      setShowRenameFolderModal(false);
    },
    [foldersData]
  );

  const handleDeleteFolder = useCallback(
    (folderIdToDelete) => {
      const folderName = foldersData[folderIdToDelete]?.name;
      const lessonsInFolder = groupedLessons[folderIdToDelete] || [];
      const confirmDelete = window.confirm(
        `Вы уверены, что хотите удалить папку "${folderName}" и ВСЕ ${lessonsInFolder.length} урок(а) в ней? Это действие необратимо.`
      );
      if (!confirmDelete) return;

      const updatedLessons = { ...lessonsData };
      lessonsInFolder.forEach((lesson) => delete updatedLessons[lesson.id]);

      const updatedFolders = { ...foldersData };
      delete updatedFolders[folderIdToDelete];

      setLessonsData(updatedLessons);
      setFoldersData(updatedFolders);
      saveLessons(updatedLessons);
      saveFolders(updatedFolders);

      // 🟢 Если удалили текущую открытую папку, переходим на /
      if (folderIdToDelete === folderId) {
        navigate("/");
      }

      alert(`Папка "${folderName}" и её содержимое удалены.`);
    },
    [lessonsData, foldersData, groupedLessons, folderId, navigate]
  );

  const handleAddLessonToFolder = useCallback(
    (id) => {
      const folder = foldersData[id];
      if (!folder) return;

      // Передача folderId и языка в AddLessonPage
      navigate("/add-lesson", {
        state: { folderId: id, ttsLang: folder.defaultLang },
      });
    },
    [foldersData, navigate]
  );

  // --- ОБРАБОТЧИКИ ЭКСПОРТА/ИМПОРТА ---
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

              setFoldersData((prev) => {
                const updated = { ...prev, [newFolderId]: folder };
                saveFolders(updated);
                return updated;
              });
            }
            return folder;
          };

          if (importedData.folderLang && importedData.lessons) {
            // Импорт папки
            const lang = importedData.folderLang;
            folderToUse = findOrCreateFolder(lang, "Импорт");
            importedData.lessons.forEach((lesson) => {
              let lessonId = lesson.lessonId;
              let count = 1;
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
            const lang = importedData.lang || "de";
            folderToUse = findOrCreateFolder(lang, "Импорт");

            let lessonId = importedData.lessonId;
            let count = 1;
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
            throw new Error("Неверный формат JSON-файла.");
          }

          if (successfulImport) {
            const updatedLessons = { ...lessonsData, ...newLessons };
            setLessonsData(updatedLessons);
            saveLessons(updatedLessons);
            alert(message);
            // Переход в папку, куда произошел импорт
            navigate(`/lessons/${folderToUse.id}`);
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
    [lessonsData, foldersData, navigate]
  );

  const downloadJsonFile = (data, filename) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const exportFolder = useCallback(
    (id, lessonsInFolder) => {
      const folder = foldersData[id];
      if (!folder) return;

      const lessonsExportArray = lessonsInFolder.map((lesson) => ({
        lessonId: lesson.id,
        lang: lesson.lang,
        cards: lesson.cards,
      }));

      const exportData = {
        isFolderExport: true,
        folderId: id,
        folderName: folder.name,
        folderLang: folder.defaultLang,
        lessons: lessonsExportArray,
      };

      const filename = `${folder.name.replace(/\s/g, "_")}_folder_export.json`;
      downloadJsonFile(exportData, filename);

      alert(
        `Папка "${folder.name}" (${lessonsInFolder.length} уроков) экспортирована.`
      );
    },
    [foldersData]
  );

  const exportSingleLesson = useCallback((lessonId, lesson) => {
    const exportData = {
      lessonId: lessonId,
      lang: lesson.lang,
      cards: lesson.cards,
    };

    const filename = `${lessonId}_lesson_export.json`;
    downloadJsonFile(exportData, filename);

    alert(`Урок "${lessonId.toUpperCase()}" экспортирован.`);
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
  // 🟢 Определяем, находимся ли мы в представлении папок (folderId === undefined)
  const isFolderView = !folderId;
  const currentLessons = groupedLessons[folderId] || [];
  const selectedFolder = foldersData[folderId];

  return (
    <div className="p-4 sm:p-6 pb-24 sm:pb-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      {isFolderView ? (
        // 1. РЕНДЕРИНГ СПИСКА ПАПОК (МАРШРУТ: /)
        <>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50 mb-6 max-w-4xl mx-auto flex items-center">
            <HiFolderOpen className="w-7 h-7 mr-2 text-sky-600" />
            Ваши языковые папки
          </h2>

          <LanguageFolderView
            folders={foldersArray}
            groupedLessons={groupedLessons}
            getFolderProgress={getFolderProgress}
            onFolderClick={handleFolderClick} // 🟢 Переход на /lessons/:folderId
            onExportFolder={exportFolder}
            onAddNewLesson={handleAddLessonToFolder}
            onDeleteFolder={handleDeleteFolder}
            onRenameFolder={startRenameFolder}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
        </>
      ) : (
        // 2. РЕНДЕРИНГ УРОКОВ В ПАПКЕ (МАРШРУТ: /lessons/:folderId)
        <>
          <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50 flex items-center">
              <button
                onClick={() => navigate("/")} // 🟢 Кнопка "назад" ведет на /
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

      {/* Input для импорта (скрыт) */}
      <input
        type="file"
        ref={importFileInputRef}
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* ПЛАВАЮЩАЯ КНОПКА ДОБАВЛЕНИЯ */}
      <button
        onClick={() => {
          if (folderId) {
            // 🟢 Если folderId есть в URL
            handleAddLessonToFolder(folderId);
          } else {
            // 🟢 Если folderId нет (на главной странице)
            setShowImportOrAddModal(true);
          }
        }}
        className={`fixed bottom-26 right-6 sm:bottom-28 sm:right-18 
                    bg-sky-600 text-white w-14 h-14 flex items-center justify-center 
                    rounded-full text-3xl font-light shadow-2xl 
                    hover:bg-sky-700 active:scale-95 transition duration-150 z-[201]`}
        title={
          folderId
            ? `Добавить урок в "${selectedFolder?.name}"`
            : "Добавить/Импортировать"
        }
        aria-label={
          folderId
            ? `Добавить урок в "${selectedFolder?.name}"`
            : "Добавить/Импортировать"
        }
      >
        {folderId ? (
          <HiPlus className="w-8 h-8" />
        ) : (
          <HiFolderAdd className="w-7 h-7" />
        )}
      </button>

      {/* МОДАЛЬНЫЕ ОКНА */}
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
