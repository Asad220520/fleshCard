import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { markLearned } from "../../store/store";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";

export default function FlashCardsMode() {
  const dispatch = useDispatch();
  const { list, learned } = useSelector((state) => state.words);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const remainingList = (list || []).filter(
    (w) => !learned.some((lw) => lw.de === w.de && lw.lessonId === w.lessonId)
  );

  useEffect(() => {
    if (remainingList.length === 0) setIndex(0);
    else if (index >= remainingList.length) setIndex(remainingList.length - 1);
  }, [remainingList.length, index]);

  const current = remainingList[index] || null;

  const learnedCount = learned.filter(
    (w) => w.lessonId === current?.lessonId
  ).length;

  const handlePrev = () => {
    setFlipped(false);
    setIndex((i) => (i > 0 ? i - 1 : 0));
  };

  const handleNext = () => {
    setFlipped(false);
    setIndex((i) => (i < remainingList.length - 1 ? i + 1 : i));
  };

  const handleMarkLearned = () => {
    if (!current) return;
    dispatch(markLearned({ word: current }));
    setIndex((i) => (i < remainingList.length - 1 ? i + 1 : i));
    setFlipped(false);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (!current)
    return (
      <div className="p-6 text-gray-500 text-center text-lg">
        Все слова этого урока выучены 🎉
      </div>
    );

  return (
    <div
      {...handlers}
      className="p-4 flex flex-col items-center min-h-screen bg-sky-50"
    >
      {/* Progress bar */}
      <div className="w-full max-w-sm h-2 bg-gray-300 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{
            width: `${((learnedCount + 1) / (list?.length || 1)) * 100}%`,
          }}
        />
      </div>

      {/* Card with flip animation */}
      <div className="w-full max-w-sm h-60 perspective-1000">
        <AnimatePresence exitBeforeEnter>
          <motion.div
            key={current.de}
            className="relative w-full h-full cursor-pointer"
            onClick={() => setFlipped(!flipped)}
            initial={{ rotateY: 180 }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <div
              className={`absolute w-full h-full backface-hidden flex items-center justify-center
                          bg-white shadow-md rounded-2xl p-6 text-2xl font-bold`}
            >
              {current.de}
            </div>

            {/* Back */}
            <div
              className={`absolute w-full h-full backface-hidden flex items-center justify-center
                          bg-sky-200 shadow-md rounded-2xl p-6 text-2xl font-semibold rotateY-180`}
            >
              {current.ru}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-sm mt-6">
        <button
          onClick={handleNext}
          className="w-full px-6 py-4 text-lg font-semibold bg-white shadow-md 
                     rounded-2xl active:scale-[0.97] transition-all duration-150 
                     hover:bg-sky-100 touch-manipulation"
          disabled={index === remainingList.length - 1}
        >
          Далее ➡
        </button>
        <button
          onClick={handlePrev}
          className="w-full px-6 py-4 text-lg font-semibold bg-white shadow-md 
                     rounded-2xl active:scale-[0.97] transition-all duration-150 
                     hover:bg-sky-100 touch-manipulation"
          disabled={index === 0}
        >
          ⬅ Назад
        </button>
      </div>

      {/* Learned button */}
      <button
        onClick={handleMarkLearned}
        className="mt-6 w-full max-w-sm px-6 py-4 text-lg font-semibold 
                   bg-green-600 text-white rounded-2xl shadow-md 
                   active:scale-[0.97] transition-all duration-150 
                   hover:bg-green-500 touch-manipulation"
      >
        Отметить как выученное
      </button>

      {/* Progress info */}
      <div className="mt-5 text-center text-gray-600">
        Карта <span className="font-semibold">{index + 1}</span> из{" "}
        <span className="font-semibold">{remainingList.length}</span>
      </div>
    </div>
  );
}
