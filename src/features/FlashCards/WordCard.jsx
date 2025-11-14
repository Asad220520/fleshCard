import { useState } from "react";

export default function WordCard({ word }) {
  const [flipped, setFlipped] = useState(false);

  if (!word) return null;

  return (
    <div
      className="w-80 h-48 perspective cursor-pointer mb-8"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Передняя сторона */}
        <div className="absolute inset-0 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-semibold backface-hidden">
          {word.de}
        </div>

        {/* Задняя сторона */}
        <div className="absolute inset-0 bg-sky-100 rounded-2xl shadow-lg flex items-center justify-center text-2xl font-medium backface-hidden rotate-y-180">
          {word.ru}
        </div>
      </div>
    </div>
  );
}
