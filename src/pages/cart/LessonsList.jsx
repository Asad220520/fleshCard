// import { useSelector } from "react-redux";
// import { useState, useEffect, useRef } from "react";
// // Путь к mockLessons и filterLessonsByLanguage должен быть корректным
// import { mockLessons } from "../../data/mockLessons";
// import { filterLessonsByLanguage } from "../../utils/filterLessonsByLanguage";

// import { Link, useParams } from "react-router-dom";
// // Убедитесь, что путь к lessons-storage верен
// import { loadLessons, saveLessons } from "../../data/lessons-storage";
// import {
//   HiOutlineBookOpen,
//   HiCheckCircle,
//   HiPlus,
//   HiTrash,
//   HiDotsVertical,
//   HiOutlineDownload,
// } from "react-icons/hi";

// // -----------------------------------------------------------
// // КОМПОНЕНТ КОНТЕКСТНОГО МЕНЮ (LessonMenu)
// // -----------------------------------------------------------
// const LessonMenu = ({ lessonId, onDelete, onExport, onClose }) => {
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const menuElement = document.getElementById(`menu-${lessonId}`);
//       if (menuElement && !menuElement.contains(event.target)) {
//         onClose();
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [lessonId, onClose]);

//   return (
//     <div
//       id={`menu-${lessonId}`}
//       className="absolute top-10 right-0 z-30 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
//       role="menu"
//     >
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           onExport();
//           onClose();
//         }}
//         className="flex items-center w-full px-4 py-2 text-sm text-sky-600 dark:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-600"
//         role="menuitem"
//       >
//         <HiOutlineDownload className="w-5 h-5 mr-2" />
//         Экспорт (JSON)
//       </button>
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           onDelete();
//           onClose();
//         }}
//         className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600"
//         role="menuitem"
//       >
//         <HiTrash className="w-5 h-5 mr-2" />
//         Удалить урок
//       </button>
//     </div>
//   );
// };

// // -----------------------------------------------------------
// // ФУНКЦИЯ: Получение уникальных выученных слов (getUniqueLearnedWords)
// // -----------------------------------------------------------
// const getUniqueLearnedWords = (progressState) => {
//   const {
//     learnedFlashcards,
//     learnedMatching,
//     learnedQuiz,
//     learnedWriting,
//     learnedSentencePuzzle,
//   } = progressState;

//   const allWords = [
//     ...learnedFlashcards,
//     ...learnedMatching,
//     ...learnedQuiz,
//     ...learnedWriting,
//     ...learnedSentencePuzzle,
//   ];

//   const uniqueWordsMap = new Map();
//   allWords.forEach((word) => {
//     const key = `${word.de}-${word.lessonId}`;
//     if (!uniqueWordsMap.has(key)) uniqueWordsMap.set(key, word);
//   });
//   return Array.from(uniqueWordsMap.values());
// };

// // -----------------------------------------------------------
// // ГЛАВНЫЙ КОМПОНЕНТ LessonsList
// // -----------------------------------------------------------
// export default function LessonsList() {
//   const { languageId } = useParams();

//   // Допустим, Redux state.words.progress выглядит как:
//   // { learnedFlashcards: [{ de: "der Gast", lessonId: "moko" }], ... }
//   const progressState = useSelector((state) => state.words.progress);

//   const [lessonsData, setLessonsData] = useState({});
//   const [openMenuId, setOpenMenuId] = useState(null);

//   useEffect(() => {
//     let saved = loadLessons();
//     if (!saved || Object.keys(saved).length === 0) {
//       saveLessons(mockLessons);
//       saved = mockLessons;
//     }
//     setLessonsData(saved);
//   }, []);

//   const allUniqueLearned = getUniqueLearnedWords(progressState);

//   const getProgress = (lessonId) => {
//     // 💥 ИСПРАВЛЕНО: Теперь ищем массив карточек внутри .cards
//     const lesson = lessonsData[lessonId];
//     const lessonCards = lesson ? lesson.cards : []; // Извлекаем массив из свойства 'cards'

//     const allWords = lessonCards.length;
//     const learnedCount = allUniqueLearned.filter(
//       (w) => w.lessonId === lessonId
//     ).length;

//     return {
//       learned: learnedCount,
//       total: allWords,
//       isComplete: allWords > 0 && learnedCount === allWords,
//     };
//   };

//   const handleDeleteLesson = (lessonId) => {
//     // Используем название урока для подтверждения
//     const lessonName = lessonId.toUpperCase();
//     const confirmDelete = window.confirm(
//       `Вы уверены, что хотите удалить урок "${lessonName}"?`
//     );
//     if (!confirmDelete) return;

//     const updatedLessons = { ...lessonsData };
//     delete updatedLessons[lessonId];
//     setLessonsData(updatedLessons);
//     saveLessons(updatedLessons);
//   };

//   const exportSingleLesson = (lessonId, cards) => {
//     const exportData = {
//       lessonId: lessonId,
//       cards: cards,
//       meta: {
//         app: "WordMaster Lesson Export",
//         timestamp: new Date().toISOString(),
//       },
//     };

