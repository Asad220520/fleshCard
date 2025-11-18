import React, { useState, useEffect, useCallback } from "react";
import { loadLessons, saveLessons } from "../data/lessons-storage";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineUpload,
  HiOutlineDownload,
  HiOutlineExclamationCircle,
  HiX,
  HiCheck,
} from "react-icons/hi";

// 💡 Глобальные константы
const SUPPORTED_TTS_LANGS = ["de", "en", "ko"];

export default function AddLessonPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { editLessonId } = useParams();

  const selectedFolderId = location.state?.folderId;
  const selectedLangFromNav = location.state?.ttsLang;

  // -----------------------------
  // СОСТОЯНИЯ
  // -----------------------------
  const [lessonId, setLessonId] = useState(editLessonId || "");
  const [rawText, setRawText] = useState("");
  const [cards, setCards] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    editLessonId ? `Урок "${editLessonId}" загружен для редактирования.` : ""
  );
  const [currentLessonLang, setCurrentLessonLang] = useState(
    selectedLangFromNav || SUPPORTED_TTS_LANGS[0]
  );
  const [currentFolderId, setCurrentFolderId] = useState(
    selectedFolderId || ""
  );

  const [isConfirmingOverwrite, setIsConfirmingOverwrite] = useState(false);
  const [tempRawText, setTempRawText] = useState("");

  // -----------------------------
  // Эффект для загрузки данных при редактировании
  // -----------------------------
  useEffect(() => {
    if (editLessonId) {
      const lessons = loadLessons();
      const lessonToEdit = lessons[editLessonId];

      if (lessonToEdit && Array.isArray(lessonToEdit.cards)) {
        setLessonId(editLessonId);
        setCards(lessonToEdit.cards);
        setCurrentLessonLang(lessonToEdit.lang || SUPPORTED_TTS_LANGS[0]);

        setCurrentFolderId(lessonToEdit.folderId || selectedFolderId || "");

        const rawTextFromCards = lessonToEdit.cards
          .map((c) => `${c.de} — ${c.ru}`)
          .join("\n");
        setRawText(rawTextFromCards);

        setSuccess(
          `Редактирование урока "${editLessonId}" (${(
            lessonToEdit.lang || "N/A"
          ).toUpperCase()})...`
        );
      } else {
        setError(
          `Урок с ID "${editLessonId}" не найден или имеет некорректный формат.`
        );
        setLessonId("");
        setRawText("");
      }
    } else {
      setCurrentLessonLang(selectedLangFromNav || SUPPORTED_TTS_LANGS[0]);
      setCurrentFolderId(selectedFolderId || "");
    }

    if (!editLessonId && !selectedFolderId) {
      setError(
        "Невозможно создать урок: не выбрана целевая папка. Вернитесь назад."
      );
    }
  }, [editLessonId, selectedLangFromNav, selectedFolderId]);

  // -----------------------------
  // Логика парсинга и установки карточек (без изменений)
  // -----------------------------
  const parseAndSetCards = useCallback(
    (text) => {
      // ... (Ваша логика парсинга) ...
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const parsed = [];
      for (const line of lines) {
        const parts = line.split(/[-—:;]+\s*/);

        if (parts.length < 2) {
          setError(
            `Не могу распарсить строку: "${line}". Убедитесь, что слова разделены символами (- или : или ;).`
          );
          return false;
        }

        const de = parts[0].trim();
        const ru = parts[1].trim();

        const existingCard = cards.find((c) => c.de === de && c.ru === ru);

        parsed.push({
          de,
          ru,
          exde: existingCard ? existingCard.exde : "",
          exru: existingCard ? existingCard.exru : "",
          distractors: existingCard ? existingCard.distractors : [],
        });
      }

      setCards(parsed);
      setSuccess(
        `Успешно распарсено ${parsed.length} карточек. Теперь добавьте/проверьте примеры.`
      );
      setIsConfirmingOverwrite(false);
      setTempRawText("");
      setError("");
      return true;
    },
    [cards]
  );

  // -----------------------------
  // Обработчик парсинга (без изменений)
  // -----------------------------
  const handleParse = () => {
    setError("");
    setSuccess("");

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

    const lessons = loadLessons();
    if (lessons[lessonId] && lessonId !== editLessonId) {
      setTempRawText(rawText);
      setIsConfirmingOverwrite(true);
      setError(
        `Урок с ID "${lessonId}" уже существует. Подтвердите перезапись.`
      );
      return;
    }

    parseAndSetCards(rawText);
  };

  const confirmOverwrite = () => {
    if (parseAndSetCards(tempRawText)) {
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

    if (!currentFolderId) {
      setError("Ошибка сохранения: отсутствует ID целевой папки.");
      return;
    }

    const lessons = loadLessons();

    lessons[lessonId] = {
      lang: currentLessonLang,
      folderId: currentFolderId,
      cards: cards.map((card) => ({
        ...card,
        distractors: card.distractors || [],
      })),
    };

    saveLessons(lessons);

    setSuccess(
      `Урок "${lessonId}" успешно сохранён в папку ID: ${currentFolderId}!`
    );

    setTimeout(() => {
      navigate(`/`);
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
      lang: currentLessonLang,
      folderId: currentFolderId,
      cards: cards,
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

        if (
          importedData.lessonId &&
          Array.isArray(importedData.cards) &&
          importedData.lang
        ) {
          setLessonId(importedData.lessonId);
          setCards(importedData.cards);
          setCurrentLessonLang(importedData.lang);

          setCurrentFolderId(importedData.folderId || currentFolderId);

          const rawTextFromCards = importedData.cards
            .map((c) => `${c.de} — ${c.ru}`)
            .join("\n");
          setRawText(rawTextFromCards);

          setSuccess(
            `Урок "${
              importedData.lessonId
            }" (${importedData.lang.toUpperCase()}) успешно импортирован.`
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

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-2xl transition-shadow duration-300">
        <h1 className="text-3xl font-extrabold text-sky-700 dark:text-sky-300 mb-6 text-center">
          {editLessonId ? "Редактирование Урока" : "Добавление Нового Урока"}
        </h1>

        {/* 1. Предупреждение о локальном хранении */}
        <div className="flex items-start p-4 mb-6 text-sm text-yellow-800 rounded-xl bg-yellow-50 dark:bg-gray-700 dark:text-yellow-300 border border-yellow-300">
          <HiOutlineExclamationCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <p>
            Ваши уроки хранятся только в **памяти браузера (localStorage)**.
            Используйте **"Экспорт"** ниже, чтобы сохранить резервную копию
            перед очисткой кэша.
          </p>
        </div>

        {/* 2. Импорт/Экспорт */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleExport}
            className="w-full p-3 flex items-center justify-center bg-sky-100 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-700 rounded-xl text-sky-800 dark:text-sky-200 font-bold transition duration-200 shadow-md hover:shadow-lg"
            title="Скачать текущие карточки в формате JSON"
          >
            <HiOutlineDownload className="w-5 h-5 mr-2" /> Экспорт (JSON)
          </button>

          <label
            htmlFor="import-file"
            className="w-full p-3 flex items-center justify-center bg-sky-100 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-700 rounded-xl text-sky-800 dark:text-sky-200 font-bold cursor-pointer transition duration-200 shadow-md hover:shadow-lg"
            title="Загрузить урок из ранее сохраненного JSON файла"
          >
            <HiOutlineUpload className="w-5 h-5 mr-2" /> Импорт (JSON)
          </label>
          <input
            id="import-file"
            name="importFile"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* 3. Ввод ID урока - ИСПРАВЛЕНО (добавлен id и htmlFor) */}
        <label
          htmlFor="lesson-id"
          className="block mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200"
        >
          ID урока (например: les7)
        </label>
        <input
          id="lesson-id"
          type="text"
          name="lessonId"
          className={`w-full p-3 mb-4 rounded-lg outline-none border transition-colors
            ${
              editLessonId
                ? "bg-gray-300 dark:bg-gray-600 border-gray-400 cursor-not-allowed"
                : "bg-gray-100 dark:bg-gray-700 border-transparent focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            }`}
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
          disabled={!!editLessonId}
        />

        {/* 4. Отображение языка и папки урока */}
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Язык урока:{" "}
            <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
              {currentLessonLang.toUpperCase()}
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Целевая папка ID:{" "}
            <span className="font-mono text-xs bg-gray-200 dark:bg-gray-600 p-1 rounded">
              {currentFolderId || "НЕ ВЫБРАНА"}
            </span>
          </p>
        </div>

        {/* 5. Ввод списка слов - ИСПРАВЛЕНО (добавлен id, name и htmlFor) */}
        <label
          htmlFor="raw-text-input"
          className="block mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200"
        >
          Вставьте слова (немецкое — русский):
        </label>

        <textarea
          id="raw-text-input" 
          name="rawText"
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

        {/* 6. Встроенный блок подтверждения перезаписи */}
        {isConfirmingOverwrite && (
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-xl border-2 border-yellow-400 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-600 shadow-md">
            <p className="font-bold mb-3 text-lg">Подтверждение перезаписи</p>
            <p className="mb-4">
              Урок **{lessonId}** уже существует. Вы уверены, что хотите его
              перезаписать новым списком слов?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmOverwrite}
                className="flex-1 p-3 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition shadow-sm"
              >
                <HiCheck className="w-5 h-5 mr-1" /> Да, перезаписать
              </button>
              <button
                onClick={cancelOverwrite}
                className="flex-1 p-3 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition shadow-sm"
              >
                <HiX className="w-5 h-5 mr-1" /> Отмена
              </button>
            </div>
          </div>
        )}

        {/* 7. Сообщения об ошибке/успехе */}
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

        {/* 8. Список карточек с полями примеров */}
        {cards.length > 0 && (
          <div className="mt-8 space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-50">
              Шаг 2: Добавьте/Проверьте примеры ({cards.length})
            </h2>

            {cards.map((card, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 space-y-3 border border-gray-300 dark:border-gray-600 shadow-sm"
              >
                <div className="font-bold text-lg text-sky-800 dark:text-sky-300">
                  {i + 1}. {card.de} — {card.ru}
                </div>

                {/* Пример DE - ИСПРАВЛЕНО (добавлен id) */}
                <input
                  id={`example-de-${i}`} 
                  type="text"
                  name={`exampleDe-${i}`}
                  placeholder="1. Пример DE (предложение с этим словом)"
                  value={card.exde}
                  onChange={(e) => updateCard(i, "exde", e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-gray-600 outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-500 focus:border-sky-500"
                />

                {/* Пример RU - ИСПРАВЛЕНО (добавлены id и name) */}
                <input
                  id={`example-ru-${i}`} 
                  name={`exampleRu-${i}`} 
                  type="text"
                  placeholder="2. Пример RU (перевод примера DE)"
                  value={card.exru}
                  onChange={(e) => updateCard(i, "exru", e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-gray-600 outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-500 focus:border-sky-500"
                />
                
                {/* Примечание: В реальном приложении для полей примеров
                также рекомендуется добавить aria-label или визуально скрытую
                метку, если нет явной видимой <label> */}
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