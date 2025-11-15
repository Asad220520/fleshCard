import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { store } from "./store/store";
import Header from "./components/Header";
import LessonsList from "./pages/LessonsList";
import LearnedWords from "./pages/LearnedWords";
import LessonWords from "./pages/LessonWords";

/* Главная страница урока */
import LessonPage from "./pages/LessonPage";
/* Отдельные страницы режимов */
import FlashCardsMode from "./features/LessonModes/FlashCardsMode";
import QuizMode from "./features/LessonModes/QuizMode";
import MatchingMode from "./features/LessonModes/MatchingMode";
import WritingMode from "./features/LessonModes/WritingMode";
import ListWords from "./features/LessonModes/ListWords";

import { useTheme } from "./context/ThemeContext.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import SentencePuzzle from "./features/LessonModes/SentencePuzzle.jsx";
import AddLessonPage from "./pages/AddLessonPage.jsx";

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <div
          className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
        >
          <Header />
          <main className="flex-grow pb-20 md:pb-10">
            <Routes>
              <Route path="/" element={<LessonsList />} />
              <Route path="/learned" element={<LearnedWords />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/add-lesson" element={<AddLessonPage />} />

              <Route
                path="/learned/lesson/:lessonId"
                element={<LessonWords />}
              />
              {/* Главная страница урока */}
              <Route path="/lesson/:lessonId" element={<LessonPage />} />
              {/* Отдельные страницы режимов */}
              <Route
                path="/lesson/:lessonId/flashcards"
                element={<FlashCardsMode />}
              />
              <Route path="/lesson/:lessonId/quiz" element={<QuizMode />} />
              <Route
                path="/lesson/:lessonId/matching"
                element={<MatchingMode />}
              />
              <Route
                path="/lesson/:lessonId/writing"
                element={<WritingMode />}
              />
              <Route path="/lesson/:lessonId/words" element={<ListWords />} />
              <Route
                path="/lesson/:lessonId/sentence-puzzle"
                element={<SentencePuzzle />}
              />
            </Routes>
          </main>

          {/* <Footer /> */}
        </div>
      </Router>
    </Provider>
  );
}
