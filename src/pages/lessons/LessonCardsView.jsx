import {
  HiCheckCircle,
  HiDotsVertical,
  HiOutlineBookOpen,
} from "react-icons/hi";
import { LessonMenu } from "./LessonMenu";
import { useCallback } from "react";

export const LessonCardsView = ({
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
                    <p className="text-l font-semibold text-gray-800 dark:text-gray-50">
                      {lessonId}
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
