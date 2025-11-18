// src/utils/filterLessonsByLanguage.js

// Предполагая, что lessonsData — это полный объект уроков,
// загруженный из LocalStorage (lessonsData = { lessonId: { lang, cards }, ... })
import { loadLessons } from "../data/lessons-storage"; // корректируем путь

export const filterLessonsByLanguage = (lessonIds, languageId) => {
  const allLessons = loadLessons();
  if (!languageId || languageId.toLowerCase() === "all") {
    return lessonIds; // Если язык не указан или "all", возвращаем все ID
  }

  // Фильтруем ID, проверяя поле 'lang' внутри объекта урока
  return lessonIds.filter((id) => {
    const lesson = allLessons[id];
    return (
      lesson &&
      lesson.lang &&
      lesson.lang.toLowerCase() === languageId.toLowerCase()
    );
  });
};
