export const loadFolders = () => {
  const FOLDERS_STORAGE_KEY = "wordmasterFolders";

  try {
    const stored = localStorage.getItem(FOLDERS_STORAGE_KEY);
    // Добавление заглушек для примера, если папки пусты
    if (!stored)
      return {
        de_a1: { id: "de_a1", name: "Немецкий-A1", defaultLang: "de" },
        en_main: {
          id: "en_main",
          name: "Английский",
          defaultLang: "en",
        },
      };
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Ошибка загрузки папок:", e);
    return {};
  }
};
