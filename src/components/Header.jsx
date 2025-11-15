import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
// Используем иконки: HiArrowLeft для Назад, HiHeart для Жизней, HiHome для Главной
import { HiArrowLeft, HiHeart, HiHome } from "react-icons/hi";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // Состояние для счетчика жизней (для демонстрации UI)
  const [lives, setLives] = useState(3);
  const maxLives = 3;

  // Функция для отрисовки сердец (индикатор жизней)
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < maxLives; i++) {
      hearts.push(
        <HiHeart
          key={i}
          className={`w-6 h-6 transition-colors duration-300 ${
            // Сердце цветное, если жизнь есть, серое - если нет
            i < lives ? "text-red-500" : "text-gray-400 dark:text-gray-600"
          }`}
        />
      );
    }
    return hearts;
  };

  // Определяем, должен ли отображаться стрелка "Назад"
  const showBackButton = location.pathname !== "/";

  // Простое отображение заголовка в центре
  const getHeaderTitle = () => {
    if (location.pathname === "/") return "WordMaster";
    if (location.pathname.includes("lesson")) return "импорт";
    if (location.pathname === "/learned") return "Мои Слова";
    if (location.pathname === "/profile") return "Профиль";
    if (location.pathname === "/settings") return "Настройки";
    if (location.pathname === "/add-lesson") return "Новый Урок";
    return "WordMaster";
  };

  return (
    <header className="sticky top-0 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Левая сторона: Кнопка Назад или Домой */}
        <div className="flex items-center space-x-4 w-1/3 justify-start">
          {showBackButton ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Назад"
              title="Назад"
            >
              <HiArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            // На главной странице ставим ссылку на Главную
            <Link
              to="/"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="На Главную"
            >
              <HiHome className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </Link>
          )}
        </div>

        {/* Центр: Заголовок */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-xl font-bold truncate max-w-[150px] sm:max-w-full">
            {getHeaderTitle()}
          </h1>
        </div>

        {/* Правая сторона: Индикатор жизней */}
        <div className="flex items-center space-x-1 w-1/3 justify-end">
          {renderHearts()}
        </div>
      </div>
    </header>
  );
}

export default Header;
