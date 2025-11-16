// src/pages/Checkout.jsx

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { restoreLives } from "../store/lives/livesSlice";
import { clearGameOver } from "../store/gameState/gameStateSlice";
import { HiCheckCircle } from "react-icons/hi";

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, lessonId } = useParams(); // Получаем ID урока для возврата

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Функция, которая имитирует процесс оплаты и вызывается при клике
  const handlePayment = () => {
    if (isProcessing) return;

    setIsProcessing(true);
    console.log(`Имитация оплаты для продукта: ${product}`);

    // Имитация задержки оплаты (например, 2 секунды)
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // ❗ ЛОГИКА ВОССТАНОВЛЕНИЯ ЖИЗНЕЙ
      dispatch(restoreLives());
      dispatch(clearGameOver());

      // Автоматический возврат на экран урока через 1 секунду
      setTimeout(() => {
        navigate(`/lesson/${lessonId}`);
      }, 1000);
    }, 2000);
  };

  // Если покупка уже успешна, и мы попали на эту страницу (хотя не должны)
  useEffect(() => {
    if (isSuccess) {
      navigate(`/lesson/${lessonId}`);
    }
  }, [isSuccess, navigate, lessonId]);

  if (isSuccess) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto mt-20 bg-white dark:bg-gray-800 shadow-xl rounded-xl transition-colors">
        <HiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
          Покупка прошла успешно!
        </h2>
        <p>Ваши жизни восстановлены. Возвращаемся к уроку...</p>
      </div>
    );
  }

  return (
    <div className="p-12 text-center max-w-lg mx-auto mt-20 bg-white dark:bg-gray-800 shadow-xl rounded-xl transition-colors">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50 mb-4">
        Подтверждение покупки
      </h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        {product === "restore-lives"
          ? "Вы собираетесь мгновенно восстановить все жизни."
          : "Вы приобретаете Premium-подписку."}
      </p>

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full px-6 py-3 rounded-xl font-bold transition duration-300 ${
          isProcessing
            ? "bg-yellow-500 text-gray-800 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {isProcessing ? "Обработка..." : "Оплатить и восстановить"}
      </button>
      <button
        onClick={() => navigate(-1)}
        disabled={isProcessing}
        className="w-full mt-3 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600"
      >
        Отмена
      </button>
    </div>
  );
}
