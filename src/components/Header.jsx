import React from "react";
import { Link, useNavigate } from "react-router-dom";
// Импорт иконок. Я выбрал Heroicons (hi) из react-icons
// Home (домашняя), ArrowLeft (назад), Bookmark (закладка/мои слова)
import { HiHome, HiArrowLeft, HiBookmark } from "react-icons/hi";

// Внешний padding для контента. Важно: этот компонент не добавляет отступ сам,
// его должен добавить родительский элемент (например, в <main> или <div> вокруг контента)
// чтобы контент не перекрывался фиксированной нижней панелью.

const MobileHeader = ({ label = "Назад", className = "" }) => {
  const navigate = useNavigate();

  return (
    <header
      className="fixed bottom-0 left-0 right-0 w-full md:relative md:top-auto md:shadow-sm 
                       bg-white shadow-lg py-1 px-2 z-50 md:py-3 md:px-6 
                       flex justify-around items-center md:justify-between"
    >
      {/* 1. Кнопка "Главная" */}
      <Link
        to="/"
        className="flex flex-col items-center justify-center p-2 rounded-xl text-green-600 hover:text-green-500 md:flex-row md:py-2 md:px-4 md:bg-green-600 md:text-white"
        aria-label="Главная"
      >
        <HiHome className="w-6 h-6 md:hidden" />
        <span className="text-xs mt-1 md:text-base md:mt-0">Главная</span>
      </Link>

      {/* 2. Кнопка "Назад" */}
      <button
        onClick={() => navigate(-1)}
        className={`flex flex-col items-center justify-center p-2 rounded-xl text-sky-600 hover:text-sky-700 md:flex-row md:py-1 md:px-3 md:bg-sky-200 md:rounded-xl ${className}`}
        aria-label={label}
      >
        <HiArrowLeft className="w-6 h-6 md:hidden" />
        <span className="text-xs mt-1 md:text-base md:mt-0">{label}</span>
      </button>

      {/* 3. Ссылка "Мои слова" */}
      <Link
        to="/learned"
        className="flex flex-col items-center justify-center p-2 rounded-xl text-green-600 hover:text-green-500 md:flex-row md:py-2 md:px-4 md:bg-green-600 md:text-white"
        aria-label="Мои слова"
      >
        <HiBookmark className="w-6 h-6 md:hidden" />
        <span className="text-xs mt-1 md:text-base md:mt-0">Мои слова</span>
      </Link>
    </header>
  );
};

export default MobileHeader;

// ПРИМЕЧАНИЕ: На мобильных экранах я использую flex justify-around, чтобы распределить кнопки.
// Текст кнопок на мобильных устройствах сделан меньше (text-xs) и спрятан на больших экранах (md:hidden).
// Иконки спрятаны на больших экранах (md:hidden).
