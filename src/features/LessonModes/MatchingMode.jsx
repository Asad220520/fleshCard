import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { selectLesson, markLearned } from "../../store/store"; // Добавил markLearned, чтобы отметить урок как выученный при завершении
import { lessons } from "../../data";

// Иконки для обратной связи
import { HiCheckCircle, HiChevronRight } from "react-icons/hi";

const CHUNK_SIZE = 5;

export default function MatchingMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const { list, learned } = useSelector((state) => state.words);

  const [round, setRound] = useState(0);
  const [chunk, setChunk] = useState([]);
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null); // Хранит { de: 'Wort', ru: 'Слово' }
  const [matched, setMatched] = useState([]); // Хранит список de-слов, которые совпали
  const [incorrectRight, setIncorrectRight] = useState(null); // Для подсветки неправильного выбора

  // --- Эффекты загрузки и подготовки данных ---

  // 1. Загружаем урок, если списка нет
  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

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

  // 2. Загружаем текущий раунд
  useEffect(() => {
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
  }, [round, list, learned, remainingList.length]); // Зависимость от remainingList.length важна для обновления при завершении раунда

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
      setSelectedLeft(null); // Снимаем выбор
      setIncorrectRight(null);
    } else {
      // Неверное совпадение
      setIncorrectRight(word.de);
      // Оставляем selectedLeft активным для следующей попытки
      setTimeout(() => setIncorrectRight(null), 700);
    }
  };

  // --- Переход к следующему раунду ---

  useEffect(() => {
    if (chunk.length > 0 && matched.length === chunk.length) {
      // При завершении раунда, если это был последний, помечаем слова как выученные
      if (round === chunks.length - 1) {
        chunk.forEach((word) => dispatch(markLearned({ word })));
      }

      setTimeout(() => {
        setRound((r) => r + 1);
      }, 800);
    }
  }, [matched, chunk, round, chunks.length, dispatch]);

  // --- UI Рендеринг ---

  // Сообщение о завершении
  if (round >= chunks.length && remainingList.length === 0) {
    return (
      <div className="flex flex-col items-center p-8 bg-gray-50 min-h-[50vh]">
        <div className="text-center p-8 text-green-700 bg-white rounded-xl shadow-lg border-2 border-green-400 m-6 max-w-sm">
          <HiCheckCircle className="w-10 h-10 mx-auto mb-3 text-green-500" />
          <h2 className="text-2xl font-bold">Урок завершен!</h2>
          <p className="mt-2 text-gray-600">
            Все слова были успешно сопоставлены. Отличная работа! 🎉
          </p>
        </div>
      </div>
    );
  }

  // Сообщение о загрузке или пустом списке
  if (chunks.length === 0 && list && list.length > 0) {
    return (
      <div className="p-6 text-gray-500 text-center">
        Все слова уже выучены.
      </div>
    );
  }

  if (chunks.length === 0) {
    return (
      <div className="p-6 text-gray-500 text-center">Загрузка урока...</div>
    );
  }

  // Основной интерфейс
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Прогресс */}
      <div className="w-full max-w-lg mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          Раунд {round + 1} из {chunks.length}
        </h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((round + 1) / chunks.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Контейнер для колонок */}
      <div className="w-full max-w-lg flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
        {/* Колонка 1: Немецкие слова */}
        <div className="flex-1 flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Слово</h3>
          {left.map((w) => {
            const isMatched = matched.includes(w.de);
            const isSelected = selectedLeft?.de === w.de;

            let cls = "bg-white border-b-2 border-sky-100 hover:bg-sky-50";
            if (isMatched) {
              cls =
                "bg-green-100 text-green-700 border-green-400 pointer-events-none";
            } else if (isSelected) {
              cls =
                "bg-sky-500 text-white border-sky-700 shadow-md scale-[1.01]";
            }

            return (
              <button
                key={w.de + "left"} // Уникальный ключ
                disabled={isMatched}
                onClick={() => handleLeftSelect(w)}
                className={`p-4 rounded-xl shadow-md text-lg font-medium text-left transition duration-150 transform ${cls}`}
              >
                {w.de}
              </button>
            );
          })}
        </div>

        {/* Разделитель */}
        <div className="hidden sm:flex items-center justify-center">
          <HiChevronRight className="w-8 h-8 text-gray-400" />
        </div>

        {/* Колонка 2: Русские слова */}
        <div className="flex-1 flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Перевод</h3>
          {right.map((w) => {
            const isMatched = matched.includes(w.de);
            const isIncorrect = incorrectRight === w.de;

            let cls = "bg-white border-b-2 border-sky-100 hover:bg-sky-50";
            if (isMatched) {
              cls =
                "bg-green-100 text-green-700 border-green-400 pointer-events-none";
            } else if (isIncorrect) {
              cls = "bg-red-200 text-red-700 border-red-500 shake-animation"; // Класс для анимации
            } else if (selectedLeft) {
              // Если слева что-то выбрано, подсвечиваем русские слова
              cls = "bg-white border-b-2 border-sky-300 hover:bg-sky-100";
            }

            return (
              <button
                key={w.de + "right"} // Уникальный ключ
                disabled={isMatched || !selectedLeft} // Деактивируем, если не выбрано слева
                onClick={() => handleRightSelect(w)}
                className={`p-4 rounded-xl shadow-md text-lg font-medium text-left transition duration-150 ${cls}`}
              >
                {w.ru}
              </button>
            );
          })}
        </div>
      </div>

      {/* Добавляем стили для анимации (так как мы не можем использовать чистый CSS, эмулируем "тряску" через классы) */}
      <style>{`
        /* Эмуляция анимации "тряски" для неверного ответа */
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
