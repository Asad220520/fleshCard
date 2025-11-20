import React from "react";

/**
 * Компонент Прогресс-бар для отображения текущего состояния учебной сессии.
 * Улучшенный "Вау" дизайн с акцентом на мобильность и стиль.
 */
export default function ProgressBar({
  current,
  totalInSession,
  totalRemaining,
  roundInfo,
}) {
  const safeTotal = totalInSession > 0 ? totalInSession : 1;
  // Рассчитываем процент, основываясь на текущем прогрессе (от 0 до 100)
  const progressPercent = ((current + 1) / safeTotal) * 100;
  // Обеспечиваем, что отображаемый номер вопроса не превышает общее количество в сессии
  const displayCurrent =
    current < totalInSession ? current + 1 : totalInSession;

  // Классы для акцентов
  const mainTextColor = "text-sky-600 dark:text-sky-400"; // Основной акцентный цвет
  const secondaryTextColor = "text-gray-500 dark:text-gray-400"; // Второстепенный текст
  const roundInfoClass = "text-purple-600 dark:text-purple-400 font-bold ml-2";

  return (
    // Общий контейнер: узкий, с отступами для мобильных
    <div className="w-full max-w-lg mx-auto px-4 sm:px-0 mb-8 transition-colors duration-300">
      {/* 1. Блок текста (Компактный и информативный) */}
      <div className="flex justify-between items-end mb-2">
        {/* Левая часть: Текущий вопрос и информация о раунде */}
        <div className="flex items-baseline">
          <span className={`text-xl font-extrabold ${mainTextColor}`}>
            {displayCurrent}
            <span className={`text-sm font-semibold ${secondaryTextColor}`}>
              /{totalInSession}
            </span>
          </span>

          {roundInfo && (
            <span
              className={`text-xs uppercase tracking-wider ${roundInfoClass}`}
            >
              {roundInfo}
            </span>
          )}
        </div>

        {/* Правая часть: Всего осталось */}
        <span className={`text-sm font-medium ${secondaryTextColor}`}>
          Осталось: <span className="font-bold">{totalRemaining}</span>
        </span>
      </div>

      {/* 2. Прогресс-бар (Эффектный, тонкий) */}
      <div
        // Тонкий бар (h-1.5) с эффектом вдавленности (shadow-inner)
        className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden dark:bg-gray-700 shadow-inner"
      >
        <div
          // Агрессивный, яркий градиент
          className="bg-gradient-to-r from-sky-500 to-cyan-500 h-full rounded-full transition-all duration-700 ease-in-out shadow-lg shadow-sky-400/50"
          style={{
            width: `${progressPercent}%`,
            // Дополнительный градиентный/отражающий эффект на границе для WOW
            filter: `drop-shadow(0 0 2px rgba(56, 189, 248, 0.5))`,
          }}
        >
          {/* Небольшой внутренний элемент для имитации блика */}
          <div className="h-full w-2 bg-white/30 rounded-full float-right animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
