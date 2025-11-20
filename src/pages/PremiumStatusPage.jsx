import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
// ❗ ИМПОРТ РЕАЛЬНОГО ДЕЙСТВИЯ ДЛЯ АКТИВАЦИИ
import { restoreLives, deactivateUnlimited } from "../store/lives/livesSlice"; // ⚠️ ПРОВЕРЬТЕ ПУТЬ В ВАШЕМ ПРОЕКТЕ

// --- ИКОНКИ ---

const IconCheck = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconInfinity = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18.8 6.78c-1.32-.93-3.13-1.48-5.06-1.28-1.92.2-3.6.86-4.94 1.77-1.35.91-2.19 2.1-2.47 3.49-.27 1.39-.1 2.7.5 4.07.6 1.37 1.7 2.47 3.06 3.16 1.36.7 3.03 1.05 4.73.86s3.32-.78 4.64-1.7c1.32-.93 2.13-2.16 2.4-3.56.27-1.4-.04-2.8-.75-4.13" />
    <path d="M5.2 17.22c1.32.93 3.13 1.48 5.06 1.28 1.92-.2 3.6-.86 4.94-1.77 1.35-.91 2.19-2.1 2.47-3.49.27-1.4.04-2.8-.75-4.13" />
  </svg>
);

const IconAward = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 18 17 23 15.79 13.88"></polyline>
  </svg>
);

const IconZap = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const IconTelegram = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.32 8.52l-5.32 4.14a.78.78 0 01-.89 0l-1.92-1.5a.78.78 0 010-1.2l6.21-4.83a.78.78 0 01.99.11l.93 1.48a.78.78 0 01-.1.97z" />
    <path
      d="M15.4 9.4L10 13.54l-1.5-1.17 6.9-5.37a.78.78 0 01.89 0l1.92 1.5a.78.78 0 010 1.2l-6.21 4.83a.78.78 0 01-.99-.11l-.93-1.48a.78.78 0 01.1-.97z"
      fill="white"
      stroke="none"
    />
    <path
      d="M15.4 9.4L10 13.54l-1.5-1.17 6.9-5.37a.78.78 0 01.89 0l1.92 1.5a.78.78 0 010 1.2l-6.21 4.83a.78.78 0 01-.99-.11l-.93-1.48a.78.78 0 01.1-.97z"
      stroke="#0088cc"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

const PREMIUM_BENEFITS = [
  {
    icon: IconInfinity,
    title: "Безлимитные жизни",
    description: "Никаких ограничений — учитесь столько, сколько хотите.",
  },
  {
    icon: IconAward,
    title: "Премиум-контент",
    description: "Доступ к эксклюзивным урокам и словарям от экспертов.",
  },
  {
    icon: IconZap,
    title: "Ускоренный прогресс",
    description:
      "Улучшенные алгоритмы повторения для более быстрого запоминания.",
  },
  {
    icon: IconZap,
    title: "Без рекламы",
    description: "Учеба без отвлекающих факторов.",
  },
];

