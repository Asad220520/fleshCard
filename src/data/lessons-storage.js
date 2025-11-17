// // Загружаем уроки из LocalStorage
// export function loadLessons() {
//   const data = localStorage.getItem("userLessons");
//   return data ? JSON.parse(data) : {};
// }

// // Сохраняем уроки
// export function saveLessons(lessons) {
//   localStorage.setItem("userLessons", JSON.stringify(lessons));
// }






// /data/lessons-storage.js (или как у вас путь)

/**
 * Загружает уроки из LocalStorage.
 * @returns {Object} Объект с уроками или пустой объект.
 */
export function loadLessons() {
  const data = localStorage.getItem("userLessons");
  return data ? JSON.parse(data) : {};
}

/**
 * Сохраняет уроки в LocalStorage.
 * @param {Object} lessons - Объект уроков для сохранения.
 */
export function saveLessons(lessons) {
  localStorage.setItem("userLessons", JSON.stringify(lessons));
}

// Загрузка данных при старте приложения
export const lessons = loadLessons();
export const lessonsList = Object.keys(lessons);