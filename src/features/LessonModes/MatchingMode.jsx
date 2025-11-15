import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { selectLesson, markLearned } from "../../store/store";
import { lessons } from "../../data";

// Иконки для обратной связи
import { HiCheckCircle, HiChevronRight, HiArrowLeft } from "react-icons/hi";
import LessonComplete from "../../components/LessonComplete";

// КОНСТАНТА: Максимальное количество слов в одном раунде
const CHUNK_SIZE = 5;

export default function MatchingMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, learned } = useSelector((state) => state.words);

  const [round, setRound] = useState(0);
  const [chunk, setChunk] = useState([]); // Слова в текущем раунде
  const [left, setLeft] = useState([]); // Немецкие слова
  const [right, setRight] = useState([]); // Русские слова
  const [selectedLeft, setSelectedLeft] = useState(null); // Выбранное слово слева
  const [matched, setMatched] = useState([]); // Совпавшие слова (по w.de)
  const [incorrectRight, setIncorrectRight] = useState(null); // Неверный выбор справа

  // --- Расчет пула слов ---

  // Список оставшихся слов (невыученных)
  const remainingList =
    list?.filter(
      (w) => !learned.some((lw) => lw.de === w.de && lw.lessonId === w.lessonId)
    ) || [];

  // Разделяем на чанки
  const chunks = [];
  for (let i = 0; i < remainingList.length; i += CHUNK_SIZE) {
    chunks.push(remainingList.slice(i, i + CHUNK_SIZE));
  }

  // Выученные слова в этом уроке (для общего прогресса)
  const totalWordsInLesson = list.filter((w) => w.lessonId === lessonId).length;
  const totalCompleted = totalWordsInLesson - remainingList.length;

  // --- Эффекты загрузки и подготовки данных ---

  // 1. Загружаем урок, если списка нет
  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  // 2. Загружаем текущий раунд
  useEffect(() => {
    // Условие выхода, если все раунды завершены или нет слов
    if (chunks.length === 0 || round >= chunks.length) return;

    const current = chunks[round] || [];
    setChunk(current);

    // Создаем копии для перемешивания
    const shuffledLeft = [...current].sort(() => Math.random() - 0.5);
    const shuffledRight = [...current].sort(() => Math.random() - 0.5);

    setLeft(shuffledLeft);
    setRight(shuffledRight);

    setMatched([]);
    setSelectedLeft(null);
    setIncorrectRight(null);
  }, [round, list, learned]); // Зависимости обновят раунд при переходе или новом уроке

  // --- Обработчики кликов ---

  const handleLeftSelect = (word) => {
    // Если уже выбрано и кликнули по тому же, снимаем выбор
    if (selectedLeft?.de === word.de) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(word);
      setIncorrectRight(null); // Сбрасываем неверный выбор при новом выборе
    }
  };

  const handleRightSelect = (word) => {
    if (!selectedLeft) return; // Ничего не выбрано слева

    if (word.de === selectedLeft.de) {
      // Верное совпадение
      setMatched((m) => [...m, word.de]);
      setIncorrectRight(null);

      // ❌ ИЗМЕНЕНИЕ: Удалили markLearned отсюда, чтобы не прерывать раунд

      // Снимаем выбор ПОСЛЕ диспатча и совпадения, чтобы избежать "прыжка"
      setSelectedLeft(null);
    } else {
      // Неверное совпадение
      setIncorrectRight(word.de);
      // Оставляем selectedLeft активным для следующей попытки
      setTimeout(() => setIncorrectRight(null), 700);
    }
  };

  const handleGoBack = () => navigate(`/lesson/${lessonId}`);

  // --- Переход к следующему раунду (КЛЮЧЕВОЕ ИЗМЕНЕНИЕ) ---

  useEffect(() => {
    // Проверяем, совпали ли все слова в текущем чанке
    if (chunk.length > 0 && matched.length === chunk.length) {
      // ✅ ИЗМЕНЕНИЕ: Помечаем слова как выученные только после завершения раунда
      chunk.forEach((word) => {
        // Помечаем как выученные ТОЛЬКО слова из текущего чанка
        dispatch(markLearned({ word: word }));
      });

      // Переход к следующему раунду с задержкой (800мс)
      setTimeout(() => {
        setRound((r) => r + 1);
      }, 800);
    }
  }, [matched, chunk, dispatch]); // Теперь обновление Redux происходит после завершения раунда

  // --- UI Рендеринг ---

  // Сообщение о завершении урока
  if (totalCompleted === totalWordsInLesson && totalWordsInLesson > 0) {
    return <LessonComplete lessonId={lessonId} onGoBack={handleGoBack} />;
  }

  // Сообщение о загрузке или пустом списке
  if (totalWordsInLesson === 0) {
    return (
      <div className="p-6 text-gray-500 text-center dark:bg-gray-900 dark:text-gray-400 min-h-screen">
        Загрузка урока...
      </div>
    );
  }

  // Если раунды есть, но текущий раунд не загружен (происходит между раундами)
  if (!chunk.length && chunks.length > 0) return null;

  // Основной интерфейс
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* Заголовок и Навигация */}
      <div className="w-full max-w-lg mb-6 flex justify-between items-center">
        <button
          onClick={handleGoBack}
          className="flex items-center text-sky-700 hover:text-sky-800 transition font-semibold dark:text-sky-400 dark:hover:text-sky-300"
        >
          <HiArrowLeft className="w-6 h-6 mr-1" />
          <span className="hidden sm:inline">К уроку</span>
        </button>
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-50">
          Сопоставление: {lessonId.toUpperCase()}
        </h1>
        <div className="w-12"></div> {/* Для выравнивания */}
      </div>

      {/* Прогресс */}
      <div className="w-full max-w-lg mb-8 bg-white p-4 rounded-xl shadow-md border border-gray-100 dark:bg-gray-800 dark:shadow-xl dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">
          Прогресс: Раунд {round + 1} из {chunks.length}
        </h2>

        {/* Индикатор прогресса раунда */}
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(matched.length / chunk.length) * 100}%` }}
            title={`Совпало ${matched.length} из ${chunk.length} в раунде`}
          ></div>
        </div>

        {/* Общий прогресс урока */}
        <div className="mt-3 text-xs text-gray-500 flex justify-between dark:text-gray-400">
          <span>
            Выучено: {totalCompleted} из {totalWordsInLesson}
          </span>
          <span>Осталось в пуле: {remainingList.length}</span>
        </div>
      </div>

      {/* Контейнер для колонок */}
      <div className="w-full max-w-lg flex gap-4 sm:gap-8 mt-4">
        {/* Колонка 1: Немецкие слова (Левая) */}
        <div className="flex-1 flex flex-col gap-3 p-3 bg-white rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:shadow-xl dark:border-gray-700">
          <h3 className="text-lg font-bold text-purple-600 mb-2 dark:text-purple-400">
            Немецкий (Wort)
          </h3>
          {left.map((w) => {
            const isMatched = matched.includes(w.de);
            const isSelected = selectedLeft?.de === w.de;

            let cls =
              "bg-purple-50 border-2 border-purple-100 hover:bg-purple-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-50";
            if (isMatched) {
              // Совпавший элемент
              cls =
                "bg-green-100 text-green-700 border-green-400 pointer-events-none opacity-60 dark:bg-green-900 dark:text-green-300 dark:border-green-600";
            } else if (isSelected) {
              // Выбранный элемент
              cls =
                "bg-purple-500 text-white border-purple-700 shadow-xl scale-[1.02]";
            }

            return (
              <button
                key={w.de + "left"}
                disabled={isMatched}
                onClick={() => handleLeftSelect(w)}
                className={`p-3 rounded-lg text-lg font-medium text-center transition duration-150 transform ${cls}`}
              >
                {w.de}
              </button>
            );
          })}
        </div>

        {/* Разделитель */}
        <div className="hidden sm:flex items-center justify-center">
          <HiChevronRight className="w-10 h-10 text-purple-400" />
        </div>

        {/* Колонка 2: Русские слова (Правая) */}
        <div className="flex-1 flex flex-col gap-3 p-3 bg-white rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:shadow-xl dark:border-gray-700">
          <h3 className="text-lg font-bold text-sky-600 mb-2 dark:text-sky-400">
            Русский (Перевод)
          </h3>
          {right.map((w) => {
            const isMatched = matched.includes(w.de);
            const isIncorrect = incorrectRight === w.de;

            let cls =
              "bg-sky-50 border-2 border-sky-100 hover:bg-sky-100 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-50";
            if (isMatched) {
              // Совпавший элемент
              cls =
                "bg-green-100 text-green-700 border-green-400 pointer-events-none opacity-60 dark:bg-green-900 dark:text-green-300 dark:border-green-600";
            } else if (isIncorrect) {
              // Неверный элемент
              cls =
                "bg-red-200 text-red-700 border-red-500 shake-animation dark:bg-red-800 dark:text-red-300 dark:border-red-600";
            } else if (selectedLeft) {
              // Подсветка доступных вариантов, если что-то выбрано слева
              cls =
                "bg-sky-50 border-2 border-sky-300 hover:bg-sky-100 shadow-sm dark:bg-gray-700 dark:border-sky-500 dark:hover:bg-gray-600 dark:text-gray-50";
            }

            return (
              <button
                key={w.de + "right"}
                disabled={isMatched || !selectedLeft}
                onClick={() => handleRightSelect(w)}
                className={`p-3 rounded-lg text-lg font-medium text-center transition duration-150 ${cls}`}
              >
                {w.ru}
              </button>
            );
          })}
        </div>
      </div>

      {/* Стили для анимации */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .shake-animation {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
