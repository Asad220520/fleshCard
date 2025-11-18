import React, { useState, useEffect } from "react";

// Инлайн SVG-иконки для замены react-icons/hi
const IconSun = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.356 2.644a1 1 0 01.146 1.25l-.894.894a1 1 0 11-1.414-1.414l.894-.894a1 1 0 011.25-.146zm-8.712 0a1 1 0 011.25.146l.894.894a1 1 0 11-1.414 1.414l-.894-.894a1 1 0 01.146-1.25zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM4.644 14.356a1 1 0 01-.146-1.25l.894-.894a1 1 0 111.414 1.414l-.894.894a1 1 0 01-1.25.146zM15.356 5.644a1 1 0 01-1.25-.146l-.894-.894a1 1 0 111.414-1.414l.894.894a1 1 0 01-.146 1.25zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm13.356 4.356a1 1 0 01-1.25.146l-.894-.894a1 1 0 111.414-1.414l.894.894a1 1 0 01-.146 1.25zM10 13a3 3 0 110-6 3 3 0 010 6z"
      clipRule="evenodd"
    />
  </svg>
);
const IconMoon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M17.293 12.707a8.995 8.995 0 01-1.802-1.92A1 1 0 0014 10a1 1 0 011-1h1.5a.5.5 0 00.5-.5V8a1 1 0 00-1-1h-1.5a.5.5 0 00-.5.5V9a1 1 0 01-1-1V5a5 5 0 00-5-5A10 10 0 000 10c0 5.523 4.477 10 10 10a10 10 0 007.293-3.293zM10 18a8 8 0 01-8-8c0-3.666 1.956-6.84 4.887-8.675A8 8 0 0018 10a8 8 0 01-8 8z" />
  </svg>
);
const IconDownload = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6.293-7.707a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414l-1.293-1.293V14a1 1 0 11-2 0v-4.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3z"
      clipRule="evenodd"
    />
  </svg>
);
const IconCheck = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

// 💡 Глобальные константы
const SUPPORTED_TTS_LANGS = ["de", "en", "ko"];
const THEME_STORAGE_KEY = "theme";

export default function Settings() {
  // 1. Имплементация логики темы (замена useTheme)
  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_STORAGE_KEY) || "light"
  );

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    }
  }, [theme]);
  // Конец логики темы
  return (
    <div className="p-4 max-w-lg mx-auto dark:bg-gray-900">
      {/* Настройка Темы */}
      <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between dark:bg-gray-800 mb-4">
        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Тема (Dark Mode)
        </span>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-all duration-300 text-gray-700 border border-gray-300 hover:bg-gray-100 dark:text-yellow-400 dark:border-gray-600 dark:hover:bg-gray-700"
          aria-label="Переключить тему"
        >
          {theme === "light" ? (
            <IconMoon className="w-6 h-6" />
          ) : (
            <IconSun className="w-6 h-6" />
          )}
        </button>
      </div>
      {/* 3. Секция: Установить как Мобильное Приложение (PWA) */}
      <div className="bg-white p-4 rounded-xl shadow-md dark:bg-gray-800">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <IconDownload className="w-6 h-6 mr-2 text-sky-600 dark:text-sky-400" />
          Установить как приложение (PWA)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Вы можете установить этот сайт на главный экран своего телефона или
          планшета. Он будет работать как полноценное приложение!
        </p>

        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg dark:bg-gray-700 dark:border-gray-600">
          <p className="font-bold text-sky-800 dark:text-sky-300 mb-1">
            Инструкция:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>
              Нажмите на **иконку меню** (обычно три точки ⋮ или значок ⤴️) в
              вашем браузере.
            </li>
            <li>
              Найдите пункт **"Установить приложение"** или **"Добавить на
              главный экран"**.
            </li>
            <li>Подтвердите установку.</li>
            <li>Приложение появится среди остальных ваших приложений. 🎉</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
