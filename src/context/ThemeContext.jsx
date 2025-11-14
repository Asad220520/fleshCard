import React, { createContext, useState, useEffect, useContext } from "react";

// 1. Создаем контекст
const ThemeContext = createContext();

// 2. Провайдер для темы
export const ThemeProvider = ({ children }) => {
  // Инициализация темы
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = document.documentElement;

    // Применяем тему и сохраняем в localStorage
    if (theme === "dark") {
      root.classList.add("dark"); // Добавляем класс "dark"
    } else {
      root.classList.remove("dark"); // Убираем класс "dark"
    }

    // Сохраняем текущую тему в localStorage
    localStorage.setItem("theme", theme);
  }, [theme]); // Каждый раз при изменении темы

  // Функция переключения темы
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Хук для использования темы
export const useTheme = () => useContext(ThemeContext);
