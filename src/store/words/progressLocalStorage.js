// store/words/progressLocalStorage.js

export const loadProgress = (key) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return [];
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.error("Ошибка загрузки прогресса из localStorage:", key, e);
    return [];
  }
};

export const saveProgress = (key, state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (e) {
    console.error("Ошибка сохранения прогресса в localStorage:", key, e);
  }
};
