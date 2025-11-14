import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { markLearned, selectLesson } from "../../store/store";
import { lessons } from "../../data";
// Импорт иконок
import { HiCheckCircle, HiXCircle, HiLightBulb } from "react-icons/hi";

// Функция нормализации (оставлена без изменений)
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .trim(); // Добавим trim для чистоты
}

export default function WritingMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const { list, learned } = useSelector((s) => s.words);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checkState, setCheckState] = useState(null); // 'correct', 'wrong'
  const [showHint, setShowHint] = useState(false); // Для показа правильного ответа

  // Загружаем урок
  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  // Список оставшихся слов
  const remaining =
    list?.filter(
      (w) => !learned.some((lw) => lw.de === w.de && lw.lessonId === w.lessonId)
    ) || [];

  // Если индекс больше, чем оставшихся слов → сброс
  useEffect(() => {
    if (index >= remaining.length && remaining.length > 0) {
      setIndex(0);
    }
  }, [remaining.length, index]);

  const word = remaining[index];

  const handleCheck = () => {
    if (!word || input.trim() === "") return;

    const correct = normalize(word.de) === normalize(input);

    if (correct) {
      dispatch(markLearned({ word }));
      setCheckState("correct");
      setTimeout(() => {
        // Переход к следующему слову
        setIndex((i) => (i < remaining.length - 1 ? i + 1 : 0));
        setInput("");
        setCheckState(null);
        setShowHint(false);
      }, 1200);
    } else {
      setCheckState("wrong");
      setTimeout(() => setCheckState(null), 1000); // Сброс состояния через 1с
    }
  };

  const handleNext = () => {
    // Кнопка "Далее" появляется только после ошибки
    setCheckState(null);
    setShowHint(false);
    setIndex((i) => (i + 1 < remaining.length ? i + 1 : 0));
    setInput("");
  };

  const handleShowHint = () => {
    setShowHint(true);
    setCheckState("wrong");
    setTimeout(() => setCheckState(null), 1000);
  };

  // Обработка нажатия Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  if (!word)
    return (
      <div className="p-12 text-green-600 text-center text-xl font-semibold bg-white rounded-xl shadow-lg m-6">
        <span role="img" aria-label="party popper" className="text-3xl">
          🎉
        </span>{" "}
        Отлично! Все слова этого урока выучены в режиме письма.
      </div>
    );

  // Классы для поля ввода на основе состояния
  let inputClass =
    "border-2 border-gray-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
  if (checkState === "correct") {
    inputClass = "border-2 border-green-500 bg-green-50";
  } else if (checkState === "wrong") {
    inputClass = "border-2 border-red-500 bg-red-50 shake-animation";
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Прогресс */}
      <div className="w-full max-w-lg mb-8 text-center">
        <div className="text-sm font-medium text-gray-600 mb-2">
          Слово {index + 1} из {remaining.length}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / remaining.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Слово для перевода */}
      <div className="p-8 bg-white rounded-2xl shadow-lg mb-8 w-full max-w-md text-center">
        <p className="text-gray-500 text-lg mb-2">Переведите слово:</p>
        <div className="text-4xl font-bold text-gray-800">{word.ru}</div>
      </div>

      {/* Поле ввода */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`rounded-xl p-4 w-full max-w-md text-xl text-center transition-colors duration-200 ${inputClass}`}
        placeholder="Введите немецкое слово..."
        autoFocus
        disabled={checkState === "correct"} // Деактивируем после верного ответа
      />

      {/* Обратная связь */}
      <div className="h-10 w-full max-w-md text-center mt-3">
        {checkState === "wrong" && !showHint && (
          <div className="text-red-600 font-semibold flex items-center justify-center">
            <HiXCircle className="w-5 h-5 mr-1" /> Попробуйте снова.
          </div>
        )}
        {checkState === "correct" && (
          <div className="text-green-600 font-bold text-xl flex items-center justify-center">
            <HiCheckCircle className="w-6 h-6 mr-1" /> Верно!
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-4 mt-6 w-full max-w-md">
        {/* Кнопка "Подсказка" / "Показать ответ" */}
        <button
          onClick={handleShowHint}
          disabled={checkState === "correct"}
          className="flex-1 px-4 py-3 bg-yellow-400 text-yellow-900 rounded-xl font-semibold hover:bg-yellow-500 transition duration-150 disabled:opacity-70"
        >
          <div className="flex items-center justify-center">
            <HiLightBulb className="w-5 h-5 mr-2" />
            {showHint ? "Скрыть ответ" : "Показать ответ"}
          </div>
        </button>

        {/* Основная кнопка */}
        <button
          onClick={
            checkState === "wrong" && showHint ? handleNext : handleCheck
          }
          disabled={input.trim() === "" && checkState !== "wrong"}
          className={`flex-1 px-4 py-3 rounded-xl font-bold transition duration-150 ${
            checkState === "wrong" || showHint
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-sky-600 text-white hover:bg-sky-700"
          }`}
        >
          {checkState === "wrong" || showHint ? "Далее" : "Проверить"}
        </button>
      </div>

      {/* Показ правильного ответа после ошибки или по запросу */}
      {showHint && word && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-xl mt-4 w-full max-w-md text-center">
          <span className="text-sm text-red-700">Правильный ответ:</span>
          <p className="text-xl font-bold text-red-800">{word.de}</p>
        </div>
      )}

      {/* Добавляем стили для анимации */}
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
