import React from "react";
import { HiVolumeUp } from "react-icons/hi";

/**
 * Компонент для воспроизведения текста с использованием встроенного TTS.
 *
 * @param {Object} props
 * @param {string} props.textToSpeak - Текст для озвучки
 * @param {string} [props.lang='de-DE'] - Язык для озвучки (если voice не передан)
 * @param {Object} [props.voice] - Голос из window.speechSynthesis.getVoices()
 * @param {string} [props.className] - Доп. классы Tailwind
 * @param {string} [props.title='Прослушать'] - title для кнопки
 */
export default function AudioPlayer({
  textToSpeak,
  lang = "de-DE",
  voice = null,
  className = "",
  title = "Прослушать",
}) {
  const isSpeechSupported = "speechSynthesis" in window;

  if (!textToSpeak || !isSpeechSupported) return null;

  const handlePlayAudio = (event) => {
    event.stopPropagation();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (voice) {
      utterance.voice = voice;
    } else {
      utterance.lang = lang;
    }

    window.speechSynthesis.cancel();
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
