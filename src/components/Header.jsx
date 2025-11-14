import React from "react";
import { Link, useNavigate } from "react-router-dom";
// Импорт иконок
// ✅ Добавлены HiUser и HiCog для Профиля и Настроек
import { HiHome, HiBookmark, HiUser, HiCog } from "react-icons/hi";
// HiArrowLeft, HiSun, HiMoon удалены, так как они больше не используются

// Импорт хука для темы (оставлен, но логика theme/toggleTheme не используется в хедере)
import { useTheme } from "../context/ThemeContext.jsx";

const MobileHeader = ({ label = "Назад", className = "" }) => {
  const navigate = useNavigate();
  // Используем хук темы
  // Логика темы здесь больше не нужна, но хук можно оставить, если он используется в другом месте.
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="fixed bottom-0 left-0 right-0 w-full md:relative md:top-auto 
                       bg-white shadow-lg py-1 px-2 z-50 md:py-3 md:px-6 
                       flex justify-around items-center md:justify-between
                       dark:bg-gray-800 dark:shadow-2xl"
    >
      {/* 1. Кнопка "Главная" */}
      <Link
        to="/"
        className="flex flex-col items-center justify-center p-2 rounded-xl text-green-600 hover:text-green-500 
                   md:flex-row md:py-2 md:px-4 md:bg-green-600 md:text-white md:rounded-xl md:shadow-md
                   dark:text-green-400 dark:hover:text-green-300 dark:md:bg-green-700"
        aria-label="Главная"
      >
        <HiHome className="w-6 h-6" />
        <span className="text-xs mt-1 md:text-base md:mt-0 md:ml-2 md:inline">
          Главная
        </span>
      </Link>

      {/* 2. Кнопка "Мои слова" */}
      <Link
        to="/learned"
        className="flex flex-col items-center justify-center p-2 rounded-xl text-green-600 hover:text-green-500 
                   md:flex-row md:py-2 md:px-4 md:bg-green-600 md:text-white md:rounded-xl md:shadow-md
                   dark:text-green-400 dark:hover:text-green-300 dark:md:bg-green-700"
        aria-label="Мои слова"
      >
        <HiBookmark className="w-6 h-6" />
        <span className="text-xs mt-1 md:text-base md:mt-0 md:ml-2 md:inline">
          Мои слова
        </span>
      </Link>

      {/* 3. ✅ НОВАЯ Кнопка "Профиль" (Вместо "Назад") */}
      <Link
        to="/profile"
        className={`flex flex-col items-center justify-center p-2 rounded-xl text-sky-600 hover:text-sky-700 
                   md:flex-row md:py-1 md:px-3 md:bg-sky-200 md:rounded-xl 
                   dark:text-sky-400 dark:hover:text-sky-300 dark:md:bg-sky-700 dark:md:text-white ${className}`}
        aria-label="Профиль"
      >
        <HiUser className="w-6 h-6" />
        <span className="text-xs mt-1 md:text-base md:mt-0 md:ml-2 md:inline">
          Профиль
        </span>
      </Link>

      {/* 4. ✅ НОВАЯ Кнопка "Настройки" (Вместо переключателя темы) */}
      <Link
        to="/settings"
        className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-700 hover:text-gray-900 
                   md:flex-row md:p-2 md:bg-gray-200 md:rounded-full md:shadow-inner md:hover:bg-gray-300
                   dark:text-gray-200 dark:hover:text-gray-50 dark:bg-gray-700 dark:md:bg-gray-700"
        aria-label="Настройки"
      >
        {/* Используем иконку настроек */}
        <HiCog className="w-6 h-6" />
        <span className="text-xs mt-1 md:text-sm md:mt-0 md:ml-2 md:inline">
          Настройки
        </span>
      </Link>
    </header>
  );
};

export default MobileHeader;
