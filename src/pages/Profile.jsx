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

// --- Вспомогательная функция для объединения и уникализации ---
// 💡 Обновление: Функция теперь принимает объект progress, а не весь wordsState
const getAllUniqueLearnedWords = (progressState) => {
  // progressState - это объект { learnedFlashcards: [...], learnedMatching: [...], ... }
  const allWords = [
    ...progressState.learnedFlashcards,
    ...progressState.learnedMatching,
    ...progressState.learnedQuiz,
    ...progressState.learnedWriting,
  ];

  // Используем Map для хранения уникальных слов по ключу (de + lessonId)
  const uniqueWordsMap = new Map();

  allWords.forEach((word) => {
    const key = `${word.de}-${word.lessonId}`;
    if (!uniqueWordsMap.has(key)) {
      uniqueWordsMap.set(key, word);
    }
  });

  return Array.from(uniqueWordsMap.values());
};

export default function Profile() {
  // --- 1. Получение данных из Redux ---
  // ✅ ИСПРАВЛЕНИЕ: Получаем только вложенный объект progress
  const progressState = useSelector((state) => state.words.progress);

  // Статические (заглушечные) данные
  const username = "Ученик";
  const memberSince = "неизвестно";

  // --- 2. Вычисление реальной статистики (с использованием useMemo) ---

  // 💡 ОБНОВЛЕНИЕ: Расчет всех метрик теперь зависит от progressState
  const { totalWordsLearned, lessonsCompleted, masteryLevel } = useMemo(() => {
    // 1. ОБЪЕДИНЯЕМ ВСЕ ВЫУЧЕННЫЕ СЛОВА
    const uniqueLearned = getAllUniqueLearnedWords(progressState); // Передаем progressState
    const calculatedTotalWordsLearned = uniqueLearned.length;

    // 2. РАСЧЕТ ЗАВЕРШЕННЫХ УРОКОВ
    let fullyCompletedCount = 0;

    // Группируем выученные слова по lessonId
    const learnedByLesson = uniqueLearned.reduce((acc, word) => {
      acc[word.lessonId] = (acc[word.lessonId] || 0) + 1;
      return acc;
    }, {});

    // ИТЕРИРУЕМСЯ ПО ВСЕМУ СПИСКУ УРОКОВ
    lessonsList.forEach((lessonId) => {
      // Общее количество слов в уроке (из data.js)
      const totalWords = lessons[lessonId] ? lessons[lessonId].length : 0;

      // Выученные слова из этого урока (из объединенного списка)
      const learnedInLesson = learnedByLesson[lessonId] || 0;

      // Урок завершен (выучены все слова урока хотя бы в одном режиме)
      if (totalWords > 0 && totalWords === learnedInLesson) {
        fullyCompletedCount++;
      }
    });

    // 3. РАСЧЕТ УРОВНЯ МАСТЕРСТВА
    let calculatedMasteryLevel;
    if (calculatedTotalWordsLearned < 50)
      calculatedMasteryLevel = "Начинающий A1";
    else if (calculatedTotalWordsLearned < 200)
      calculatedMasteryLevel = "Начинающий A2";
    else if (calculatedTotalWordsLearned < 500)
      calculatedMasteryLevel = "Средний B1";
    else calculatedMasteryLevel = "Продвинутый B2+";

    return {
      totalWordsLearned: calculatedTotalWordsLearned,
      lessonsCompleted: fullyCompletedCount,
      masteryLevel: calculatedMasteryLevel,
    };
  }, [progressState]); // Зависимость от progressState

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
