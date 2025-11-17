import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MobileHeader from "./components/MobileHeader"; // <-- Импорт нижнего хедера
import LearnedWords from "./pages/LearnedWords";
import LessonWords from "./pages/LessonWords";

/* Импорты страниц и режимов */
import LessonPage from "./pages/LessonPage";
import FlashCardsMode from "./features/LessonModes/FlashCardsMode";
import QuizMode from "./features/LessonModes/QuizMode";
import MatchingMode from "./features/LessonModes/MatchingMode";
import WritingMode from "./features/LessonModes/WritingMode";
import ListWords from "./features/LessonModes/ListWords";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import SentencePuzzle from "./features/LessonModes/SentencePuzzle.jsx";
import AddLessonPage from "./pages/AddLessonPage.jsx";
import Header from "./components/Header.jsx";
import { store } from "./store/index.js";
import Checkout from "./pages/Checkout.jsx";
import LessonsList from "./pages/cart/LessonsList.jsx";
import HomePage from "./pages/HomePage.jsx";

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <div
          className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
        >
          {/* 1. Верхний App Bar - Виден всегда */}
          <Header />
          {/* 2. Основной контент */}
          {/* pt-16 компенсирует ВЕРХНИЙ хедер.
             pb-[4.5rem] компенсирует НИЖНИЙ хедер (только на мобилке).
             md:pb-0 убирает нижний отступ на десктопе. */}
          {/* pt-16 pb-[4.5rem] */}
          <main className="flex-grow  md:pb-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/lessons-list/:languageId"
                element={<LessonsList />}
              />
              <Route path="/learned" element={<LearnedWords />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/lessons-list"
                element={<AddLessonPage />}
              />
              <Route
                path="/checkout/:product/:lessonId"
                element={<Checkout />}
              />
              <Route
                path="/learned/lesson/:lessonId"
                element={<LessonWords />}
              />
              {/* Главная страница урока */}
              <Route
                path="/lessons-list/:languageId/:lessonId"
                element={<LessonPage />}
              />
              {/* Отдельные страницы режимов */}
              <Route
                path="/lessons-list/:languageId/:lessonId/flashcards"
                element={<FlashCardsMode />}
              />
              <Route
                path="/lessons-list/:languageId/:lessonId/quiz"
                element={<QuizMode />}
              />
              <Route
                path="/lessons-list/:languageId/:lessonId/matching"
                element={<MatchingMode />}
              />
              <Route
                path="/lessons-list/:languageId/:lessonId/writing"
                element={<WritingMode />}
              />
              <Route
                path="/lessons-list/:languageId/:lessonId/words"
                element={<ListWords />}
              />
              <Route
                path="/lessons-list/:languageId/:lessonId/sentence-puzzle"
                element={<SentencePuzzle />}
              />
            </Routes>
          </main>
          {/* 3. Нижняя панель навигации - Видна ТОЛЬКО на мобилке */}
          <MobileHeader />
        </div>
      </Router>
    </Provider>
  );
}
