import React, { useState } from "react";

// Иконки для аккордеона
const IconChevronDown = (props) => (
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
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// Данные FAQ
const FAQ_DATA = [
  {
    id: 1,
    question: "Что такое WordMaster Premium и какие у него преимущества?",
    answer:
      "WordMaster Premium — это подписка, которая предоставляет вам неограниченный доступ ко всем функциям обучения. Основные преимущества: безлимитные 'жизни' (нет ограничений на ошибки), эксклюзивный премиум-контент, ускоренные алгоритмы повторения и полное отсутствие рекламы.",
  },
  {
    id: 2,
    question: "Как восстанавливаются 'жизни' в базовом режиме?",
    answer:
      "В базовом режиме (Free) вы начинаете с ограниченным количеством 'жизней'. Каждая ошибка в уроке отнимает одну 'жизнь'. 'Жизни' восстанавливаются автоматически со временем (например, одна жизнь каждые 4 часа) или могут быть восстановлены мгновенно, если вы приобретете Premium или воспользуетесь специальным предложением.",
  },
  {
    id: 3,
    question: "Как я могу отменить или изменить свою подписку Premium?",
    answer:
      "Управление подпиской осуществляется через магазин приложений, в котором вы ее приобрели (App Store или Google Play) или через наш веб-портал. Нажмите кнопку 'Управление подпиской' на странице '/premium-status' для перехода к соответствующим настройкам. Вы можете отменить ее в любое время.",
  },
  {
    id: 4,
    question:
      "Могу ли я пользоваться приложением WordMaster полностью бесплатно?",
    answer:
      "Да, вы можете использовать WordMaster бесплатно! Базовый режим включает доступ к ключевым урокам, но имеет ограничение по 'жизням' и содержит рекламу. Premium просто снимает эти ограничения и дает доступ к дополнительным материалам.",
  },
  {
    id: 5,
    question: "Что произойдет с моим прогрессом, если я отменю Premium?",
    answer:
      "Ваш прогресс и все изученные слова сохранятся! После отмены подписки вы просто вернетесь к Базовому режиму с ограничением по 'жизням' и рекламой. Вы всегда сможете возобновить подписку, чтобы продолжить обучение без ограничений.",
  },
];

// Компонент одного элемента аккордеона
const AccordionItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="flex justify-between items-center w-full py-4 px-6 text-left text-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300 rounded-t-xl focus:outline-none"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        {question}
        <IconChevronDown
          className={`w-6 h-6 text-sky-500 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-4 text-gray-600 dark:text-gray-300 text-base">
          {answer}
        </div>
      </div>
    </div>
  );
};

function FAQPage() {
  // Состояние для управления открытым элементом аккордеона
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 pt-4 text-gray-900 dark:text-white">
          Часто задаваемые вопросы
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
          Найдите ответы на самые популярные вопросы о WordMaster и подписке
          Premium.
        </p>

        {/* Контейнер аккордеона */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          {FAQ_DATA.map((item) => (
            <AccordionItem
              key={item.id}
              question={item.question}
              answer={item.answer}
              isOpen={openId === item.id}
              onClick={() => handleToggle(item.id)}
            />
          ))}
        </div>

        <div className="mt-12 text-center p-4 bg-sky-50 dark:bg-sky-900/50 rounded-xl shadow-lg border border-sky-200 dark:border-sky-800">
          <h3 className="text-xl font-semibold text-sky-700 dark:text-sky-300 mb-2">
            Не нашли свой вопрос?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Свяжитесь с нашей службой поддержки, и мы обязательно вам поможем.
          </p>
          <a
            href="mailto:support@wordmaster.com"
            className="mt-3 inline-block px-4 py-2 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition duration-300 shadow-md"
          >
            Написать в поддержку
          </a>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
