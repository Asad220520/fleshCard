import React, { useState, useEffect, useMemo } from "react";
// Импорт иконок для переключателя темы
import { HiSun, HiMoon, HiDownload } from "react-icons/hi"; // 🆕 Добавил HiDownload
import { useTheme } from "../context/ThemeContext.jsx";
import { HiCheck } from "react-icons/hi";
// 🆕 Убрал импорт FaGooglePlay и FaApple, так как мы фокусируемся на PWA

// 💡 Глобальные константы
const SUPPORTED_TTS_LANGS = ["de", "en", "ko"];
const LANG_STORAGE_KEY = "selectedTtsLang";
const VOICE_STORAGE_KEY = "selectedTtsVoiceName";

// ❌ Условные ссылки и функция isMobileDevice удалены, так как они не нужны для PWA инструкции.

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  const [currentTtsLang, setCurrentTtsLang] = useState("");
  const [currentTtsVoiceName, setCurrentTtsVoiceName] = useState("");
  const [voices, setVoices] = useState([]);

  const [isLangSaved, setIsLangSaved] = useState(false);
  const [isVoiceSaved, setIsVoiceSaved] = useState(false);

  // ❌ Убрал isMobile

  // 1. Загрузка голосов
  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // ❌ Убрал useEffect для isMobile

  // 2. Загрузка языка и имени голоса при монтировании
  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
    const savedVoiceName = localStorage.getItem(VOICE_STORAGE_KEY);

    // Установка дефолтного языка
    const defaultLang = SUPPORTED_TTS_LANGS[0];
    const initialLang =
      savedLang && SUPPORTED_TTS_LANGS.includes(savedLang)
        ? savedLang
        : defaultLang;

    if (!savedLang || !SUPPORTED_TTS_LANGS.includes(savedLang)) {
      localStorage.setItem(LANG_STORAGE_KEY, defaultLang);
    }
    setCurrentTtsLang(initialLang);

    // Установка сохраненного имени голоса
    setCurrentTtsVoiceName(savedVoiceName || "");
  }, []);

  // 3. Фильтрация голосов по активному языку
  const getFilteredVoices = useMemo(() => {
    return voices.filter((v) => v.lang.startsWith(currentTtsLang));
  }, [voices, currentTtsLang]);

  // 4. Сброс имени голоса при смене языка
  useEffect(() => {
    // Если голоса для нового языка существуют, но сохраненное имя не принадлежит им,
    // или если имя голоса пусто, устанавливаем первый голос как дефолтный.
    const isVoiceValid = getFilteredVoices.some(
      (v) => v.name === currentTtsVoiceName
    );

    if (
      getFilteredVoices.length > 0 &&
      (!currentTtsVoiceName || !isVoiceValid)
    ) {
      setCurrentTtsVoiceName(getFilteredVoices[0].name);
    } else if (getFilteredVoices.length === 0) {
      setCurrentTtsVoiceName("");
    }
    // Сбрасываем флаг сохранения при смене языка
    setIsVoiceSaved(false);
  }, [getFilteredVoices, currentTtsVoiceName]);

  // 5. Функции сохранения
  const handleSaveTtsLang = () => {
    if (currentTtsLang) {
      localStorage.setItem(LANG_STORAGE_KEY, currentTtsLang);
      setIsLangSaved(true);
      setTimeout(() => setIsLangSaved(false), 2000);
    }
  };

  const handleSaveTtsVoice = () => {
    if (currentTtsVoiceName) {
      localStorage.setItem(VOICE_STORAGE_KEY, currentTtsVoiceName);
      setIsVoiceSaved(true);
      setTimeout(() => setIsVoiceSaved(false), 2000);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto dark:bg-gray-900 min-h-screen">
      {/* Настройка Темы */}
      <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between dark:bg-gray-800 mb-4">
        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Тема (Dark Mode)
        </span>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-all duration-300 text-gray-700 border border-gray-300 hover:bg-gray-100 dark:text-yellow-400 dark:border-gray-600 dark:hover:bg-gray-700"
          aria-label="Переключить тему"
        >
          {theme === "light" ? (
            <HiMoon className="w-6 h-6" />
          ) : (
            <HiSun className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* 1. Настройка Языка (Lang) */}
      <div className="bg-white p-4 rounded-xl shadow-md dark:bg-gray-800 mb-4">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Язык для озвучивания (TTS)
        </h2>
        <div className="flex items-end justify-between gap-3">
          <div className="flex-grow">
            <label
              htmlFor="tts-lang-select"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Выберите язык:
            </label>
            <select
              id="tts-lang-select"
              value={currentTtsLang}
              onChange={(e) => {
                setCurrentTtsLang(e.target.value);
                setIsLangSaved(false);
              }}
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-sky-400"
            >
              {SUPPORTED_TTS_LANGS.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSaveTtsLang}
            disabled={isLangSaved || !currentTtsLang}
            className={`p-2 sm:p-3 h-10 sm:h-auto rounded-xl font-semibold transition-colors duration-200 shadow-md flex items-center justify-center ${
              isLangSaved
                ? "bg-green-500 text-white"
                : "bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-700"
            }`}
          >
            {isLangSaved ? (
              <>
                <HiCheck className="w-5 h-5 mr-1" />
                Сохранено
              </>
            ) : (
              "Сохранить"
            )}
          </button>
        </div>
      </div>

      {/* 2. Настройка Голоса (Voice) */}
      <div className="bg-white p-4 rounded-xl shadow-md dark:bg-gray-800 mb-4">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Выбор голоса TTS ({currentTtsLang.toUpperCase()})
        </h2>
        <div className="flex items-end justify-between gap-3">
          <div className="flex-grow">
            <label
              htmlFor="tts-voice-select"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Выберите голос:
            </label>
            {getFilteredVoices.length > 0 ? (
              <select
                id="tts-voice-select"
                value={currentTtsVoiceName}
                onChange={(e) => {
                  setCurrentTtsVoiceName(e.target.value);
                  setIsVoiceSaved(false);
                }}
                className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-sky-400"
              >
                {getFilteredVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                ⚠ Нет доступных голосов для {currentTtsLang.toUpperCase()}.
              </p>
            )}
          </div>
          <button
            onClick={handleSaveTtsVoice}
            disabled={
              isVoiceSaved ||
              !currentTtsVoiceName ||
              getFilteredVoices.length === 0
            }
            className={`p-2 sm:p-3 h-10 sm:h-auto rounded-xl font-semibold transition-colors duration-200 shadow-md flex items-center justify-center ${
              isVoiceSaved
                ? "bg-green-500 text-white"
                : "bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-700"
            }`}
          >
            {isVoiceSaved ? (
              <>
                <HiCheck className="w-5 h-5 mr-1" />
                Сохранено
              </>
            ) : (
              "Сохранить"
            )}
          </button>
        </div>
      </div>

      {/* 3. 🆕 Секция: Установить как Мобильное Приложение (PWA) */}
      <div className="bg-white p-4 rounded-xl shadow-md dark:bg-gray-800">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <HiDownload className="w-6 h-6 mr-2 text-sky-600 dark:text-sky-400" />
          Установить как приложение (PWA)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Вы можете установить этот сайт на главный экран своего телефона или
          планшета. Он будет работать как полноценное приложение!
        </p>

        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg dark:bg-gray-700 dark:border-gray-600">
          <p className="font-bold text-sky-800 dark:text-sky-300 mb-1">
            Инструкция:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>
              Нажмите на **иконку меню** (обычно три точки ⋮ или значок ⤴️) в
              вашем браузере.
            </li>
            <li>
              Найдите пункт **"Установить приложение"** или **"Добавить на
              главный экран"**.
            </li>
            <li>Подтвердите установку.</li>
            <li>Приложение появится среди остальных ваших приложений. 🎉</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
