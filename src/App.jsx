import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { store } from "./store/store";
import Header from "./components/Header";
// import Footer from "./components/Footer"; // Закомментировано
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

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen">
          <Header />
          <main className="flex-grow pb-16">
            <Routes>
              <Route path="/" element={<LessonsList />} />
              <Route path="/learned" element={<LearnedWords />} />
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
            </Routes>
          </main>

          {/* <Footer /> */}
        </div>
      </Router>
    </Provider>
  );
}
