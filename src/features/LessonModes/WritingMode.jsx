import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { markLearned } from "../../store/store";

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

export default function WritingMode() {
  const dispatch = useDispatch();
  const { list, learned } = useSelector((s) => s.words);

  const remaining = list.filter((w) => !learned.some((lw) => lw.de === w.de));

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checkState, setCheckState] = useState(null);

  const word = remaining[index];

  const handleCheck = () => {
    const correct = normalize(word.de) === normalize(input);

    if (correct) {
      dispatch(markLearned({ word }));
      setCheckState("correct");
      setTimeout(() => {
        setIndex((i) => (i < remaining.length - 1 ? i + 1 : 0));
        setInput("");
        setCheckState(null);
      }, 1200);
    } else {
      setCheckState("wrong");
    }
  };

  if (!word) return <div>Все слова выучены!</div>;

  return (
    <div className="flex flex-col items-center mt-4 gap-4">
      <div className="text-2xl mb-2">{word.ru}</div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border rounded-xl p-3 w-64 text-xl"
        placeholder="Введите слово..."
      />

      {checkState === "wrong" && (
        <div className="text-red-600">
          Ошибка! Правильно: <b>{word.de}</b>
        </div>
      )}

      {checkState === "correct" && (
        <div className="text-green-600">✔ Верно!</div>
      )}

      <button
        onClick={handleCheck}
        className="px-4 py-2 bg-sky-600 text-white rounded-xl"
      >
        Проверить
      </button>
    </div>
  );
}
