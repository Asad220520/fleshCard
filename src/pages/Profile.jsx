import React, { useMemo } from "react";
import { useSelector } from "react-redux";
// ✅ ДОБАВЛЯЕМ ИМПОРТ ИСХОДНЫХ ДАННЫХ
import { lessonsList, lessons } from "../data";
// Импортируем иконки для визуального оформления
import {
  HiUserCircle,
  HiAcademicCap,
  HiBookOpen,
  HiBadgeCheck,
} from "react-icons/hi";

export default function Profile() {
  // --- 1. Получение данных из Redux ---
  const { learned } = useSelector((state) => state.words);
  // Массив 'list' больше не нужен для общего расчета,
  // так как мы используем 'lessons' из data.js

  // Статические (заглушечные) данные
  const username = "Ученик_Германский";
  const memberSince = "Январь 2024";

  // --- 2. Вычисление реальной статистики (с использованием useMemo) ---

  const totalWordsLearned = learned.length;

  // ✅ КОРРЕКТНЫЙ РАСЧЕТ ЗАВЕРШЕННЫХ УРОКОВ
  const { lessonsCompleted } = useMemo(() => {
    let fullyCompletedCount = 0;

    // 1. ИТЕРИРУЕМСЯ ПО ВСЕМ УРОКАМ, ОПРЕДЕЛЕННЫМ В data.js
    lessonsList.forEach((lessonId) => {
      // Общее количество слов в уроке (из data.js)
      const totalWords = lessons[lessonId] ? lessons[lessonId].length : 0;

      // Выученные слова из этого урока (из Redux learned)
      const learnedInLesson = learned.filter(
        (w) => w.lessonId === lessonId
      ).length;

      // Урок завершен
      if (totalWords > 0 && totalWords === learnedInLesson) {
        fullyCompletedCount++;
      }
    });

    return {
      lessonsCompleted: fullyCompletedCount,
    };
  }, [learned]); // Зависимость только от learned, так как lessonsList/lessons статичны

  // Уровень (динамическое определение на основе прогресса)
  const masteryLevel = useMemo(() => {
    if (totalWordsLearned < 50) return "Начинающий A1";
    if (totalWordsLearned < 200) return "Начинающий A2";
    if (totalWordsLearned < 500) return "Средний B1";
    return "Продвинутый B2+";
  }, [totalWordsLearned]);

  // --- 3. Объект данных для рендеринга ---
  const userData = {
    username: username,
    memberSince: memberSince,
    totalWordsLearned: totalWordsLearned,
    lessonsCompleted: lessonsCompleted,
    masteryLevel: masteryLevel,
  };
  // --------------------------------------------------------

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors duration-300">
      {/* Заголовок */}
      <div className="w-full max-w-lg mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-50">
          Мой Профиль
        </h1>
      </div>

      {/* Карточка профиля */}
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        {/* Аватар и имя */}
        <div className="flex flex-col items-center mb-6">
          <HiUserCircle className="w-24 h-24 text-sky-500 mb-3 dark:text-sky-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50">
            {userData.username}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            С нами с {userData.memberSince}
          </p>
        </div>

        <hr className="my-6 border-gray-100 dark:border-gray-700" />

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-6 text-center">
          {/* 1. Выучено слов */}
          <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg dark:bg-green-900/30">
            <HiBadgeCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            <p className="text-2xl font-bold text-gray-800 mt-1 dark:text-gray-50">
              {userData.totalWordsLearned}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Выучено слов
            </p>
          </div>

          {/* 2. Завершено уроков */}
          <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg dark:bg-purple-900/30">
            <HiBookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <p className="text-2xl font-bold text-gray-800 mt-1 dark:text-gray-50">
              {userData.lessonsCompleted}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Уроков завершено
            </p>
          </div>

          {/* 3. Уровень */}
          <div className="col-span-2 flex flex-col items-center p-4 bg-sky-50 rounded-lg dark:bg-sky-900/30">
            <HiAcademicCap className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            <p className="text-lg font-bold text-gray-800 mt-1 dark:text-gray-50">
              {userData.masteryLevel}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Уровень владения
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
