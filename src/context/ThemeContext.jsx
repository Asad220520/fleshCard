// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

// 1. Создание контекста
const ThemeContext = createContext();

// 2. Компонент провайдера
export const ThemeProvider = ({ children }) => {
  // Инициализация: Проверяем локальное хранилище или предпочтения системы
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // 3. Эффект для применения класса 'dark' к HTML
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === "dark";

    // Сохраняем выбор пользователя
    localStorage.setItem("theme", theme);

    // --- ✅ ИСПРАВЛЕННАЯ ЛОГИКА ДЛЯ TAILWIND DARK MODE ---

    if (isDark) {
      // Если тема темная, добавляем класс 'dark'
      root.classList.add("dark");
    } else {
      // Если тема светлая, удаляем класс 'dark'
      root.classList.remove("dark");
    }

    // ❌ ВАЖНО: Мы больше не используем классы 'light' на корневом элементе.
    // Если вы ранее использовали класс 'light' для стилизации (что не рекомендуется),
    // вам нужно удалить его, чтобы Tailwind работал корректно.
    root.classList.remove("light");
    // ---------------------------------------------------
  }, [theme]);

  // Функция переключения
  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Хук для удобного использования в компонентах
export const useTheme = () => useContext(ThemeContext);