//     const jsonString = JSON.stringify(exportData, null, 2);
//     const blob = new Blob([jsonString], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");

//     link.href = url;
//     link.download = `${lessonId}_backup.json`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);

//     alert(`Урок "${lessonId}" успешно экспортирован! Файл скачан.`);
//   };

//   // ------------------------------------------------------------------
//   // 💥 КЛЮЧЕВАЯ ЛОГИКА: ФИЛЬТРАЦИЯ ПО languageId 💥
//   // ------------------------------------------------------------------
//   const allLessonIds = Object.keys(lessonsData);
//   // Предполагаем, что filterLessonsByLanguage корректно использует lessonsData
//   const lessonIds = filterLessonsByLanguage(allLessonIds, languageId);

//   // Если уроков не найдено
//   if (lessonIds.length === 0) {
//     return (
//       <div className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 text-center">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//           📚 Уроки: {languageId ? languageId.toUpperCase() : "Все"}
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400">
//           Уроки для этого языка пока не добавлены или не найдены.
//         </p>
//         <Link
//           to={`/lessons-list`}
//           className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
//         >
//           <HiPlus className="w-5 h-5 mr-2" /> Добавить новый урок
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//       {/* Кнопка добавления урока */}
//       <Link
//         to={`/lessons-list/new`} // Лучше указать конкретный путь для добавления
//         className={`fixed bottom-25 right-6 sm:bottom-26 sm:right-8 
//              bg-sky-600 text-white w-14 h-14 flex items-center justify-center 
//              rounded-full text-3xl font-light shadow-2xl 
//              hover:bg-sky-700 active:scale-95 transition duration-150 add-lesson-button z-[102]`}
//         title="Добавить новый урок"
//         aria-label="Добавить новый урок"
//       >
//         <HiPlus className="w-8 h-8" />
//       </Link>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
//         {lessonIds.map((lessonId, index) => {
//           const progress = getProgress(lessonId);
//           const isComplete = progress.isComplete;

//           const lessonUrl = languageId
//             ? `/lessons-list/${languageId}/${lessonId}`
//             : `/lessons-list/all/${lessonId}`; // Уточните свой роутинг

//           return (
//             <div key={lessonId} className="relative">
//               {/* Кнопка меню (Три точки) */}
//               <div className="absolute top-2 right-2 z-20">
//                 <button
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     setOpenMenuId(openMenuId === lessonId ? null : lessonId);
//                   }}
//                   className="p-1 rounded-full bg-white/70 dark:bg-gray-700/70 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
//                   title="Опции урока"
//                 >
//                   <HiDotsVertical className="w-6 h-6" />
//                 </button>

//                 {openMenuId === lessonId && (
//                   <LessonMenu
//                     lessonId={lessonId}
//                     onDelete={() => handleDeleteLesson(lessonId)}
//                     onExport={() =>
//                       // 💥 ИСПРАВЛЕНО: Передаем только cards
//                       exportSingleLesson(lessonId, lessonsData[lessonId].cards)
//                     }
//                     onClose={() => setOpenMenuId(null)}
//                   />
//                 )}
//               </div>

//               {/* Карточка урока */}
//               <Link
//                 to={lessonUrl}
//                 className={`flex items-center justify-between p-5 bg-white rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl dark:bg-gray-800 dark:shadow-2xl dark:border-gray-700 border-l-4 ${
//                   isComplete
//                     ? "border-green-500 hover:border-green-600"
//                     : "border-sky-500 hover:border-sky-600"
//                 }`}
//               >
//                 <div className="flex items-center space-x-4">
//                   <div
//                     className={`p-2 rounded-full ${
//                       isComplete
//                         ? "bg-green-100 dark:bg-green-800"
//                         : "bg-sky-100 dark:bg-sky-800"
//                     }`}
//                   >
//                     {isComplete ? (
//                       <HiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
//                     ) : (
//                       <HiOutlineBookOpen className="w-6 h-6 text-sky-600 dark:text-sky-400" />
//                     )}
//                   </div>

//                   <div>
//                     <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
//                       карточка {index + 1}
//                     </span>
//                     <p className="text-lg font-semibold text-gray-800 dark:text-gray-50">
//                       {lessonId.toUpperCase()}
//                     </p>

//                     <div className="mt-1 flex items-center text-xs">
//                       <span
//                         className={`font-semibold ${
//                           isComplete
//                             ? "text-green-600 dark:text-green-400"
//                             : "text-gray-600 dark:text-gray-300"
//                         }`}
//                       >
//                         {progress.learned} / {progress.total}
//                       </span>
//                       <div className="w-20 ml-2 bg-gray-200 rounded-full h-1 dark:bg-gray-700">
//                         <div
//                           className={`${
//                             isComplete ? "bg-green-500" : "bg-sky-500"
//                           } h-1 rounded-full`}
//                           style={{
//                             width: `${
//                               (progress.learned / progress.total) * 100 || 0
//                             }%`,
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
