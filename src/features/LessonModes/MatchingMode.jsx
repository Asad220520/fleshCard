import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const CHUNK_SIZE = 5; // показываем по 5 слов

export default function MatchingMode() {
  const { list } = useSelector((state) => state.words);

  const [round, setRound] = useState(0); // номер раунда (0,1,2...)
  const [chunk, setChunk] = useState([]); // текущие 5 слов

  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matched, setMatched] = useState([]);

  // разделяем слова на группы по 5
  const chunks = [];
  for (let i = 0; i < list.length; i += CHUNK_SIZE) {
    chunks.push(list.slice(i, i + CHUNK_SIZE));
  }

  // Загружаем текущий раунд
  useEffect(() => {
    if (chunks.length === 0) return;

    const current = chunks[round] || [];
    setChunk(current);

    // создаём 2 стороны
    const shuffledLeft = [...current].sort(() => Math.random() - 0.5);
    const shuffledRight = [...current].sort(() => Math.random() - 0.5);

    setLeft(shuffledLeft);
    setRight(shuffledRight);

    setMatched([]);
    setSelectedLeft(null);
  }, [round, list]);

  const handleLeftSelect = (word) => setSelectedLeft(word.de);

  const handleRightSelect = (word) => {
    if (!selectedLeft) return;

    if (word.de === selectedLeft) {
      setMatched((m) => [...m, word.de]);
    }

    setSelectedLeft(null);
  };

  // Когда все 5 (или меньше) слов совпали → следующий раунд
  useEffect(() => {
    if (chunk.length > 0 && matched.length === chunk.length) {
      setTimeout(() => {
        setRound((r) => r + 1);
      }, 800);
    }
  }, [matched, chunk]);

  // Все группы пройдены
  if (round >= chunks.length) {
    return (
      <div className="text-center p-6 text-green-600 text-xl font-semibold">
        🎉 Все пары пройдены!
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl flex gap-6 mt-4">
      {/* Немецкие слова */}
      <div className="flex-1 flex flex-col gap-3">
        {left.map((w) => {
          const isMatched = matched.includes(w.de);
          return (
            <button
              key={w.de}
              disabled={isMatched}
              onClick={() => handleLeftSelect(w)}
              className={`p-3 rounded-xl shadow ${
                isMatched
                  ? "bg-green-400"
                  : selectedLeft === w.de
                  ? "bg-sky-400"
                  : "bg-sky-200"
              }`}
            >
              {w.de}
            </button>
          );
        })}
      </div>

      {/* Русские слова */}
      <div className="flex-1 flex flex-col gap-3">
        {right.map((w) => {
          const isMatched = matched.includes(w.de);
          return (
            <button
              key={w.de}
              disabled={isMatched}
              onClick={() => handleRightSelect(w)}
              className={`p-3 rounded-xl shadow ${
                isMatched ? "bg-green-400" : "bg-sky-200"
              }`}
            >
              {w.ru}
            </button>
          );
        })}
      </div>
    </div>
  );
}
