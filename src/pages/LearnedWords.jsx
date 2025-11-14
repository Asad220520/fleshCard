import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function LearnedWords() {
  const { learned } = useSelector((state) => state.words);

  if (learned.length === 0)
    return (
      <div className="p-6 text-center text-gray-500">
        Пока нет выученных слов.
      </div>
    );

  // Собираем уроки, из которых есть выученные слова
  const lessonsMap = learned.reduce((acc, word) => {
    if (!acc[word.lessonId]) acc[word.lessonId] = [];
    acc[word.lessonId].push(word);
    return acc;
  }, {});

  return (
    <div className="p-6 flex flex-col items-center w-full max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Мои слова</h1>

      {Object.keys(lessonsMap).map((lessonId) => (
        <Link
          key={lessonId}
          to={`/learned/lesson/${lessonId}`}
          className="w-full p-4 mb-3 bg-sky-200 rounded-xl shadow hover:bg-sky-300 flex justify-between items-center"
        >
          <span className="font-semibold">Урок {lessonId.toUpperCase()}</span>
          <span className="text-gray-600">
            {lessonsMap[lessonId].length} слов
          </span>
        </Link>
      ))}
    </div>
  );
}
