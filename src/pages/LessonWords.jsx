import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { removeLearned } from "../store/store";

// ✅ 1. Оставляем только чистый импорт
// Убедитесь, что этот путь ведет к компоненту AudioPlayer, использующему TTS (textToSpeak)
import AudioPlayer from "../components/AudioPlayer";

// ✅ 2. Удаляем HiVolumeUp из импорта, если он используется внутри AudioPlayer
// Иконки, которые используются в LessonWords:
import {
  HiTrash,
  HiCheckCircle,
  HiOutlineAnnotation,
  HiArrowLeft,
  HiBookOpen,
} from "react-icons/hi";

// ❌ УДАЛЕНА ИМИТАЦИЯ: const AudioPlayer = ({ audioUrl }) => { ... };

export default function LessonWords() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { learned } = useSelector((state) => state.words);

  const [selectedWords, setSelectedWords] = useState([]);

  const words = learned.filter((w) => w.lessonId === lessonId);

  // --- Обработчики действий ---

  const handleToggleSelect = (word) => {
    const wordKey = `${word.de}-${word.lessonId}`;

    if (selectedWords.some((w) => `${w.de}-${w.lessonId}` === wordKey)) {
      setSelectedWords(
        selectedWords.filter((w) => `${w.de}-${w.lessonId}` !== wordKey)
      );
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleRemoveSelected = () => {
    selectedWords.forEach((word) => {
      dispatch(removeLearned(word));
    });
    setSelectedWords([]);
  };

  const handleRemoveAll = () => {
    if (
      window.confirm(
        `Вы уверены, что хотите удалить ${
          words.length
        } выученных слов из урока ${lessonId.toUpperCase()}?`
      )
    ) {
      words.forEach((word) => {
        dispatch(removeLearned(word));
      });
      setSelectedWords([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedWords.length === words.length) {
      setSelectedWords([]);
    } else {
      setSelectedWords([...words]);
    }
  };

  // --- UI Рендеринг ---

  if (words.length === 0)
    return (
      <div className="p-12 text-center text-gray-500 bg-gray-50 min-h-[50vh]">
        <div className="p-8 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
          <h2 className="text-xl font-bold text-gray-700">Список пуст</h2>
          <p className="mt-2 text-gray-600">
            Все слова из этого урока были удалены или еще не выучены.
          </p>
          <Link
            to="/learned"
            className="mt-4 inline-block px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition"
          >
            ← Назад к урокам
          </Link>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 w-full bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Улучшенный Заголовок и Навигация */}
      <div className="w-full max-w-lg mb-6 flex justify-between items-center">
        {/* Кнопка "Назад" */}
        <button
          onClick={() => navigate("/learned")}
          className="flex items-center text-sky-700 hover:text-sky-800 transition font-semibold"
        >
          <HiArrowLeft className="w-6 h-6 mr-1" />
          <span className="hidden sm:inline">Назад к урокам</span>
        </button>

        {/* Название урока */}
        <div className="flex items-center text-lg sm:text-2xl font-extrabold text-gray-800">
          <HiBookOpen className="w-6 h-6 mr-2 text-sky-600" />
          <span>Урок {lessonId.toUpperCase()}</span>
        </div>
      </div>

      {/* Групповые действия */}
      <div className="w-full max-w-lg mb-6 flex flex-col sm:flex-row justify-end items-center gap-3">
        <div className="flex gap-3">
          {/* Кнопка "Удалить выбранное" */}
          <button
            onClick={handleRemoveSelected}
            disabled={selectedWords.length === 0}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl shadow-md font-semibold hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            title="Удалить выбранные слова"
          >
            <HiTrash className="w-5 h-5 mr-1" />
            Удалить ({selectedWords.length})
          </button>

          {/* Кнопка "Удалить все" */}
          <button
            onClick={handleRemoveAll}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl shadow-md font-semibold hover:bg-red-600 transition"
            title="Удалить все слова из этого урока"
          >
            <HiTrash className="w-5 h-5" />
            <span className="ml-1 hidden sm:inline">Удалить все</span>
          </button>
        </div>
      </div>

      {/* Кнопка Выбрать/Снять все */}
      <div className="w-full max-w-lg mb-4 flex justify-end">
        <button
          onClick={handleSelectAll}
          className="flex items-center text-sm text-sky-700 hover:text-sky-800 transition"
        >
          {selectedWords.length === words.length && words.length > 0 ? (
            <>
              <HiCheckCircle className="w-5 h-5 mr-1" /> Снять все
            </>
          ) : (
            <>
              <HiOutlineAnnotation className="w-5 h-5 mr-1" /> Выбрать все
            </>
          )}
        </button>
      </div>

      {/* Список слов */}
      <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
        {words.map((word) => {
          const isSelected = selectedWords.some(
            (w) => w.de === word.de && w.lessonId === word.lessonId
          );

          return (
            <div
              key={`${word.de}-${word.lessonId}`}
              className={`p-4 rounded-xl shadow-md flex justify-between items-center cursor-pointer transition duration-150 ${
                isSelected
                  ? "bg-sky-100 border-2 border-sky-500"
                  : "bg-white border-2 border-transparent hover:shadow-lg"
              }`}
              onClick={() => handleToggleSelect(word)} // Клик по карточке для выбора
            >
              <div className="flex items-center space-x-3">
                {/* Индикатор выбора */}
                {isSelected ? (
                  <HiCheckCircle className="w-6 h-6 text-sky-500" />
                ) : (
                  <HiOutlineAnnotation className="w-6 h-6 text-gray-400" />
                )}

                {/* Слова и компонент Аудио */}
                <div>
                  <div className="font-bold text-lg text-gray-800 flex items-center">
                    {word.de}
                    {/* Используем AudioPlayer с пропсом textToSpeak */}
                    <AudioPlayer textToSpeak={word.de} lang="de-DE" />
                  </div>
                  <div className="text-gray-600 text-sm">{word.ru}</div>
                </div>
              </div>

              {/* Кнопка "Удалить" (индивидуально) */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем срабатывание onClick родителя
                  dispatch(removeLearned(word));
                }}
                className="p-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
                title="Удалить это слово из выученных"
              >
                <HiTrash className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
