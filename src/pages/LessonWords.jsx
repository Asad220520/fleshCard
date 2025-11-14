import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { removeLearned } from "../store/store";

export default function LessonWords() {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const { learned } = useSelector((state) => state.words);

  const words = learned.filter((w) => w.lessonId === lessonId);

  if (words.length === 0)
    return <div className="p-6 text-gray-500">Нет слов из этого урока</div>;

  return (
    <div className="p-6 flex flex-col items-center w-full max-w-xl">
      <h1 className="text-2xl font-bold mb-4">
        Слова урока {lessonId.toUpperCase()}
      </h1>

      <Link
        to="/learned"
        className="mb-4 px-4 py-2 bg-sky-200 rounded-xl hover:bg-sky-300"
      >
        ← Назад к урокам
      </Link>

      <div className="grid grid-cols-1 gap-3 w-full">
        {words.map((word, idx) => (
          <div
            key={idx}
            className="p-4 bg-green-100 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <span className="font-semibold mr-2">{word.de}</span>
              <span className="text-gray-700">{word.ru}</span>
            </div>
            <button
              onClick={() => dispatch(removeLearned(word))}
              className="px-3 py-1 bg-yellow-400 text-white rounded-xl hover:bg-yellow-500 text-sm"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
