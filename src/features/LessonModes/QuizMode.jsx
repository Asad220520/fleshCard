import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { markLearned } from "../../store/store";
import { lessons } from "../../data";

export default function QuizMode() {
  const dispatch = useDispatch();
  const { list, learned } = useSelector((state) => state.words);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);

  // 🧠 оставляем только невыученные слова
  const remainingList = (list || []).filter(
    (w) => !learned.some((lw) => lw.de === w.de && lw.lessonId === w.lessonId)
  );

  const current = remainingList[index] || null;

  // 🧩 следим за индексом
  useEffect(() => {
    if (remainingList.length === 0) {
      setIndex(0);
      return;
    }
    if (index >= remainingList.length) setIndex(0);
  }, [remainingList.length, index]);

  // 🧩 формируем варианты
  useEffect(() => {
    if (!current) {
      setOptions([]);
      return;
    }

    const allWords = Object.values(lessons).flat();
    const pool = allWords.filter((w) => w.de !== current.de);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [...shuffled, current].sort(() => Math.random() - 0.5);

    setOptions(opts);
    setSelected(null);
  }, [current]);

  const learnedCount = current
    ? learned.filter((w) => w.lessonId === current.lessonId).length
    : 0;

  const advance = (delayMs = 1000) => {
    setTimeout(() => {
      setIndex((i) => (i < remainingList.length - 1 ? i + 1 : 0));
      setSelected(null);
    }, delayMs);
  };

  // 🟨 выбор варианта: проверяем, но не добавляем в выученные
  const handleSelect = (opt) => {
    setSelected(opt);

    if (opt.de === current.de) {
      // ✅ правильный — подсветим и перейдём через 1.5 сек
      advance(1000);
    }
    // ❌ неправильный — остаёмся, ждём кнопку "Далее"
  };

  // 🟩 "Знаю" — добавляем в выученные и переходим
  const handleKnow = () => {
    if (current) {
      dispatch(markLearned({ word: current }));
      advance(0);
    }
  };

  // 🟥 "Не знаю" — просто переходим дальше, без добавления
  const handleDontKnow = () => {
    advance(0);
  };

  const handleNextManual = () => {
    setIndex((i) => (i < remainingList.length - 1 ? i + 1 : 0));
    setSelected(null);
  };

  // 🧩 если все выучены
  if (remainingList.length === 0) {
    return (
      <div className="p-6 text-gray-500 text-center">
        Все слова этого урока выучены! 🎉
      </div>
    );
  }

  // 🧩 визуализация
  return (
    <div className="flex flex-col items-center">
      <div className="p-6 w-80 h-48 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-semibold mb-4">
        {current?.de}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {options.map((opt, i) => {
          let cls = "bg-sky-200";
          if (selected) {
            if (opt.de === current?.de) cls = "bg-green-500 text-white";
            else if (opt.de === selected.de) cls = "bg-red-500 text-white";
            else cls = "bg-gray-200";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={!!selected}
              className={`p-3 rounded-xl shadow ${cls}`}
            >
              {opt.ru}
            </button>
          );
        })}
      </div>

      {!selected ? (
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleKnow}
            className="px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-500"
          >
            Знаю
          </button>
          <button
            onClick={handleDontKnow}
            className="px-4 py-2 bg-red-600 text-white rounded-xl shadow hover:bg-red-500"
          >
            Не знаю
          </button>
        </div>
      ) : (
        selected.de !== current?.de && (
          <button
            onClick={handleNextManual}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl shadow hover:bg-sky-500"
          >
            Далее ➡
          </button>
        )
      )}

      <div className="mt-2 text-gray-500 text-sm">
        Вопрос {index + 1} из {remainingList.length}
      </div>

      <div className="mt-1 text-xs text-gray-400">
        Выучено: {learnedCount} слов из этого урока
      </div>
    </div>
  );
}
