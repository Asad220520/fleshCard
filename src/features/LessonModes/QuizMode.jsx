import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { markLearned, selectLesson } from "../../store/store";
import { lessons } from "../../data";
// Импорт иконок
import { HiCheck, HiX, HiArrowRight, HiArrowLeft } from "react-icons/hi";
import LessonComplete from "../../components/LessonComplete";

// КОНСТАНТА: Максимальное количество слов в одной учебной сессии
const MAX_SESSION_SIZE = 15;

export default function QuizMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // 💡 ИСПОЛЬЗУЕМ learnedQuiz
  const { list, learnedQuiz } = useSelector((state) => state.words);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);
  const [sessionList, setSessionList] = useState([]);

  // Загружаем урок, если нет списка
  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  // Список всех невыученных слов (весь пул)
  const allRemainingList =
    list?.filter(
      // 💡 ФИЛЬТРУЕМ ПО learnedQuiz
      (w) =>
        !learnedQuiz.some((lw) => lw.de === w.de && lw.lessonId === w.lessonId)
    ) || [];

  const totalRemaining = allRemainingList.length;

  // 1. Инициализация sessionList (батча) при загрузке
  useEffect(() => {
    if (allRemainingList.length > 0 && sessionList.length === 0) {
      // Берем батч из первых MAX_SESSION_SIZE невыученных слов
      const initialBatch = allRemainingList.slice(0, MAX_SESSION_SIZE);
      setSessionList(initialBatch);
    }
  }, [allRemainingList, sessionList.length]);

  const current = sessionList[index] || null;

  // Генерируем варианты
  useEffect(() => {
    if (!current) {
      setOptions([]);
      return;
    }

    // Получаем все слова из всех уроков
    const allWords = Object.values(lessons).flat();
    // Фильтруем пул слов, исключая текущее слово
    const pool = allWords.filter((w) => w.de !== current.de);

    // Выбираем 3 случайных неправильных варианта
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);

    // Добавляем правильный вариант и перемешиваем
    const opts = [...shuffled, current].sort(() => Math.random() - 0.5);
    setOptions(opts);
    setSelected(null);
  }, [current]);

  const advance = useCallback(
    (delay = 500) => {
      setTimeout(() => {
        // Переход к следующему индексу в рамках sessionList
        setIndex((i) =>
          i + 1 < sessionList.length ? i + 1 : sessionList.length
        );
        setSelected(null);
      }, delay);
    },
    [sessionList.length]
  );

  const handleSelect = (opt) => {
    setSelected(opt);
    // Если ответ верный, помечаем его как выученный (в Redux) и переходим
    if (opt.de === current.de) {
      // 💡 ДИСПАТЧ С mode: 'quiz'
      dispatch(markLearned({ word: current, mode: "quiz" }));
      advance(1000); // С задержкой, чтобы увидеть зеленый
    }
  };

  const handleKnow = () => {
    if (current) {
      // 💡 ДИСПАТЧ С mode: 'quiz'
      dispatch(markLearned({ word: current, mode: "quiz" }));
      // Переходим к следующему слову немедленно
      advance(0);
    }
  };

  const handleDontKnow = () => advance(0); // Пропустить и повторить позже

  const handleGoBack = () => {
    navigate(`/lesson/${lessonId}`);
  };

  // 1. Если все слова в уроке выучены
  if (totalRemaining === 0)
    return <LessonComplete lessonId={lessonId} onGoBack={handleGoBack} />;

  // 2. Если батч еще не загружен
  if (sessionList.length === 0) return null;

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* Кнопка Назад */}
      <div className="w-full max-w-lg mb-4 self-center">
        <button
          onClick={handleGoBack}
          className="flex items-center text-sky-700 hover:text-sky-800 transition font-semibold dark:text-sky-400 dark:hover:text-sky-300"
        >
          <HiArrowLeft className="w-6 h-6 mr-1" />
          <span className="hidden sm:inline">
            К уроку {lessonId.toUpperCase()}
          </span>
        </button>
      </div>

      {/* Прогресс */}
      <div className="w-full max-w-lg mb-6 text-center">
        <div className="text-sm font-medium text-gray-600 mb-2 dark:text-gray-400">
          Вопрос {index + 1} из {sessionList.length} (Батч)
          <span className="block text-xs text-gray-400 mt-1 dark:text-gray-500">
            Осталось всего невыученных: {totalRemaining}
          </span>
        </div>
        {/* Индикатор прогресса */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / sessionList.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Карточка с вопросом */}
      <div className="w-full max-w-lg mb-8">
        <div className="p-8 bg-sky-600 text-white rounded-2xl shadow-xl flex items-center justify-center min-h-[150px]">
          <span className="text-4xl font-bold tracking-wide">
            {current?.de.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Варианты Ответов (Сетка) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {options.map((opt, i) => {
          let cls =
            "bg-white border-2 border-gray-200 hover:bg-sky-50 transition duration-150 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 dark:hover:bg-gray-700";

          if (selected) {
            if (opt.de === current?.de) {
              // Правильный ответ
              cls =
                "bg-green-500 text-white border-green-700 shadow-lg scale-[1.02] dark:bg-green-600 dark:border-green-800";
            } else if (opt.de === selected.de) {
              // Неправильный ответ, который был выбран
              cls =
                "bg-red-500 text-white border-red-700 shadow-lg scale-[1.02] dark:bg-red-600 dark:border-red-800";
            } else {
              // Невыбранный неправильный ответ
              cls =
                "bg-gray-200 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
              className={`p-4 rounded-xl shadow-md text-lg font-semibold text-gray-800 dark:text-gray-50 text-left ${cls} disabled:opacity-100 disabled:cursor-not-allowed`}
            >
              {opt.ru}
            </button>
          );
        })}
      </div>

      {/* Кнопки Навигации при неправильном ответе или до выбора */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-lg">
        {!selected && (
          <>
            {/* Знаю (пропустить и отметить как выученное) */}
            <button
              onClick={handleKnow}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl shadow-md font-bold hover:bg-green-600 transition duration-150 dark:bg-green-600 dark:hover:bg-green-700"
            >
              <div className="flex items-center justify-center">
                <HiCheck className="w-5 h-5 mr-2" />Я знаю это слово
              </div>
            </button>
            {/* Не знаю (пропустить и повторить позже) */}
            <button
              onClick={handleDontKnow}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl shadow-md font-bold hover:bg-red-600 transition duration-150 dark:bg-red-600 dark:hover:bg-red-700"
            >
              <div className="flex items-center justify-center">
                <HiX className="w-5 h-5 mr-2" />
                Пропустить
              </div>
            </button>
          </>
        )}

        {/* Кнопка "Далее" после неправильного ответа */}
        {selected && selected.de !== current?.de && (
          <button
            onClick={() => advance(0)}
            className="w-full px-6 py-3 bg-sky-600 text-white rounded-xl shadow-md font-bold hover:bg-sky-700 transition duration-150 dark:bg-sky-700 dark:hover:bg-sky-800"
          >
            <div className="flex items-center justify-center">
              Далее
              <HiArrowRight className="w-5 h-5 ml-2" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}