import React from "react";
import { Link } from "react-router-dom"; // Убедитесь, что у вас установлен react-router-dom

// -----------------------------------------------------------------
// 💡 Это ваши "модули".
// Вы можете загружать этот список с сервера или хранить здесь.
// `id` - это то, что пойдет в URL (e.g. /lessons/german)
// -----------------------------------------------------------------
const languages = [
  { id: "german", name: "Немецкий", emoji: "🇩🇪" },
  { id: "english", name: "Английский", emoji: "🇬🇧" },
  { id: "spanish", name: "Испанский", emoji: "🇪🇸" },
  { id: "french", name: "Французский", emoji: "🇫🇷" },
  // { id:moko "moko", name: "Тестовый (Moko)", emoji: "🧪" }, // Пример, если moko - это отдельный язык/модуль
];

const LanguageCard = ({ lang }) => (
  <Link
    to={`/lessons/${lang.id}`}
    className="
      block p-6 bg-white dark:bg-gray-800 
      rounded-xl shadow-lg 
      transition-all duration-300 
      transform hover:scale-105 hover:shadow-xl 
      text-center cursor-pointer
      border dark:border-gray-700
    "
  >
    <div className="text-6xl mb-4" aria-hidden="true">
      {lang.emoji}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {lang.name}
    </h3>
  </Link>
);

const AddLanguageCard = () => (
  // Эта кнопка может вести на /add-language или открывать модальное окно
  <button
    onClick={() => alert("Скоро: добавление нового языка!")}
    className="
      flex flex-col items-center justify-center 
      p-6 bg-gray-50 dark:bg-gray-800/50 
      h-full w-full
      rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600
      transition duration-300 
      hover:border-blue-500 dark:hover:border-blue-400 
      text-gray-500 dark:text-gray-400 
      hover:text-blue-500 dark:hover:text-blue-400
    "
  >
    <div className="text-5xl mb-3" aria-hidden="true">
      +
    </div>
    <h3 className="text-lg font-semibold">Добавить язык</h3>
  </button>
);

const HomePage = () => {
  return (
    // Контейнер с отступами, как в вашем LessonsList
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Мои языки
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Рендерим карточки всех языков */}
        {languages.map((lang) => (
          <LanguageCard key={lang.id} lang={lang} />
        ))}

        {/* Карточка для добавления нового языка */}
        <AddLanguageCard />
      </div>
    </div>
  );
};

export default HomePage;