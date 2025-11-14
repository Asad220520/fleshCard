import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { markLearned, selectLesson } from "../../store/store";
import { lessons } from "../../data";
// Импорт иконок
import { HiCheck, HiX, HiArrowRight } from "react-icons/hi";

export default function QuizMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const { list, learned } = useSelector((state) => state.words);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);

  // Загружаем урок, если нет списка
  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  // Список невыученных слов
  const remainingList =
    list?.filter(
      (w) => !learned.some((lw) => lw.de === w.de && lw.lessonId === w.lessonId)
    ) || [];

  const current = remainingList[index] || null;

  // Сбрасываем индекс, если вышли за границы
  useEffect(() => {
    if (index >= remainingList.length && remainingList.length > 0) {
      setIndex(0);
    }
  }, [remainingList.length, index]);

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
        setIndex((i) => (i + 1 < remainingList.length ? i + 1 : 0));
        setSelected(null);
      }, delay);
    },
    [remainingList.length]
  );

  const handleSelect = (opt) => {
    setSelected(opt);
    // Если ответ верный, переходим к следующему слову с задержкой, чтобы пользователь увидел зеленый цвет.
    if (opt.de === current.de) advance(1000);
  };

  const handleKnow = () => {
    if (current) {
      dispatch(markLearned({ word: current }));
      // Если слово выучено, переходим к следующему без задержки
      // (remainingList.length изменится, нужно обновить index)
      setTimeout(() => {
        if (remainingList.length > 1) {
          setIndex((i) => (i < remainingList.length - 1 ? i : 0));
        } else {
          setIndex(0);
        }
      }, 50);
    }
  };

  const handleDontKnow = () => advance(0); // Переход к следующему без задержки

  if (remainingList.length === 0)
    return (
      <div className="p-12 text-green-600 text-center text-xl font-semibold bg-white rounded-xl shadow-lg m-6">
        <span role="img" aria-label="party popper" className="text-3xl">
          🎉
        </span>{" "}
        Отлично! Все слова этого урока выучены в режиме викторины.
      </div>
    );

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Прогресс */}
      <div className="w-full max-w-lg mb-6 text-center">
        <div className="text-sm font-medium text-gray-600 mb-2">
          Вопрос {index + 1} из {remainingList.length}
        </div>
        {/* Индикатор прогресса */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / remainingList.length) * 100}%` }}
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
            "bg-white border-2 border-gray-200 hover:bg-sky-50 transition duration-150";

          if (selected) {
            if (opt.de === current?.de) {
              // Правильный ответ
              cls =
                "bg-green-500 text-white border-green-700 shadow-lg scale-[1.02]";
            } else if (opt.de === selected.de) {
              // Неправильный ответ, который был выбран
              cls =
                "bg-red-500 text-white border-red-700 shadow-lg scale-[1.02]";
            } else {
              // Невыбранный неправильный ответ
              cls = "bg-gray-200 text-gray-500 border-gray-300";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
              className={`p-4 rounded-xl shadow-md text-lg font-semibold text-gray-800 text-left ${cls} disabled:opacity-100 disabled:cursor-not-allowed`}
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
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl shadow-md font-bold hover:bg-green-600 transition duration-150"
            >
              <div className="flex items-center justify-center">
                <HiCheck className="w-5 h-5 mr-2" />Я знаю это слово
              </div>
            </button>
            {/* Не знаю (пропустить и повторить позже) */}
            <button
              onClick={handleDontKnow}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl shadow-md font-bold hover:bg-red-600 transition duration-150"
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
            className="w-full px-6 py-3 bg-sky-600 text-white rounded-xl shadow-md font-bold hover:bg-sky-700 transition duration-150"
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
