import React from "react";
// Импорт иконок для переключателя темы
import { HiSun, HiMoon } from "react-icons/hi";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-4 max-w-lg mx-auto dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-50">
        Настройки
      </h1>

      <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between dark:bg-gray-800">
        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Тема (Dark Mode)
        </span>

        {/* Переключатель темы */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-all duration-300 
                     text-gray-700 border border-gray-300 hover:bg-gray-100
                     dark:text-yellow-400 dark:border-gray-600 dark:hover:bg-gray-700"
          aria-label="Переключить тему"
        >
          {theme === "light" ? (
            <HiMoon className="w-6 h-6" />
          ) : (
            <HiSun className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}
  