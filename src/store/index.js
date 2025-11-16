// store/index.js

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import gameStateReducer, { setGameOver, clearGameOver } from "./gameState/gameStateSlice"; // ❗ НОВЫЙ ИМПОРТ
import combinedWordsReducer, { wordsActions } from "./words";
import livesReducer, { livesActions } from "./lives";

// ❗ БЕЗОПАСНЫЙ NOOP STORAGE ДЛЯ СЛУЧАЕВ, КОГДА WINDOW НЕДОСТУПЕН
const isClient = typeof window !== "undefined";
const noopStorage = {
  getItem: (key) => Promise.resolve(null),
  setItem: (key, value) => Promise.resolve(),
  removeItem: (key) => Promise.resolve(),
};

// ❗ ФУНКЦИЯ ВЫБОРА ХРАНИЛИЩА
const selectStorage = () => {
  if (isClient && window.localStorage) {
    // Создаем адаптер для localStorage, чтобы он возвращал Promise,
    // как этого требует redux-persist (если стандартный импорт не работает)
    return {
      getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key, value) =>
        Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
    };
  }
  return noopStorage;
};

// --- 1. Конфигурация Redux Persist ---
const persistConfig = {
  key: "root",
  storage: selectStorage(), // Ваш рабочий адаптер
  // ❗ ИСПРАВЛЕНИЕ: Добавляем "gameState"
  whitelist: ["lives", "words", "gameState"], 
};

// --- 2. Объединение редьюсеров ---
const rootReducer = combineReducers({
  words: combinedWordsReducer,
  lives: livesReducer,
  gameState: gameStateReducer, // ❗ НОВЫЙ РЕДЬЮСЕР
});

// --- 3. Оборачивание корневого редьюсера ---
const persistedReducer = persistReducer(persistConfig, rootReducer);

// --- 4. Создание Store с настроенным редьюсером ---
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// --- 5. Создание Persistor ---
export const persistor = persistStore(store);

// Экспортируем объединенный объект действий
export { wordsActions, livesActions };
