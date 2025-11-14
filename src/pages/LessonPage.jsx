import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { selectLesson } from "../store/store";
import { lessons } from "../data";
// Импорт иконок
import {
  HiOutlineCreditCard,
  HiOutlineAcademicCap,
  HiOutlinePuzzle,
  HiOutlinePencil,
  HiOutlineClipboardList,
} from "react-icons/hi";

// 🆕 Безопасная карта цветов Tailwind для динамических классов
// Эти классы ДОЛЖНЫ быть полными строками, чтобы Tailwind их включил.
const colorClasses = {
  gray: {
    icon: "text-gray-600 dark:text-gray-400",
    hoverBg: "hover:bg-gray-100 dark:hover:bg-gray-700",
    border: "border-gray-400 dark:border-gray-600",
  },
  sky: {
    icon: "text-sky-600 dark:text-sky-400",
    hoverBg: "hover:bg-sky-50 dark:hover:bg-sky-900",
    border: "border-sky-400 dark:border-sky-600",
  },
  green: {
    icon: "text-green-600 dark:text-green-400",
    hoverBg: "hover:bg-green-50 dark:hover:bg-green-900",
    border: "border-green-400 dark:border-green-600",
  },
  purple: {
    icon: "text-purple-600 dark:text-purple-400",
    hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-900",
    border: "border-purple-400 dark:border-purple-600",
  },
  yellow: {
    icon: "text-yellow-600 dark:text-yellow-400",
    hoverBg: "hover:bg-yellow-50 dark:hover:bg-yellow-900",
    border: "border-yellow-400 dark:border-yellow-600",
  },
};

// Определяем список действий и их параметры
const actions = [
  // --- НОВОЕ: Вспомогательное действие (Список слов) ---
  {
    name: "Слова урока",
    path: "words",
    icon: HiOutlineClipboardList,
    color: "gray",
    description: "Просмотреть полный список слов в этом уроке.",
    isStudyMode: false,
  },
  // --- Режимы тренировки ---
  {
    name: "Флешкарты",
    path: "flashcards",
    icon: HiOutlineCreditCard,
    color: "sky",
    description: "Просматривайте слова и их перевод.",
    isStudyMode: true,
  },
  {
    name: "Учить варианты",
    path: "quiz",
    icon: HiOutlineAcademicCap,
    color: "green",
    description: "Выберите правильный перевод из предложенных вариантов.",
    isStudyMode: true,
  },
  {
    name: "Сопоставление",
    path: "matching",
    icon: HiOutlinePuzzle,
    color: "purple",
    description: "Соедините слово с его переводом.",
    isStudyMode: true,
  },
  {
    name: "Письмо",
    path: "writing",
    icon: HiOutlinePencil,
    color: "yellow",
    description: "Напишите перевод, чтобы проверить знание орфографии.",
    isStudyMode: true,
  },
];

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверка наличия урока в данных
    if (lessonId && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
      setLoading(false);
    } else if (lessonId) {
      setLoading(false);
      // Если урок не найден, можно перенаправить пользователя
      // navigate('/lessons');
    }
  }, [lessonId, dispatch]);

  if (loading)
    return (
      <div className="p-6 text-gray-500 text-center dark:text-gray-400 dark:bg-gray-900 min-h-screen">
        Загрузка...
      </div>
    );

  if (!lessons[lessonId])
    return (
      <div className="p-6 text-red-500 text-center dark:bg-gray-900 min-h-screen">
        Урок не найден.
      </div>
    );

  const infoAction = actions.find((a) => !a.isStudyMode);
  const studyActions = actions.filter((a) => a.isStudyMode);

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center bg-gray-50 min-h-screen dark:bg-gray-900 transition-colors duration-300">
      {/* Заголовок урока */}
      <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mt-4 mb-3 text-center">
        {lessonId.toUpperCase()}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
        Выберите действие:
      </p>

      <div className="w-full max-w-2xl">
        {/* 1. Блок "Слова урока" */}
        {infoAction && (
          <button
            key={infoAction.path}
            onClick={() => navigate(`/lesson/${lessonId}/${infoAction.path}`)}
            className={`
              flex flex-col items-start p-5 bg-white rounded-xl shadow-lg 
              transition duration-300 ease-in-out w-full mb-6
              transform hover:scale-[1.01]
              
              // 🆕 Dark Mode и стили из карты
              dark:bg-gray-800 dark:shadow-xl dark:border-gray-600
              ${colorClasses.gray.hoverBg} border-b-4 ${colorClasses.gray.border}
            `}
          >
            <infoAction.icon
              className={`w-8 h-8 mb-2 ${colorClasses.gray.icon}`}
            />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 text-left">
              {infoAction.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-left">
              {infoAction.description}
            </p>
          </button>
        )}

        <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">
          Режимы тренировки
        </h3>

        {/* 2. Сетка режимов тренировки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {studyActions.map((action) => {
            const styles = colorClasses[action.color] || colorClasses.gray;

            return (
              <button
                key={action.path}
                onClick={() => navigate(`/lesson/${lessonId}/${action.path}`)}
                className={`
                  flex flex-col items-start p-5 bg-white rounded-xl shadow-md 
                  transition duration-300 ease-in-out
                  transform hover:scale-[1.01] 
                  
                  // 🆕 Dark Mode и стили из карты
                  dark:bg-gray-800 dark:shadow-xl dark:border-gray-600
                  ${styles.hoverBg} border-b-4 ${styles.border}
                `}
              >
                <action.icon className={`w-8 h-8 mb-2 ${styles.icon}`} />

                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 text-left">
                  {action.name}
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-left">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
