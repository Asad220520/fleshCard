import React, { useState } from "react";
import { loadLessons, saveLessons } from "../data/lessons-storage";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineUpload,
  HiOutlineDownload,
  HiOutlineExclamationCircle,
  HiX,
  HiCheck,
} from "react-icons/hi";

// Инлайн SVG-иконка для озвучивания (имитация HiVolumeUp)
const IconVolume = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9.387 2.628L4.312 7.632A3 3 0 003 9.715v4.57c0 1.258.647 2.454 1.765 3.125L9.387 21.37a2.12 2.12 0 003.113-1.87v-2.31c0-.49-.24-.958-.654-1.247L10 14.28V9.72l1.846-1.28c.414-.288.654-.756.654-1.247V4.5A2.12 2.12 0 009.387 2.628zM18.75 8.25a.75.75 0 00-.75.75v6a.75.75 0 001.5 0V9a.75.75 0 00-.75-.75zM21 11.25a.75.75 0 00-.75.75v.75a.75.75 0 001.5 0v-.75a.75.75 0 00-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

// Доступные языки
const LANGUAGE_OPTIONS = [
  { id: "de", name: "Немецкий (DE)" },
  { id: "en", name: "Английский (EN)" },
  { id: "fr", name: "Французский (FR)" },
  { id: "es", name: "Испанский (ES)" },
  { id: "it", name: "Итальянский (IT)" },
  { id: "ru", name: "Русский (RU)" },
  { id: "zh", name: "Китайский (ZH)" },
  { id: "ja", name: "Японский (JA)" },
  { id: "ko", name: "Корейский (KO)" },
  { id: "ar", name: "Арабский (AR)" },
  { id: "tr", name: "Турецкий (TR)" },
];

const languageUrlMap = {
  de: "german",
  en: "english",
  fr: "french",
  es: "spanish",
  it: "italian",
  ru: "russian",
  zh: "chinese",
  ja: "japanese",
  ko: "korean",
  ar: "arabic",
  tr: "turkish",
};

// -------------------------------------------------------------
// TTS: озвучивание слова/фразы
// -------------------------------------------------------------
const speakWord = (text, languageId) => {
  if (!text || !window.speechSynthesis) return;

  const voiceName = localStorage.getItem("selectedTtsVoiceName");
  const rate = parseFloat(localStorage.getItem("ttsRate")) || 1.0;
  const ttsLangPrefix = languageId.toLowerCase();

  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const availableVoices = window.speechSynthesis.getVoices();

  let selectedVoice = availableVoices.find((v) => v.name === voiceName);
  if (!selectedVoice || !selectedVoice.lang.startsWith(ttsLangPrefix)) {
    selectedVoice = availableVoices.find((v) =>
      v.lang.startsWith(ttsLangPrefix)
    );
  }

  utterance.rate = rate;

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
    utterance.lang =
      languageId === "de"
        ? "de-DE"
        : languageId === "en"
        ? "en-US"
        : languageId;
    console.warn(
      `TTS: подходящий голос для языка ${ttsLangPrefix} не найден. Используется системный.`
    );
  }

  window.speechSynthesis.speak(utterance);
};

