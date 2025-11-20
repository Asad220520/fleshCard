import { useCallback } from "react";
import { HiDotsVertical, HiFolder, HiOutlineGlobeAlt } from "react-icons/hi";
import { FolderMenu } from "./FolderMenu";

export const LanguageFolderView = ({
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
