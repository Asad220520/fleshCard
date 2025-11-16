import React, { useState } from "react";
// 💡 Убираем импорт react-icons и заменяем его на SVG
// Путь к lessons-storage остается, предполагая, что файл находится в папке data.
import { loadLessons, saveLessons } from "../data/lessons-storage";
import { useNavigate, useLocation } from "react-router-dom";

// -----------------------------
// ВСТРОЕННЫЕ SVG ИКОНКИ (замена react-icons/hi)
// -----------------------------

const IconUpload = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const IconDownload = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const IconExclamation = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const IconX = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconCheck = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default function AddLessonPage() {
  const navigate = useNavigate();
  // 💡 1. Получаем ID языка из URL (например, ?lang=german)
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const langId = query.get("lang") || "default"; // Используем 'default', если не найден

  const [lessonId, setLessonId] = useState("");
  const [rawText, setRawText] = useState("");
  const [cards, setCards] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Состояние для встроенного подтверждения перезаписи
  const [isConfirmingOverwrite, setIsConfirmingOverwrite] = useState(false);
  const [tempRawText, setTempRawText] = useState(""); // Для хранения текста во время подтверждения

  // -----------------------------
  // Логика парсинга и установки карточек (с усиленной проверкой)
  // -----------------------------
  const parseAndSetCards = (text) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed = [];
    let parsingErrorLine = null;

    for (const line of lines) {
      // Разделители: -, —, :, ;, с пробелом или без
      const parts = line.split(/[-—:;]+\s*/).map((p) => p.trim());

      // 💡 ФИКС 2: Проверка наличия и непустоты обеих частей
      const de = parts[0];
      const ru = parts[1];

      // Проверяем, что есть обе части И что они не пустые строки
      if (!de || !ru) {
        parsingErrorLine = line;
        break;
      }

      parsed.push({
        de,
        ru,
        exde: "",
        exru: "",
        distractors: [],
      });
    }

    if (parsingErrorLine) {
      setError(
        `Не могу распарсить строку: "${parsingErrorLine}". Убедитесь, что слова разделены символами (- или : или ;) И что обе части не пустые.`
      );
      setCards([]);
      setIsConfirmingOverwrite(false);
      setTempRawText("");
      return false; // Ошибка парсинга
    }

    setCards(parsed);
    setSuccess(
      `Успешно распарсено ${parsed.length} карточек. Теперь добавьте примеры.`
    );
    setIsConfirmingOverwrite(false);
    setTempRawText("");
    setError("");
    return true;
  };

  // -----------------------------
  // Обработчик парсинга (с проверкой перезаписи)
  // -----------------------------
  const handleParse = () => {
    setError("");
    setSuccess("");
    setCards([]); // Очистка предыдущих карточек

    if (!lessonId.trim()) {
      setError("Введите ID урока, например: les7");
      return;
    }

    if (
      rawText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0).length === 0
    ) {
      setError("Введите хотя бы одно слово.");
      return;
    }

    // 💡 ФИКС 1: Передаем langId в loadLessons
    const lessons = loadLessons(langId) || {};

    if (lessons[lessonId]) {
      // Если урок существует, активируем встроенное подтверждение
      setTempRawText(rawText);
      setIsConfirmingOverwrite(true);
      setError(
        `Урок с ID "${lessonId}" уже существует. Подтвердите перезапись.`
      );
      return;
    }

    // Если урока нет, парсим сразу
    parseAndSetCards(rawText);
  };

  const confirmOverwrite = () => {
    if (parseAndSetCards(tempRawText)) {
      // Парсинг успешен, теперь пользователь должен нажать "Сохранить"
      setSuccess(
        `Урок "${lessonId}" будет перезаписан. Нажмите "Сохранить урок" внизу.`
      );
    }
  };

  const cancelOverwrite = () => {
    setIsConfirmingOverwrite(false);
    setTempRawText("");
    setError(`Перезапись отменена. Измените ID урока.`);
  };

  // -----------------------------
  // Сохранение урока
  // -----------------------------
  const saveLesson = () => {
    setError("");
    setSuccess("");

    if (cards.length === 0) {
      setError("Нет карточек для сохранения. Сначала распарсите список.");
      return;
    }

    // 💡 ФИКС 1: Передаем langId в loadLessons
    const lessons = loadLessons(langId) || {};

    lessons[lessonId] = cards.map((card) => ({
      ...card,
      // Очищаем дистракторы перед сохранением
      distractors: [],
    }));

    // 💡 ФИКС 1: Передаем langId и объект уроков в saveLessons
    saveLessons(langId, lessons);

    setSuccess(`Урок "${lessonId}" успешно сохранён!`);

    setTimeout(() => {
      // Перенаправляем на страницу тренировки для этого языка/урока
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

    const exportData = {
      lessonId: lessonId,
      cards: cards,
      meta: {
        app: "WordMaster Lesson Export",
        language: langId, // Добавляем информацию о языке
        version: 1,
        timestamp: new Date().toISOString(),
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${langId}_${lessonId || "new-lesson"}_export.json`;
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

          // Восстанавливаем сырой текст для удобства редактирования
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

  // Отображаемый язык в заголовке
  const languageDisplay =
    langId !== "default" ? ` (Язык: ${langId.toUpperCase()})` : "";

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-2xl transition-shadow duration-300">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Создание/импорт урока {languageDisplay}
        </h1>
        {/* 1. Предупреждение о локальном хранении */}
        <div className="flex items-start p-4 mb-6 text-sm text-yellow-800 rounded-xl bg-yellow-50 dark:bg-gray-700 dark:text-yellow-300 border border-yellow-300">
          <IconExclamation className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <p>
            Ваши уроки хранятся только в **памяти браузера (localStorage)**.
            Используйте **"Экспорт"** ниже, чтобы сохранить резервную копию
            перед очисткой кэша.
          </p>
        </div>

        {/* 2. Импорт/Экспорт (Адаптивный Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleExport}
            className="w-full p-3 flex items-center justify-center bg-sky-100 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-700 rounded-xl text-sky-800 dark:text-sky-200 font-bold transition duration-200 shadow-md hover:shadow-lg"
            title="Скачать текущие карточки в формате JSON"
          >
            <IconDownload className="w-5 h-5 mr-2" /> Экспорт (JSON)
          </button>

          <label
            htmlFor="import-file"
            className="w-full p-3 flex items-center justify-center bg-sky-100 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-700 rounded-xl text-sky-800 dark:text-sky-200 font-bold cursor-pointer transition duration-200 shadow-md hover:shadow-lg"
            title="Загрузить урок из ранее сохраненного JSON файла"
          >
            <IconUpload className="w-5 h-5 mr-2" /> Импорт (JSON)
          </label>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* 3. Ввод ID урока */}
        <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
          ID урока (например: les7)
        </label>
        <input
          type="text"
          className="w-full p-3 mb-4 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none border border-transparent focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
        />

        {/* 4. Ввод списка слов */}
        <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
          Вставьте слова (немецкое — русский):
        </label>

        <textarea
          rows={8}
          className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 font-mono text-sm outline-none border border-transparent focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          placeholder={`der Hund — собака\ndie Schule — школа\ndas Brot — хлеб`}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />

        <button
          onClick={handleParse}
          className="mt-4 w-full p-3 bg-sky-600 hover:bg-sky-700 rounded-xl text-white font-bold transition duration-200 shadow-lg"
          disabled={!lessonId.trim() || !rawText.trim()}
        >
          Распарсить список
        </button>

        {/* 5. Встроенный блок подтверждения перезаписи */}
        {isConfirmingOverwrite && (
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-xl border-2 border-yellow-400 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-600 shadow-md">
            <p className="font-bold mb-3 text-lg">Подтверждение перезаписи</p>
            <p className="mb-4">
              Урок **{lessonId}** уже существует для языка **
              {langId.toUpperCase()}**. Вы уверены, что хотите его перезаписать
              новым списком слов?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmOverwrite}
                className="flex-1 p-3 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition shadow-sm"
              >
                <IconCheck className="w-5 h-5 mr-1" /> Да, перезаписать
              </button>
              <button
                onClick={cancelOverwrite}
                className="flex-1 p-3 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition shadow-sm"
              >
                <IconX className="w-5 h-5 mr-1" /> Отмена
              </button>
            </div>
          </div>
        )}

        {/* 6. Сообщения об ошибке/успехе */}
        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg border border-red-300 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-100 text-green-700 p-3 rounded-lg border border-green-300 dark:bg-green-900 dark:text-green-200">
            {success}
          </div>
        )}

        {/* 7. Список карточек с полями примеров */}
        {cards.length > 0 && (
          <div className="mt-8 space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-50">
              Шаги 1 & 2: Добавьте примеры ({cards.length})
            </h2>

            {cards.map((card, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 space-y-3 border border-gray-300 dark:border-gray-600 shadow-sm"
              >
                <div className="font-bold text-lg text-sky-800 dark:text-sky-300">
                  {i + 1}. {card.de} — {card.ru}
                </div>

                <input
                  type="text"
                  placeholder={`1. Пример (${langId.toUpperCase()}) (предложение с этим словом)`}
                  value={card.exde}
                  onChange={(e) => updateCard(i, "exde", e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-gray-600 outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-500 focus:border-sky-500"
                />

                <input
                  type="text"
                  placeholder="2. Пример RU (перевод примера выше)"
                  value={card.exru}
                  onChange={(e) => updateCard(i, "exru", e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-gray-600 outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-500 focus:border-sky-500"
                />
              </div>
            ))}

            <button
              onClick={saveLesson}
              className="mt-6 w-full p-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold transition duration-200 shadow-xl"
            >
              Сохранить урок ({cards.length} слов)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