function PremiumStatusPage() {
  const dispatch = useDispatch();
  // Получаем статус подписки из Redux
  const isUnlimited = useSelector((state) => state.lives.isUnlimited);

  // Состояния для активации через Telegram-код
  const [activationCode, setActivationCode] = useState("");
  const [activationMessage, setActivationMessage] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  // ВАЖНО: Это имитация логики активации.
  const SECRET_CODE = "WORDMASTERPRO";
  const TELEGRAM_LINK = "https://t.me/+xR9qpB89YgM4ZDQy"; // Замените на ссылку на вашего бота

  const handleActivate = async () => {
    if (activationCode.length < 5) {
      setActivationMessage("Введите корректный код.");
      return;
    }

    setIsActivating(true);
    setActivationMessage("Проверка кода...");

    // Имитация задержки API (должна быть реальным вызовом на ваш сервер)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (activationCode.toUpperCase() === SECRET_CODE) {
      setActivationMessage("Успех! Подписка Premium активирована.");

      // 1. Диспетчеризация РЕАЛЬНОГО Redux-действия для активации Premium
      dispatch(restoreLives()); // 🚀 АКТИВИРУЕТ isUnlimited = true

      // 2. Очистка формы
      setActivationCode("");
    } else {
      setActivationMessage(
        "Ошибка: Код недействителен или устарел. Попробуйте снова."
      );
    }

    setIsActivating(false);
  };

  // Компонент для отображения одного преимущества
  const BenefitCard = ({ icon: Icon, title, description }) => (
    <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 transition-transform duration-300 hover:shadow-xl">
      <Icon className="w-8 h-8 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-1" />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
    </div>
  );
  const handleCancelSubscription = async () => {
    // ⚠️ Шаг 1: Отправка запроса на ваш сервер для фактической отмены платежей
    const confirmed = window.confirm(
      "Вы уверены, что хотите отменить подписку Premium?"
    );

    if (confirmed) {
      // Имитация отмены на сервере
      alert("Отмена подписки на сервере...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Шаг 2: Обновление Redux-статуса после подтверждения
      dispatch(deactivateUnlimited());
      alert("Подписка успешно отменена. Вы вернетеесь к Базовому статусу.");
    }
  };
  // ----------------------------------------------------
  // Рендер страницы
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-10 pt-4 text-gray-900 dark:text-white">
          Статус WordMaster Premium
        </h1>

        {/* 1. БАННЕР СТАТУСА */}
        <div
          className={`p-6 rounded-2xl shadow-2xl mb-12 ${
            isUnlimited
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              : "bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
          }`}
        >
          <div className="flex items-center space-x-4">
            {isUnlimited ? (
              <IconCheck className="w-10 h-10 flex-shrink-0" />
            ) : (
              <IconInfinity className="w-10 h-10 flex-shrink-0" />
            )}
            <div>
              <p className="text-xl font-medium">Ваш текущий статус</p>
              <h2 className="text-3xl font-bold">
                {isUnlimited ? "АКТИВЕН (PREMIUM)" : "БАЗОВЫЙ (FREE)"}
              </h2>
            </div>
          </div>

          {isUnlimited ? (
            /* СЕКЦИЯ: PREMIUM АКТИВЕН */
            <div className="mt-4 pt-4 border-t border-white/30">
              <p className="text-sm">
                Наслаждайтесь безлимитным обучением! Ваша подписка активна.
              </p>
              <button
                onClick={handleCancelSubscription} // 👈 Используем новую функцию
                className="mt-3 px-4 py-2 bg-white text-green-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
              >
                Отменить подписку
              </button>
            </div>
          ) : (
            /* СЕКЦИЯ: БАЗОВЫЙ (FREE) - АКТИВАЦИЯ ЧЕРЕЗ TELEGRAM */
            <div className="mt-4 pt-4 border-t border-white/30">
              <p className="text-sm mb-4">
                Для активации подписки Premium, получите секретный код в нашем
                Telegram-боте.
              </p>

              {/* КНОПКА TELEGRAM */}
              <a
                href={TELEGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg shadow-md hover:bg-gray-100 transition duration-300 transform hover:scale-[1.02] text-center"
              >
                <IconTelegram className="w-6 h-6 fill-indigo-600" />
                <span>Перейти в Telegram-Бот</span>
              </a>

              <p className="text-sm mt-4">
                Шаг 2: Введите полученный код ниже:
              </p>

              {/* ФОРМА ВВОДА КОДА */}
              <div className="flex flex-col sm:flex-row mt-2 space-y-3 sm:space-y-0 sm:space-x-3">
                <input
                  type="text"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  placeholder="Введите секретный код"
                  className="flex-grow p-3 text-gray-800 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                  disabled={isActivating}
                />
                <button
                  onClick={handleActivate}
                  disabled={isActivating || activationCode.length < 5}
                  className={`px-6 py-3 font-bold rounded-lg shadow-md transition duration-300 ${
                    isActivating
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-green-400 text-white hover:bg-green-500"
                  }`}
                >
                  {isActivating ? "Активация..." : "Активировать Premium"}
                </button>
              </div>

              {/* СООБЩЕНИЕ ОБ АКТИВАЦИИ */}
              {activationMessage && (
                <p
                  className={`mt-3 text-center text-sm font-semibold ${
                    activationMessage.includes("Успех")
                      ? "text-green-200"
                      : "text-red-200"
                  }`}
                >
                  {activationMessage}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 2. ПРЕИМУЩЕСТВА */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-2 border-sky-500">
          Что вы получите с Premium
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PREMIUM_BENEFITS.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </div>

        {/* 3. Футер/дополнительная информация */}
        <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p>
            Отменить подписку можно в любое время. Присоединяйтесь к тысячам
            учеников, которые уже учатся без ограничений!
          </p>
          <Link
            to="/faq"
            className="mt-2 inline-block text-sky-500 hover:text-sky-400 font-medium transition duration-300"
          >
            Посмотреть Частые вопросы (FAQ)
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PremiumStatusPage;
