import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { selectLesson } from "../store/store";
import { lessons } from "../data";

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessons[lessonId]) {
      dispatch(selectLesson({ words: lessons[lessonId], lessonId }));
      setLoading(false);
    }
  }, [lessonId, dispatch]);

  if (loading)
    return (
      <div className="p-6 text-gray-500 text-center text-lg">Загрузка...</div>
    );

  return (
    <div className="p-4 flex flex-col items-center min-h-screen bg-sky-50">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {lessonId.toUpperCase()}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm">
        <button
          onClick={() => navigate(`/lesson/${lessonId}/flashcards`)}
          className="px-6 py-4 text-lg font-semibold bg-white shadow-md rounded-2xl 
                     active:scale-[0.97] transition-all duration-150 
                     hover:bg-sky-100 touch-manipulation"
        >
          Флешкарты
        </button>

        <button
          onClick={() => navigate(`/lesson/${lessonId}/quiz`)}
          className="px-6 py-4 text-lg font-semibold bg-white shadow-md rounded-2xl 
                     active:scale-[0.97] transition-all duration-150 
                     hover:bg-sky-100 touch-manipulation"
        >
          Учить варианты
        </button>

        <button
          onClick={() => navigate(`/lesson/${lessonId}/matching`)}
          className="px-6 py-4 text-lg font-semibold bg-white shadow-md rounded-2xl
                     active:scale-[0.97] transition-all duration-150 
                     hover:bg-sky-100 touch-manipulation"
        >
          Мэтчинг
        </button>

        <button
          onClick={() => navigate(`/lesson/${lessonId}/writing`)}
          className="px-6 py-4 text-lg font-semibold bg-white shadow-md rounded-2xl 
                     active:scale-[0.97] transition-all duration-150 
                     hover:bg-sky-100 touch-manipulation"
        >
          Письмо
        </button>
      </div>
    </div>
  );
}
