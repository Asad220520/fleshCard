import React from "react";
import { HiVolumeUp } from "react-icons/hi";

/**
 * Компонент для воспроизведения текста с использованием встроенного в браузер TTS (Text-to-Speech) API.
 *
 * @param {Object} props
 * @param {string} props.textToSpeak - Текст (слово), которое нужно озвучить.
 * @param {string} [props.lang='de-DE'] - Язык для озвучки (например, 'de-DE' для немецкого).
 * @param {string} [props.className] - Дополнительные классы Tailwind CSS.
 */
export default function AudioPlayer({
  textToSpeak,
  lang = "de-DE",
  className = "",
  title = "Прослушать",
}) {
  // Проверяем доступность API синтеза речи
  const isSpeechSupported = "speechSynthesis" in window;

  if (!textToSpeak || !isSpeechSupported) {
    // Если текст пуст или браузер не поддерживает API, не отображаем кнопку.
    return null;
  }

  const handlePlayAudio = (event) => {
    // Предотвращаем всплытие события клика
    event.stopPropagation();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Установка языка для корректного произношения (важно для немецкого)
    utterance.lang = lang;

    // Опционально: можно настроить скорость (rate) и тон (pitch)
    // utterance.rate = 0.9;

    window.speechSynthesis.cancel(); // Останавливаем предыдущую речь, если есть
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handlePlayAudio}
      className={`ml-2 p-1 text-sky-600 hover:text-sky-800 transition rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 ${className}`}
      title={title}
      aria-label={title}
    >
      <HiVolumeUp className="w-5 h-5" />
    </button>
  );
}
