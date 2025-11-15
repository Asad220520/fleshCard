import { useState } from "react";
import { loadLessons, saveLessons } from "../data/lessons-storage";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineUpload,
  HiOutlineDownload,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

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

    // Проверка на уже существующий ID урока
    const lessons = loadLessons();
    if (lessons[lessonId]) {
      if (
        !window.confirm(
          `Урок с ID "${lessonId}" уже существует. Вы хотите перезаписать его?`
        )
      ) {
        setError(`Урок "${lessonId}" уже существует. Измените ID.`);
        return;
      }
    }

    const parsed = [];

    for (const line of lines) {
      // Использование регулярного выражения для более гибкого разделения
      const parts = line.split(/[-—:;]+\s*/); // разделители: -, —, :, ;, с пробелом или без

      // Убедимся, что у нас есть хотя бы 2 части (de и ru)
      if (parts.length < 2) {
        setError(
          `Не могу распарсить строку: "${line}". Убедитесь, что слова разделены символами (- или : или ;).`
        );
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
    setSuccess(
      `Успешно распарсено ${parsed.length} карточек. Теперь добавьте примеры.`
    );
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
  // Экспорт урока (Скачивание JSON)
  // -----------------------------
  const handleExport = () => {
    if (cards.length === 0) {
      setError("Сначала распарсите слова для экспорта.");
      return;
    }

    // Создаем объект для экспорта
    const exportData = {
      lessonId: lessonId,
      cards: cards,
      // Добавляем метаданные для удобства импорта/идентификации
      meta: {
        app: "WordMaster Lesson Export",
        version: 1,
        timestamp: new Date().toISOString(),
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${lessonId || "new-lesson"}_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSuccess(`Урок "${lessonId}" экспортирован как .json файл.`);
  };

  // -----------------------------
  // Импорт урока (Загрузка JSON)
  // -----------------------------
  const handleImport = (event) => {
    setError("");
    setSuccess("");
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const importedData = JSON.parse(content);

        if (importedData.lessonId && Array.isArray(importedData.cards)) {
          setLessonId(importedData.lessonId);
          setCards(importedData.cards);

          // Восстанавливаем сырой текст для удобства редактирования (опционально)
          const rawTextFromCards = importedData.cards
            .map((c) => `${c.de} — ${c.ru}`)
            .join("\n");
          setRawText(rawTextFromCards);

          setSuccess(
            `Урок "${importedData.lessonId}" успешно импортирован. Добавьте примеры и сохраните.`
          );
        } else {
          throw new Error("Некорректный формат файла импорта.");
        }
      } catch (e) {
        setError(`Ошибка импорта: ${e.message}`);
      }
    };
    reader.readAsText(file);
    // Сбрасываем значение инпута, чтобы можно было снова загрузить тот же файл
    event.target.value = null;
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
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6">
        Создать/Импортировать урок
      </h1>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
        {/* Предупреждение о локальном хранении */}
        <div className="flex items-start p-4 mb-6 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-700 dark:text-yellow-300 border border-yellow-300">
          <HiOutlineExclamationCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            Ваши уроки хранятся только в **памяти браузера (localStorage)**.
            Если вы очистите кэш или поменяете браузер, **все уроки будут
            удалены!** Используйте кнопку **"Экспорт"** ниже, чтобы сохранить
            резервную копию.
          </div>
        </div>

        {/* Импорт/Экспорт */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleExport}
            className="w-full p-3 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-gray-200 font-semibold transition"
            title="Скачать текущие карточки в формате JSON"
          >
            <HiOutlineDownload className="w-5 h-5 mr-2" /> Экспорт (JSON)
          </button>

          <label
            htmlFor="import-file"
            className="w-full p-3 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-gray-200 font-semibold cursor-pointer transition"
            title="Загрузить урок из ранее сохраненного JSON файла"
          >
            <HiOutlineUpload className="w-5 h-5 mr-2" /> Импорт (JSON)
          </label>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

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
          className="mt-4 w-full p-3 bg-sky-600 hover:bg-sky-700 rounded-lg text-white font-semibold transition"
        >
          Распарсить список
        </button>

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded border border-red-300 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-100 text-green-700 p-3 rounded border border-green-300 dark:bg-green-900 dark:text-green-200">
            {success}
          </div>
        )}

        {/* Список карточек с полями примеров */}
        {cards.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-bold mb-3">
              Карточки ({cards.length})
            </h2>

            {cards.map((card, i) => (
              <div
                key={i}
                className="p-3 rounded bg-gray-100 dark:bg-gray-700 space-y-2 border border-gray-300 dark:border-gray-600"
              >
                <div className="font-bold text-lg">
                  {i + 1}. {card.de} — {card.ru}
                </div>

                <input
                  type="text"
                  placeholder="Пример DE (предложение с этим словом)"
                  value={card.exde}
                  onChange={(e) => updateCard(i, "exde", e.target.value)}
                  className="w-full p-2 rounded bg-gray-200 dark:bg-gray-600 outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Пример RU (перевод примера DE)"
                  value={card.exru}
                  onChange={(e) => updateCard(i, "exru", e.target.value)}
                  className="w-full p-2 rounded bg-gray-200 dark:bg-gray-600 outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            ))}

            <button
              onClick={saveLesson}
              className="mt-6 w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition"
            >
              Сохранить урок ({cards.length} слов)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
