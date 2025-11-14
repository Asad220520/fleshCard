import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { selectLesson } from "../store/store";
import { lessons } from "../data";
// Импорт иконок: Card, Quiz, Matching/Puzzle, Writing, List
import {
  HiOutlineCreditCard,
  HiOutlineAcademicCap,
  HiOutlinePuzzle,
  HiOutlinePencil,
  HiOutlineClipboardList, // <-- Новая иконка для списка
} from "react-icons/hi";

// Определяем список действий и их параметры
const actions = [
  // --- НОВОЕ: Вспомогательное действие (Список слов) ---
  {
    name: "Слова урока",
    path: "words", // <-- Новый маршрут: /lesson/:lessonId/words
    icon: HiOutlineClipboardList,
    color: "gray",
    description: "Просмотреть полный список слов в этом уроке.",
    isStudyMode: false, // Флаг для стилизации
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
      // Опционально: navigate('/lessons');
    }
  }, [lessonId, dispatch]);

  if (loading)
    return <div className="p-6 text-gray-500 text-center">Загрузка...</div>;

  // Добавляем проверку на случай, если lessonId невалиден
  if (!lessons[lessonId])
    return <div className="p-6 text-red-500 text-center">Урок не найден.</div>;

  // Разделение действий на "Слова урока" и "Режимы тренировки" для лучшей компоновки
  const infoAction = actions.find((a) => !a.isStudyMode);
  const studyActions = actions.filter((a) => a.isStudyMode);

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center bg-gray-50 min-h-screen">
      {/* Заголовок урока */}
      <h1 className="text-4xl font-extrabold text-gray-800 mt-4 mb-3 text-center">
        {lessonId.toUpperCase()}
      </h1>
      <p className="text-gray-500 mb-8 text-center">Выберите действие:</p>

      <div className="w-full max-w-2xl">
        {/* 1. Блок "Слова урока" */}
        {infoAction && (
          <button
            key={infoAction.path}
            onClick={() => navigate(`/lesson/${lessonId}/${infoAction.path}`)}
            className={`
              flex flex-col items-start p-5 bg-white rounded-xl shadow-lg 
              transition duration-300 ease-in-out w-full mb-6
              transform hover:scale-[1.01] hover:bg-gray-100 
              border-b-4 border-gray-400
            `}
          >
            <infoAction.icon className={`w-8 h-8 mb-2 text-gray-600`} />
            <h2 className="text-xl font-semibold text-gray-800 text-left">
              {infoAction.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1 text-left">
              {infoAction.description}
            </p>
          </button>
        )}

        <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">
          Режимы тренировки
        </h3>

        {/* 2. Сетка режимов тренировки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {studyActions.map((action) => {
            // Динамические классы для цветов
            const iconColor = `text-${action.color}-600`;
            const hoverBg = `hover:bg-${action.color}-50`;

            return (
              <button
                key={action.path}
                onClick={() => navigate(`/lesson/${lessonId}/${action.path}`)}
                className={`
                  flex flex-col items-start p-5 bg-white rounded-xl shadow-md 
                  transition duration-300 ease-in-out
                  transform hover:scale-[1.01] ${hoverBg} 
                  border-b-4 border-${action.color}-400
                `}
              >
                <action.icon className={`w-8 h-8 mb-2 ${iconColor}`} />

                <h2 className="text-xl font-semibold text-gray-800 text-left">
                  {action.name}
                </h2>

                <p className="text-sm text-gray-500 mt-1 text-left">
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
