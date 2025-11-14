import { lessonsList } from "../data";
import { Link } from "react-router-dom";

export default function LessonsList() {
  return (
    <div className="p-4 flex flex-col items-center min-h-screen bg-sky-50">
      <h1 className="text-3xl font-bold mb-6 text-center">Выберите урок</h1>

      <div className="w-full max-w-sm flex flex-col gap-4">
        {lessonsList.map((lesson) => (
          <Link
            key={lesson}
            to={`/lesson/${lesson}`}
            className="px-6 py-4 text-lg font-semibold bg-white shadow-md rounded-xl 
                       active:scale-[0.97] transition-all duration-150 
                       hover:bg-sky-100 text-center touch-manipulation"
          >
            {lesson.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}
