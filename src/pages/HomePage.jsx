import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/solid"; // Для кнопки закрытия

// -----------------------------------------------------------------
// 💡 Данные о языках
// -----------------------------------------------------------------
// src/data/languages.js
export const languages = [
  { id: "german", name: "Немецкий", emoji: "🇩🇪", lessonPrefix: "moko" }, // особый кейс
  { id: "english", name: "Английский", emoji: "🇬🇧", lessonPrefix: "en_" },
  { id: "french", name: "Французский", emoji: "🇫🇷", lessonPrefix: "fr_" },
  { id: "spanish", name: "Испанский", emoji: "🇪🇸", lessonPrefix: "es_" },
  { id: "italian", name: "Итальянский", emoji: "🇮🇹", lessonPrefix: "it_" },
  { id: "russian", name: "Русский", emoji: "🇷🇺", lessonPrefix: "ru_" },
  { id: "chinese", name: "Китайский", emoji: "🇨🇳", lessonPrefix: "zh_" },
  { id: "japanese", name: "Японский", emoji: "🇯🇵", lessonPrefix: "ja_" },
  { id: "korean", name: "Корейский", emoji: "🇰🇷", lessonPrefix: "ko_" },
  { id: "arabic", name: "Арабский", emoji: "🇸🇦", lessonPrefix: "ar_" },
  { id: "turkish", name: "Турецкий", emoji: "🇹🇷", lessonPrefix: "tr_" },
];


// -----------------------------------------------------------------
// ⚛️ Дочерние Компоненты (для оптимизации используем React.memo)
// -----------------------------------------------------------------

const LanguageCard = React.memo(({ lang }) => (
  <Link
    to={`/lessons-list/${lang.id}`}
    className={`
      block p-6 bg-white dark:bg-gray-800 
      rounded-xl shadow-lg 
      transition-all duration-300 
      transform hover:scale-105 hover:shadow-2xl 
      text-center cursor-pointer
      border dark:border-gray-700
      hover:border-sky-500 dark:hover:border-sky-400
    `}
  >
    <div className="text-6xl mb-4" aria-hidden="true">
      {lang.emoji}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
      {lang.name}
    </h3>
  </Link>
));
LanguageCard.displayName = "LanguageCard";

// 2. Кнопка для открытия модального окна
const AddLanguageButton = React.memo(({ onClick }) => (
  <button
    onClick={onClick} // Вызывает функцию, переданную из HomePage
    className="
      flex flex-col items-center justify-center 
      p-6 bg-gray-50 dark:bg-gray-800/50 
      h-full w-full
      min-h-[140px] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600
      transition duration-300 
      hover:border-blue-500 dark:hover:border-blue-400 
      text-gray-500 dark:text-gray-400 
      hover:text-blue-500 dark:hover:text-blue-400
      shadow-sm hover:shadow-md
    "
  >
    <div className="text-5xl mb-3" aria-hidden="true">
      +
    </div>
    <h3 className="text-lg font-semibold">Добавить язык</h3>
  </button>
));
AddLanguageButton.displayName = "AddLanguageButton";

// 3. Компонент Модального окна
const AddLanguageModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Фон - фиксированный, полупрозрачный оверлей
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      {/* Контейнер модального окна */}
      <div className="relative w-full max-w-md p-6 mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all duration-300 scale-100">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
          ➕ Добавить новый язык
        </h2>

        {/* Место для вашей формы */}
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            Здесь будет размещена форма для ввода названия языка, кода и,
            возможно, флага.
          </p>
          <input
            type="text"
            placeholder="Например: Японский"
            className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 🏠 Главный Компонент
// -----------------------------------------------------------------

export default function HomePage() {
  // 💡 Состояние для управления видимостью модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Используем useCallback для функций, передаваемых в дочерние компоненты
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-gray-100 max-w-6xl mx-auto">
        📚 Мои языки
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {/* Рендерим карточки всех языков */}
        {languages.map((lang) => (
          <LanguageCard key={lang.id} lang={lang} />
        ))}

        {/* Карточка-кнопка для добавления нового языка */}
        <AddLanguageButton onClick={openModal} />
      </div>

      {/* Модальное окно */}
      <AddLanguageModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
