import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { selectLesson } from "../store/store";
import { lessons } from "../data";
// Импорт иконок: Card, Quiz, Matching/Puzzle, Writing
import {
  HiOutlineCreditCard,
  HiOutlineAcademicCap,
  HiOutlinePuzzle,
  HiOutlinePencil,
} from "react-icons/hi";

// Определяем список действий и их параметры
const actions = [
  {
    name: "Флешкарты",
    path: "flashcards",
    icon: HiOutlineCreditCard,
    color: "sky",
    description: "Просматривайте слова и их перевод.",
  },
  {
    name: "Учить варианты",
    path: "quiz",
    icon: HiOutlineAcademicCap,
    color: "green",
    description: "Выберите правильный перевод из предложенных вариантов.",
  },
  {
    name: "Сопоставление",
    path: "matching",
    icon: HiOutlinePuzzle,
    color: "purple",
    description: "Соедините слово с его переводом.",
  },
  {
    name: "Письмо",
    path: "writing",
    icon: HiOutlinePencil,
    color: "yellow",
    description: "Напишите перевод, чтобы проверить знание орфографии.",
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
      // Можно добавить навигацию на 404 или список уроков, если урок не найден
      setLoading(false); // Устанавливаем false, чтобы показать, что загрузка завершена
      // Опционально: navigate('/lessons');
    }
  }, [lessonId, dispatch]);

  if (loading)
    return <div className="p-6 text-gray-500 text-center">Загрузка...</div>;

  // Добавляем проверку на случай, если lessonId невалиден
  if (!lessons[lessonId])
    return <div className="p-6 text-red-500 text-center">Урок не найден.</div>;

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center bg-gray-50 min-h-screen">
      {/* Заголовок урока */}
      <h1 className="text-4xl font-extrabold text-gray-800 mt-4 mb-3 text-center">
        {lessonId.toUpperCase()}
      </h1>
      <p className="text-gray-500 mb-8 text-center">Выберите тип тренировки:</p>

      {/* Сетка действий */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {actions.map((action) => {
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
  );
}
