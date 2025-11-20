// src/pages/Checkout.jsx

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { restoreLives } from "../store/lives/livesSlice";
import { clearGameOver } from "../store/gameState/gameStateSlice";
import { HiCheckCircle, HiArrowSmRight } from "react-icons/hi"; // Импортируем иконки

// ⚠️ ЗАМЕНИТЕ ЭТУ ССЫЛКУ НА РЕАЛЬНУЮ ССЫЛКУ-ПРИГЛАШЕНИЕ В ВАШУ ГРУППУ
const TELEGRAM_INVITE_LINK = "https://t.me/+xR9qpB89YgM4ZDQy";

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, lessonId } = useParams();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirected, setIsRedirected] = useState(false); // Для отслеживания перенаправления

  // Функция, которая имитирует процесс подписки и проверки
  const handleSubscribe = () => {
    if (isProcessing) return;

    // 1. Открываем ссылку в новой вкладке, чтобы пользователь мог подписаться
    window.open(TELEGRAM_INVITE_LINK, "_blank");

    setIsRedirected(true); // Устанавливаем, что перенаправление произошло
    setIsProcessing(true); // Начинаем "ожидание" и "проверку"

    // Имитация задержки проверки (4 секунды)
    // В реальном приложении здесь бы шел запрос на БЭКЕНД
    setTimeout(() => {
      // Имитация успешной проверки подписки
      setIsProcessing(false);
      setIsSuccess(true);

      // ❗ ЛОГИКА ВОССТАНОВЛЕНИЯ ЖИЗНЕЙ
      dispatch(restoreLives());
      dispatch(clearGameOver());

      // Автоматический возврат на экран урока через 1 секунду
      setTimeout(() => {
        navigate(`/lesson/${lessonId}`);
      }, 1000);
    }, 4000); // 4 секунды на подписку и "проверку"
  };

  // Если покупка уже успешна, и мы попали на эту страницу (хотя не должны)
  useEffect(() => {
    if (isSuccess) {
      navigate(`/lesson/${lessonId}`);
    }
  }, [isSuccess, navigate, lessonId]);

  // --- РЕНДЕР: УСПЕХ (ПОДПИСКА ПОДТВЕРЖДЕНА) ---
  if (isSuccess) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto mt-20 bg-white dark:bg-gray-800 shadow-xl rounded-xl transition-colors">
        <HiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
          Подписка подтверждена!
        </h2>
        <p>Ваши жизни восстановлены. Возвращаемся к уроку...</p>
      </div>
    );
  }

  // --- РЕНДЕР: ОЖИДАНИЕ ПРОВЕРКИ ---
  if (isRedirected && isProcessing) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto mt-20 bg-white dark:bg-gray-800 shadow-xl rounded-xl transition-colors">
        {/* Спиннер */}
        <svg
          className="animate-spin w-12 h-12 mx-auto text-blue-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50 mb-4">
          Ожидание подписки...
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Пожалуйста, подпишитесь в открывшейся вкладке Telegram. Проверяем
          статус...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          (Имитация проверки занимает 4 секунды)
        </p>
      </div>
    );
  }

  // --- РЕНДЕР: НАЧАЛО ПРОЦЕССА (КНОПКА) ---
  return (
    <div className="p-12 text-center max-w-lg mx-auto mt-20 bg-white dark:bg-gray-800 shadow-xl rounded-xl transition-colors">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50 mb-4">
        Подписка и восстановление жизней
      </h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Чтобы мгновенно восстановить все жизни, пожалуйста, подпишитесь на наш
        Telegram-канал.
      </p>

      <button
        onClick={handleSubscribe}
        disabled={isProcessing}
        className={`flex items-center justify-center w-full px-6 py-3 rounded-xl font-bold transition duration-300 ${
          isProcessing
            ? "bg-gray-400 text-gray-800 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        Перейти в Telegram и подписаться{" "}
        <HiArrowSmRight className="w-5 h-5 ml-2" />
      </button>
      <button
        onClick={() => navigate(-1)}
        disabled={isProcessing}
        className="w-full mt-3 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600"
      >
        Отмена
      </button>
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        Вы будете перенаправлены на канал **
        {TELEGRAM_INVITE_LINK.includes("t.me/")
          ? TELEGRAM_INVITE_LINK.split("t.me/")[1]
          : TELEGRAM_INVITE_LINK}
        **
      </p>
    </div>
  );
}