// -------------------------------------------------------------
// Основной компонент страницы AddLesson
// -------------------------------------------------------------
export default function AddLessonPage() {
  const navigate = useNavigate();
  const { languageId } = useParams(); // "german" / "english" и т.д.

  // Обратная карта URL → код языка
  const urlToLangCode = Object.fromEntries(
    Object.entries(languageUrlMap).map(([code, url]) => [url, code])
  );

  const initialLangCode = urlToLangCode[languageId] || "de";
  const [selectedLanguage, setSelectedLanguage] = useState(initialLangCode);

  const [lessonId, setLessonId] = useState("");
  const [rawText, setRawText] = useState("");
  const [cards, setCards] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isConfirmingOverwrite, setIsConfirmingOverwrite] = useState(false);
  const [tempRawText, setTempRawText] = useState("");

  // -----------------------------
  // Парсинг списка слов
  // -----------------------------
  const parseAndSetCards = (text) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed = [];
    for (const line of lines) {
      const parts = line.split(/[-—:;]+\s*/);
      if (parts.length < 2) {
        setError(
          `Не могу распарсить строку: "${line}". Используйте - или : или ; для разделения.`
        );
        return false;
      }
      parsed.push({
        de: parts[0].trim(),
        ru: parts[1].trim(),
        exde: "",
        exru: "",
        distractors: [],
      });
    }

    setCards(parsed);
    setSuccess(`Успешно распарсено ${parsed.length} карточек.`);
    setIsConfirmingOverwrite(false);
    setTempRawText("");
    setError("");
    return true;
  };

  // -----------------------------
  // Обработчик кнопки "Распарсить"
  // -----------------------------
  const handleParse = () => {
    setError("");
    setSuccess("");
    setCards([]);

    if (!lessonId.trim()) {
      setError("Введите имя урока, например: my_words");
      return;
    }

    const prefix = `${selectedLanguage.toLowerCase()}_`;
    let checkLessonId = lessonId.trim();
    if (!checkLessonId.startsWith(prefix))
      checkLessonId = prefix + checkLessonId;

    if (!rawText.trim()) {
      setError("Введите хотя бы одно слово.");
      return;
    }

    const lessons = loadLessons();
    if (lessons[checkLessonId]) {
      setTempRawText(rawText);
      setIsConfirmingOverwrite(true);
      setError(
        `Урок с ID "${checkLessonId}" уже существует. Подтвердите перезапись.`
      );
      return;
    }

    parseAndSetCards(rawText);
  };

  const confirmOverwrite = () => {
    if (parseAndSetCards(tempRawText)) {
      setSuccess(
        `Урок "${lessonId}" будет перезаписан. Нажмите "Сохранить урок".`
      );
    }
  };

  const cancelOverwrite = () => {
    setIsConfirmingOverwrite(false);
    setTempRawText("");
    setError("Перезапись отменена. Измените имя урока.");
  };

  // -----------------------------
  // Сохранение урока
  // -----------------------------
  const saveLesson = () => {
    setError("");
    setSuccess("");

    if (!cards.length) {
      setError("Нет карточек для сохранения. Сначала распарсите список.");
      return;
    }

    let finalLessonId = lessonId.trim();
    const prefix = `${selectedLanguage.toLowerCase()}_`;
    if (!finalLessonId.startsWith(prefix))
      finalLessonId = prefix + finalLessonId;

    const lessons = loadLessons();
    lessons[finalLessonId] = cards.map((card) => ({
      ...card,
      distractors: [],
    }));
    saveLessons(lessons);

    setSuccess(`Урок "${finalLessonId}" успешно сохранён!`);

    setTimeout(() => {
      navigate(
        `/lessons-list/${languageUrlMap[selectedLanguage]}/${finalLessonId}`
      );
    }, 800);
  };

  // -----------------------------
  // Экспорт урока
  // -----------------------------
  const handleExport = () => {
    if (!cards.length) {
      setError("Сначала распарсите слова для экспорта.");
      return;
    }

    let exportLessonId = lessonId.trim();
    const prefix = `${selectedLanguage.toLowerCase()}_`;
    if (!exportLessonId.startsWith(prefix))
      exportLessonId = prefix + exportLessonId;

    const exportData = {
      lessonId: exportLessonId,
      cards,
      meta: {
        app: "WordMaster Lesson Export",
        version: 1,
        timestamp: new Date().toISOString(),
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportLessonId}_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSuccess(`Урок "${exportLessonId}" экспортирован.`);
  };

  // -----------------------------
  // Импорт урока
  // -----------------------------
  const handleImport = (event) => {
    setError("");
    setSuccess("");
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.lessonId && Array.isArray(importedData.cards)) {
          const parts = importedData.lessonId.split("_");
          const detectedLang =
            parts.length > 1 &&
            LANGUAGE_OPTIONS.some((l) => l.id === parts[0].toLowerCase())
              ? parts[0].toLowerCase()
              : LANGUAGE_OPTIONS[0].id;

          setSelectedLanguage(detectedLang);
          setLessonId(
            parts.length > 1
              ? importedData.lessonId.substring(detectedLang.length + 1)
              : importedData.lessonId
          );
          setCards(importedData.cards);
          setRawText(
            importedData.cards.map((c) => `${c.de} — ${c.ru}`).join("\n")
          );
          setSuccess(`Урок "${importedData.lessonId}" успешно импортирован.`);
        } else {
          throw new Error("Некорректный формат файла импорта.");
        }
      } catch (err) {
        setError(`Ошибка импорта: ${err.message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  const updateCard = (index, field, value) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  // -----------------------------
  // Рендер
  // -----------------------------
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-2xl transition-shadow duration-300">
        {/* Предупреждение о локальном хранении */}
        <div className="flex items-start p-4 mb-6 text-sm text-yellow-800 rounded-xl bg-yellow-50 dark:bg-gray-700 dark:text-yellow-300 border border-yellow-300">
          <HiOutlineExclamationCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <p>
            Ваши уроки хранятся только в <b>localStorage</b>. Используйте
            "Экспорт" для резервной копии.
          </p>
        </div>

        {/* Импорт / Экспорт */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleExport}
            className="w-full p-3 flex items-center justify-center bg-sky-100 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-700 rounded-xl text-sky-800 dark:text-sky-200 font-bold transition duration-200 shadow-md hover:shadow-lg"
          >
            <HiOutlineDownload className="w-5 h-5 mr-2" /> Экспорт (JSON)
          </button>

          <label
            htmlFor="import-file"
            className="w-full p-3 flex items-center justify-center bg-sky-100 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-700 rounded-xl text-sky-800 dark:text-sky-200 font-bold cursor-pointer transition duration-200 shadow-md hover:shadow-lg"
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

        {/* Ввод ID урока и выбор языка */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="sm:col-span-2">
            <label className="block mb-2 text-sm font-semibold">
              Имя урока (без префикса)
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none border border-transparent focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              placeholder="my_new_words"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold">Язык</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none border border-transparent focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Финальный ID урока:{" "}
          <span className="font-mono text-sky-600 dark:text-sky-400">
            {selectedLanguage.toLowerCase()}_{lessonId.toLowerCase() || "..."}
          </span>
        </p>

        {/* Ввод списка слов */}
        <label className="block mb-2 text-sm font-semibold">
          Вставьте слова (немецкое — русский):
        </label>
        <textarea
          rows={8}
          className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 font-mono text-sm outline-none border border-transparent focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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

        {/* Подтверждение перезаписи */}
        {isConfirmingOverwrite && (
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-xl border-2 border-yellow-400 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-600 shadow-md">
            <p className="font-bold mb-3 text-lg">Подтверждение перезаписи</p>
            <p className="mb-4">
              Урок{" "}
              <b>
                {selectedLanguage.toLowerCase()}_{lessonId}
              </b>{" "}
              уже существует. Перезаписать?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmOverwrite}
                className="flex-1 p-3 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
              >
                <HiCheck className="w-5 h-5 mr-1" /> Да
              </button>
              <button
                onClick={cancelOverwrite}
                className="flex-1 p-3 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
              >
                <HiX className="w-5 h-5 mr-1" /> Отмена
              </button>
            </div>
          </div>
        )}

        {/* Сообщения об ошибке / успехе */}
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

        {/* Список карточек с примерами */}
        {cards.length > 0 && (
          <div className="mt-8 space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4">
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

                <div className="relative">
                  <input
                    type="text"
                    placeholder={`1. Пример ${selectedLanguage.toUpperCase()} (предложение с этим словом)`}
                    value={card.exde}
                    onChange={(e) => updateCard(i, "exde", e.target.value)}
                    className="w-full p-2 pr-12 rounded-lg bg-white dark:bg-gray-600 outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-500 focus:border-sky-500"
                  />
                  <button
                    onClick={() => speakWord(card.exde, selectedLanguage)}
                    disabled={!card.exde.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 disabled:opacity-50 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <IconVolume className="w-6 h-6" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="2. Пример RU (перевод примера DE)"
                  value={card.exru}
                  onChange={(e) => updateCard(i, "exru", e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-gray-600 outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-500 focus:border-sky-500"
                />
              </div>
            ))}

            <button
              onClick={saveLesson}
              className="mt-6 w-full p-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold shadow-xl"
            >
              Сохранить урок ({cards.length} слов)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
