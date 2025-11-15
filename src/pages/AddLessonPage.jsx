import { useState } from "react";
import { loadLessons, saveLessons } from "../data/lessons-storage";
import { useNavigate } from "react-router-dom";

export default function AddLessonPage() {
  const navigate = useNavigate();

  const [lessonId, setLessonId] = useState("");
  const [rawText, setRawText] = useState("");
  const [cards, setCards] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -----------------------------
  // Парсер списка слов
  // -----------------------------
  const parseInput = () => {
    setError("");
    setSuccess("");

    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (!lessonId.trim()) {
      setError("Введите ID урока, например: les7");
      return;
    }

    if (lines.length === 0) {
      setError("Введите хотя бы одно слово.");
      return;
    }

    const parsed = [];

    for (const line of lines) {
      const parts = line.split(/[-—:]+/); // разделители: -, —, :
      if (parts.length < 2) {
        setError(`Не могу распарсить строку: "${line}"`);
        return;
      }

      const de = parts[0].trim();
      const ru = parts[1].trim();

      parsed.push({
        de,
        ru,
        exde: "", // пустой пример DE
        exru: "", // пустой пример RU
        distractors: [], // пустые дистракторы
      });
    }

    setCards(parsed);
  };

  // -----------------------------
  // Сохранение урока
  // -----------------------------
  const saveLesson = () => {
    setError("");
    setSuccess("");

    if (cards.length === 0) {
      setError("Нет карточек для сохранения.");
      return;
    }

    const lessons = loadLessons();
    lessons[lessonId] = cards;

    saveLessons(lessons);

    setSuccess(`Урок "${lessonId}" успешно сохранён!`);

    setTimeout(() => {
      navigate(`/lesson/${lessonId}`);
    }, 800);
  };

  // -----------------------------
  // Обновление примера карточки
  // -----------------------------
  const updateCard = (index, field, value) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6">
        Создать урок с примерами
      </h1>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
        {/* ID урока */}
        <label className="block mb-2 font-semibold text-gray-800 dark:text-gray-200">
          ID урока (например: les7)
        </label>
        <input
          type="text"
          className="w-full p-2 mb-4 rounded bg-gray-100 dark:bg-gray-700 outline-none"
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
        />

        {/* Ввод списка слов */}
        <label className="block mb-2 font-semibold text-gray-800 dark:text-gray-200">
          Вставьте слова (немецкое — русский):
        </label>

        <textarea
          rows={8}
          className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 font-mono outline-none"
          placeholder={`der Hund — собака\ndie Schule — школа\ndas Brot — хлеб`}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />

        <button
          onClick={parseInput}
          className="mt-4 w-full p-3 bg-sky-600 hover:bg-sky-700 rounded-lg text-white"
        >
          Распарсить список
        </button>

        {error && (
          <div className="mt-4 bg-red-200 text-red-900 p-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-200 text-green-900 p-3 rounded">
            {success}
          </div>
        )}

        {/* Список карточек с полями примеров */}
        {cards.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-bold mb-3">Карточки</h2>

            {cards.map((card, i) => (
              <div
                key={i}
                className="p-3 rounded bg-gray-100 dark:bg-gray-700 space-y-2"
              >
                <div className="font-semibold">
                  {card.de} — {card.ru}
                </div>

                <input
                  type="text"
                  placeholder="Пример DE"
                  value={card.exde}
                  onChange={(e) => updateCard(i, "exde", e.target.value)}
                  className="w-full p-2 rounded bg-gray-200 dark:bg-gray-600 outline-none"
                />

                <input
                  type="text"
                  placeholder="Пример RU"
                  value={card.exru}
                  onChange={(e) => updateCard(i, "exru", e.target.value)}
                  className="w-full p-2 rounded bg-gray-200 dark:bg-gray-600 outline-none"
                />
              </div>
            ))}

            <button
              onClick={saveLesson}
              className="mt-6 w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white"
            >
              Сохранить урок
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
