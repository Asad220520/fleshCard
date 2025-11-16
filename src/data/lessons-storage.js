// Загружаем уроки из LocalStorage
export function loadLessons() {
  const data = localStorage.getItem("userLessons");
  return data ? JSON.parse(data) : {};
}

// Сохраняем уроки
export function saveLessons(lessons) {
  localStorage.setItem("userLessons", JSON.stringify(lessons));
}
