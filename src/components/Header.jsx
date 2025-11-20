import React from "react";
// Импорт react-router-dom остается
import { useNavigate, useLocation, Link } from "react-router-dom";
// ❗ Новые импорты для Redux
import { useSelector, useDispatch } from "react-redux";
// ❗ Импортируем действие для возможного использования (например, для отладки или сброса)
// import { resetLives } from './livesSlice'; // Не обязательно в этом Header, но полезно знать

// =================================================================
// 1. ИНЛАЙН SVG ИКОНКИ (добавлена IconInfinity)
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

// ❗ НОВАЯ ИКОНКА: Символ бесконечности для безлимитных жизней
const IconInfinity = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18.8 6.78c-1.32-.93-3.13-1.48-5.06-1.28-1.92.2-3.6.86-4.94 1.77-1.35.91-2.19 2.1-2.47 3.49-.27 1.39-.1 2.7.5 4.07.6 1.37 1.7 2.47 3.06 3.16 1.36.7 3.03 1.05 4.73.86s3.32-.78 4.64-1.7c1.32-.93 2.13-2.16 2.4-3.56.27-1.4-.04-2.8-.75-4.13" />
    <path d="M5.2 17.22c1.32.93 3.13 1.48 5.06 1.28 1.92-.2 3.6-.86 4.94-1.77 1.35-.91 2.19-2.1 2.47-3.49.27-1.4.04-2.8-.75-4.13" />
  </svg>
);

// 💡 Константа максимального количества жизней, используемая в Redux Store
const DEFAULT_MAX_LIVES = 3;

// =================================================================
// 2. УДАЛЯЕМ/КОММЕНТИРУЕМ CONTEXT API (Оставлено как было)
// =================================================================
/*
// 💡 Дефолтное значение для контекста для предотвращения ошибки TypeError.
const defaultGameContextValue = {
  lives: DEFAULT_MAX_LIVES,
  MAX_LIVES: DEFAULT_MAX_LIVES,
  decreaseLives: () => {},
  resetLives: () => {},
  score: 0,
  setScore: () => {},
};

const GameContext = createContext(defaultGameContextValue);
export const useGameContext = () => {
  return useContext(GameContext);
};

export const GameProvider = ({ children }) => {
  // ... код Context API
};
*/
// =================================================================
// 3. КОМПОНЕНТ HEADER (теперь использует Redux Toolkit и isUnlimited)
// =================================================================

function Header() {
  // 💡 ИСПОЛЬЗУЕМ REDUX: Получаем все необходимые данные о жизнях
  const lives = useSelector((state) => state.lives.count);
  const MAX_LIVES = useSelector((state) => state.lives.maxLives);
  const isUnlimited = useSelector((state) => state.lives.isUnlimited); // ❗ Получаем новый флаг

  const navigate = useNavigate();
  const location = useLocation();
  // const dispatch = useDispatch(); // Используется, если нужно вызывать действия (например, сброс)

  // Функция для отрисовки сердец (индикатор жизней) - используется только для ограниченного режима
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

  // ❗ Определение ссылки для перехода
  const getLivesLink = () => {
    // Если безлимитный режим, ведем на статус Premium (гипотетическая страница)
    if (isUnlimited) {
      return "/premium-status";
    }
    // Если ограниченный режим, ведем на страницу восстановления (в идеале - на checkout)
    // Сейчас используем заглушку, так как lessonId неизвестен
    return "/premium-status"; // Предполагаем, что с главной страницы можно начать восстановление
  };

  const livesLinkTo = getLivesLink();

  // Определяем, должен ли отображаться стрелка "Назад"
  const showBackButton = location.pathname !== "/";

  // Простое отображение заголовка в центре
  const getHeaderTitle = () => {
    if (location.pathname === "/") return "WordMaster";
    if (location.pathname.includes("lesson")) return "Урок";
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

        {/* Правая сторона: Индикатор жизней, теперь кликабельный */}
        <div className="flex items-center space-x-1 w-1/3 justify-end">
          <Link
            to={livesLinkTo}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow duration-300"
            aria-label={isUnlimited ? "Статус Premium" : "Восстановить жизни"}
            title={isUnlimited ? "Статус Premium" : "Восстановить жизни"}
          >
            {isUnlimited ? (
              // ❗ РЕНДЕР: БЕЗЛИМИТНЫЕ ЖИЗНИ (Улучшенный стиль для мобильных)
              <div className="flex items-center space-x-1 bg-green-500/10 dark:bg-green-900/50 px-3 py-1 rounded-full border border-green-500 transition-all duration-300 hover:bg-green-500/20 shadow-md hover:shadow-lg">
                <IconInfinity className="w-6 h-6 text-green-600 dark:text-green-400" />
                {/* PREMIUM теперь видно всегда, чтобы было нагляднее на телефоне */}
                <span className="text-xs font-bold text-green-700 dark:text-green-300">
                  PREMIUM
                </span>
              </div>
            ) : (
              // ❗ РЕНДЕР: ОГРАНИЧЕННЫЕ ЖИЗНИ
              <div className="flex space-x-1 p-1">{renderHearts()}</div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

// Экспортируем Header как основной компонент
export default Header;
