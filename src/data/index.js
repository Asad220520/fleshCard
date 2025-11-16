// import { les1 } from "./les1.10слов";
// import { les2 } from "./les2.10слов";
// import { les3 } from "./les.3";

// export const lessons = {
//   les1,
//   les2,
//   les3,
// };

// // Список уроков для отображения на главной странице
// export const lessonsList = Object.keys(lessons); // ["les1", "les2"]


import { loadLessons } from "./lessons-storage";

export const lessons = loadLessons();

// Генерация списка уроков
export const lessonsList = Object.keys(lessons);
