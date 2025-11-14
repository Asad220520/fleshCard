import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { selectLesson, markLearned } from "../../store/store";
import { lessons } from "../../data";
import StudyCompletionModal from "../../components/StudyCompletionModal";

// Импорт иконок
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheck,
  HiOutlineRefresh,
} from "react-icons/hi";
import AudioPlayer from "../../components/AudioPlayer";

// 🆕 КОНСТАНТА: Максимальное количество слов в одной учебной сессии
const MAX_SESSION_SIZE = 15;

// Стили для 3D-переворота (Оставлены без изменений)
const flipCardStyles = {
  perspective: "1000px",
  width: "100%",
  maxWidth: "400px",
  height: "300px",
};

const flipCardInnerStyles = {
  position: "relative",
  width: "100%",
  height: "100%",
  textAlign: "center",
  transition: "transform 0.6s",
  transformStyle: "preserve-3d",
};

const flipCardFaceStyles = {
  position: "absolute",
  width: "100%",
  height: "100%",
  WebkitBackfaceVisibility: "hidden",
  backfaceVisibility: "hidden",
  borderRadius: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
};

export default function FlashCardsMode() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, learned } = useSelector((state) => state.words);

  // Состояния для логики
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionList, setSessionList] = useState([]); // <-- Фиксированный список слов для сессии
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Фильтрация невыученных слов (весь пул)
  const remainingList =
    list?.filter(
      (w) => !learned.some((lw) => lw.de === w.de && lw.lessonId === w.lessonId)
    ) || [];

  // Оставшееся общее количество невыученных слов
  const totalRemaining = remainingList.length;

  const current = sessionList[index]; // <-- Текущее слово берем из фиксированного списка

  // 1. Загрузка урока
  useEffect(() => {
    if ((!list || list.length === 0) && lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
    }
  }, [list, dispatch, lessonId]);

  // 2. Инициализация sessionList в начале работы компонента (ограничение батча)
  useEffect(() => {
    // Инициализируем sessionList, беря только MAX_SESSION_SIZE слов
    if (remainingList.length > 0 && sessionList.length === 0) {
      // Берем батч из первых MAX_SESSION_SIZE невыученных слов
      const initialBatch = remainingList.slice(0, MAX_SESSION_SIZE);
      setSessionList(initialBatch);
    }
  }, [remainingList, sessionList.length]);

  // 3. Проверка завершения сессии (теперь только по sessionList)
  useEffect(() => {
    if (sessionList.length > 0 && index >= sessionList.length) {
      setIsSessionComplete(true);
      setIndex(0); // Сброс индекса для модального окна/повтора
      setFlipped(false);
    }
  }, [index, sessionList.length]);

  // Функции навигации
  const next = useCallback(() => {
    setFlipped(false);
    // Переход к следующему индексу в рамках sessionList, если он не последний
    if (index < sessionList.length) {
      setIndex((i) => i + 1);
    }
  }, [sessionList.length, index]);

  const prev = useCallback(() => {
    setFlipped(false);
    setIndex((i) => (i - 1 >= 0 ? i - 1 : sessionList.length - 1));
  }, [sessionList.length]);

  // !!! КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Убираем markLearned, просто переходим к следующему слову
  const handleKnow = () => {
    if (current) {
      // 🆕 markLearned здесь, чтобы слово сразу ушло из пула
      dispatch(markLearned({ word: current }));
      next();
    }
  };

  const handleFlip = () => setFlipped((f) => !f);

  // Функции для модального окна
  const handleRestartSession = () => {
    setIsSessionComplete(false);
    setIndex(0);
    setFlipped(false);

    // При перезапуске, берем новый батч из актуального remainingList
    // remainingList уже обновлен, если пользователь отметил слова как "знаю"
    const newBatch = remainingList.slice(0, MAX_SESSION_SIZE);

    if (newBatch.length > 0) {
      setSessionList(newBatch);
    } else {
      // Если remainingList пуст, то все выучено
      setSessionList([]);
    }
  };

  const handleCloseModal = () => {
    // Переход на страницу урока
    navigate(`/lesson/${lessonId}`);
  };

  // Функция для кнопки "Назад"
  const handleGoBack = () => {
    navigate(`/lesson/${lessonId}`);
  };

  // 1. Если все слова из remainingList уже выучены
  if (remainingList.length === 0 && list && list.length > 0)
    return (
      <div className="p-12 text-green-600 text-center text-xl font-semibold bg-white rounded-xl shadow-lg m-6 dark:bg-gray-800 dark:text-green-400 dark:shadow-2xl">
        <span role="img" aria-label="party popper" className="text-3xl">
          🎉
        </span>{" "}
        Отлично! Все слова этого урока выучены.
      </div>
    );

  // 2. Если сессия завершена, показываем модальное окно
  if (isSessionComplete) {
    // Если после просмотра батча невыученных слов не осталось, показываем финальное сообщение
    // ⚠️ Примечание: totalRemaining нужно пересчитать после сессии
    if (totalRemaining === 0) {
      return (
        <div className="p-12 text-green-600 text-center text-xl font-semibold bg-white rounded-xl shadow-lg m-6 dark:bg-gray-800 dark:text-green-400 dark:shadow-2xl">
          <span role="img" aria-label="party popper" className="text-3xl">
            🎉
          </span>{" "}
          Отлично! Все слова этого урока выучены.
        </div>
      );
    }

    return (
      <StudyCompletionModal
        wordsToLearn={sessionList}
        onRestart={handleRestartSession}
        onClose={handleCloseModal}
        modeName={`Флеш-карты (Батч ${MAX_SESSION_SIZE})`}
        remainingCount={totalRemaining}
      />
    );
  }

  // 3. Если нет текущего слова (загрузка или пустой sessionList)
  if (!current) return null;

  // Основной рендеринг
  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)] dark:bg-gray-900 transition-colors duration-300">
      {/* Кнопка Назад */}
      <div className="w-full max-w-sm mb-4 self-center">
        <button
          onClick={handleGoBack}
          className="flex items-center text-sky-700 hover:text-sky-800 transition font-semibold dark:text-sky-400 dark:hover:text-sky-300"
        >
          <HiArrowLeft className="w-6 h-6 mr-1" />
          <span className="hidden sm:inline">
            К уроку {lessonId.toUpperCase()}
          </span>
        </button>
      </div>

      {/* Прогресс */}
      <div className="w-full max-w-sm mb-6 text-center">
        <div className="text-sm font-medium text-gray-600 mb-2 dark:text-gray-400">
          Прогресс **батча**: {index + 1} из {sessionList.length}
          <span className="block text-xs text-gray-400 mt-1 dark:text-gray-500">
            Осталось всего невыученных: {totalRemaining}
          </span>
        </div>
        {/* Индикатор прогресса */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / sessionList.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 3D Флешкарта */}
      <div
        style={flipCardStyles}
        onClick={handleFlip}
        className="cursor-pointer mb-8"
      >
        <div
          style={{
            ...flipCardInnerStyles,
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Передняя сторона (Немецкий) */}
          <div
            style={flipCardFaceStyles}
            className="bg-sky-500 text-white shadow-xl flex-col"
          >
            <span className="text-4xl font-bold mb-4">{current.de}</span>

            {/* ✅ ИНТЕГРАЦИЯ AUDIO PLAYER */}
            <AudioPlayer
              textToSpeak={current.de}
              lang="de-DE"
              className="!text-white !bg-sky-600 hover:!bg-sky-700 p-3 rounded-full"
              title={`Прослушать ${current.de}`}
            />
          </div>

          {/* Задняя сторона (Русский) */}
          <div
            style={{ ...flipCardFaceStyles, transform: "rotateY(180deg)" }}
            className="bg-white text-gray-800 shadow-xl border-2 border-sky-500 dark:bg-gray-700 dark:text-gray-50 dark:border-sky-600"
          >
            <span className="text-4xl font-bold">{current.ru}</span>
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm">
        {/* Кнопка "Перевернуть" */}
        <button
          onClick={handleFlip}
          className="flex items-center justify-center w-full sm:w-auto px-4 py-3 bg-sky-200 text-sky-800 rounded-xl font-semibold hover:bg-sky-300 transition duration-150 dark:bg-sky-800 dark:text-sky-300 dark:hover:bg-sky-700"
        >
          <HiOutlineRefresh className="w-5 h-5 mr-2" />
          {flipped ? "Скрыть перевод" : "Перевернуть"}
        </button>

        {/* Кнопки навигации */}
        <div className="flex justify-between w-full sm:w-auto sm:space-x-3 mt-3 sm:mt-0">
          <button
            onClick={prev}
            disabled={sessionList.length <= 1}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-white rounded-xl shadow-md text-gray-600 font-semibold hover:bg-gray-100 transition duration-150 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:shadow-none"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span className="ml-2 hidden sm:inline">Назад</span>
          </button>
          <button
            onClick={next}
            disabled={sessionList.length <= 1}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-white rounded-xl shadow-md text-gray-600 font-semibold hover:bg-gray-100 transition duration-150 disabled:opacity-50 ml-3 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:shadow-none"
          >
            <span className="mr-2 hidden sm:inline">
              {index === sessionList.length - 1 ? "Завершить" : "Далее"}
            </span>
            <HiArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Кнопка "Выучено" */}
        <button
          onClick={handleKnow}
          className="w-full mt-3 sm:mt-0 px-4 py-3 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition duration-150 dark:bg-green-700 dark:hover:bg-green-800"
        >
          <div className="flex items-center justify-center">
            <HiCheck className="w-6 h-6 mr-2" />Я знаю это слово! (Скип)
          </div>
        </button>
      </div>
    </div>
  );
}
