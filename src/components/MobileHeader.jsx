import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
// Импорт иконок
import { HiHome, HiBookmark, HiUser, HiCog } from "react-icons/hi";

// Импорт хука для темы (оставлен, если нужен в других местах)
import { useTheme } from "../context/ThemeContext.jsx";

const MobileHeader = ({ label = "Назад", className = "" }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // 1. Состояние для управления видимостью
  const [isVisible, setIsVisible] = useState(true);
  // 2. Реф для хранения предыдущей позиции скролла
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Порог чувствительности скролла
    const SCROLL_THRESHOLD = 30;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Если скролл близко к началу страницы, всегда показываем
      if (currentScrollY < SCROLL_THRESHOLD) {
        setIsVisible(true);
      }
      // Скролл вниз (скрываем)
      else if (
        currentScrollY > lastScrollY.current &&
        currentScrollY > SCROLL_THRESHOLD
      ) {
        setIsVisible(false);
      }
      // Скролл вверх (показываем)
      else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      // Обновляем предыдущее значение
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`
        fixed bottom-0 left-0 right-0 w-full
        bg-white shadow-2xl py-1 px-2 z-50
        flex justify-around items-center
        dark:bg-gray-800 dark:shadow-2xl
        transition-transform duration-300 ease-in-out
        
        // Логика скрытия/появления
        ${isVisible ? "translate-y-0" : "translate-y-full"}

        // Скрываем компонент на десктопе
      `}
    >
      {/* 1. Кнопка "Главная" */}
      <Link
        to="/"
        className="flex flex-col items-center justify-center p-2 rounded-xl text-green-600 hover:text-green-500 
                   dark:text-green-400 dark:hover:text-green-300"
        aria-label="Главная"
      >
        <HiHome className="w-6 h-6" />
        <span className="text-xs mt-1">Главная</span>
      </Link>

      {/* 2. Кнопка "Мои слова" */}
      {/* <Link
        to="/learned"
        className="flex flex-col items-center justify-center p-2 rounded-xl text-green-600 hover:text-green-500 
                   dark:text-green-400 dark:hover:text-green-300"
        aria-label="Мои слова"
      >
        <HiBookmark className="w-6 h-6" />
        <span className="text-xs mt-1">Мои слова</span>
      </Link> */}

      {/* 3. ✅ Кнопка "Профиль" */}
      <Link
        to="/profile"
        className={`flex flex-col items-center justify-center p-2 rounded-xl text-sky-600 hover:text-sky-700 
                   dark:text-sky-400 dark:hover:text-sky-300 ${className}`}
        aria-label="Профиль"
      >
        <HiUser className="w-6 h-6" />
        <span className="text-xs mt-1">Профиль</span>
      </Link>

      {/* 4. ✅ Кнопка "Настройки" */}
      <Link
        to="/settings"
        className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-700 hover:text-gray-900 
                   dark:text-gray-200 dark:hover:text-gray-50"
        aria-label="Настройки"
      >
        <HiCog className="w-6 h-6" />
        <span className="text-xs mt-1">Настройки</span>
      </Link>
    </header>
  );
};

export default MobileHeader;
