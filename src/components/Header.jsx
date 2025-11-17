import React from "react";
// Импорт react-router-dom остается
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
// ❗ Новые импорты для Redux
import { useSelector, useDispatch } from "react-redux";

// =================================================================
// 1. ИНЛАЙН SVG ИКОНКИ (остаются без изменений)
// =================================================================
const IconArrowLeft = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);
const IconHeart = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
      clipRule="evenodd"
    />
  </svg>
);
const IconHome = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

// 💡 Константа максимального количества жизней, используемая в Redux Store
const DEFAULT_MAX_LIVES = 3;

// =================================================================
// 3. КОМПОНЕНТ HEADER (теперь использует Redux Toolkit)
// =================================================================

function Header() {
  const lives = useSelector((state) => state.lives.count);
  const MAX_LIVES = useSelector((state) => state.lives.maxLives);

  const navigate = useNavigate();
  // const { languageId } = useParams(); // <-- Больше не нужно!
  const location = useLocation();

  // Функция для отрисовки сердец (индикатор жизней)
  const renderHearts = () => {
    const hearts = [];
    // Используем MAX_LIVES из Redux Store
    for (let i = 0; i < MAX_LIVES; i++) {
      hearts.push(
        <IconHeart
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

  // ИСПРАВЛЕНО: Извлекаем ID языка из URL-пути
  const getHeaderTitle = () => {
    if (location.pathname === "/") return "WordMaster";

    const pathSegments = location.pathname
      .split("/")
      .filter((segment) => segment); // ['lessons-list', 'italian'] или ['lesson', 'german', 'flashcards']

    // 1. Обрабатываем маршруты, где ID языка является вторым сегментом
    if (
      pathSegments.length >= 2 &&
      (pathSegments[0] === "lessons-list" || pathSegments[0] === "lesson")
    ) {
      const languageId = pathSegments[1];
      // Проверяем, что ID языка существует и не является именем режима (например, 'flashcards')
      if (languageId && !ALL_MODES.includes(languageId)) {
        return languageId.toUpperCase();
      }
    }

    // 2. Обрабатываем фиксированные маршруты
    if (location.pathname === "/learned") return "Мои Слова";
    if (location.pathname === "/profile") return "Профиль";
    if (location.pathname === "/settings") return "Настройки";
    if (location.pathname === "/add-lesson") return "Новый Урок";

    // 3. Заголовок по умолчанию
    return "WordMaster";
  };

  // Добавляем ALL_MODES в компонент Header, чтобы getHeaderTitle мог его использовать.
  // Это позволит избежать отображения 'FLASHCARDS' или 'MATCHING' в заголовке, если они являются вторым сегментом.
  const ALL_MODES = [
    "flashcards",
    "matching",
    "quiz",
    "writing",
    "sentence_puzzle",
  ];

  return (
    <header className="sticky top-0 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Левая сторона: Кнопка Назад или Домой */}
        <div className="flex items-center space-x-4 w-1/3 justify-start">
          {showBackButton ? (
            <button
              onClick={() => {
                if (window.history.length > 2) navigate(-1);
                else navigate("/");
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Назад"
              title="Назад"
            >
              <IconArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            // На главной странице ставим ссылку на Главную
            <Link
              to="/"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="На Главную"
            >
              <IconHome className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </Link>
          )}
        </div>

        {/* Центр: Заголовок */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-xl font-bold truncate max-w-[150px] sm:max-w-full">
            {getHeaderTitle()}
          </h1>
        </div>

        {/* Правая сторона: Индикатор жизней, теперь управляемый Redux */}
        <div className="flex items-center space-x-1 w-1/3 justify-end">
          {renderHearts()}
        </div>
      </div>
    </header>
  );
}

// Экспортируем Header как основной компонент
export default Header;
