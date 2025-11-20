import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MobileHeader from "./components/MobileHeader";
import LessonsList from "./pages/lessons/LessonsList.jsx"; // Компонент, который использует languageId
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
import FolderContentPage from "./pages/lessons/FolderContentPage.jsx";
import PremiumStatusPage from "./pages/PremiumStatusPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";

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
          <main className="flex-grow  md:pb-0">
            <Routes>
              {/* 1. ГЛАВНАЯ СТРАНИЦА (/) */}
              <Route path="/" element={<LessonsList />} />

              {/* 🟢 ДОБАВЛЕНО/ИСПРАВЛЕНО: Явный маршрут для /lessons-list */}
              {/* <Route path="/lessons-list" element={<LessonsList />} /> */}
              <Route
                path="/folder/:languageId"
                element={<FolderContentPage />}
              />
              {/* 2. ФИЛЬТРАЦИЯ ПО ЯЗЫКУ: /lessons-list/de */}
              <Route
                path="/lessons-list/:languageId"
                element={<LessonsList />}
              />
              <Route
                path="/lessons-list/:languageId/:lessonId"
                element={<LessonPage />}
              />

              {/* 3. СТРАНИЦА УРОКА: /lessons-list/de/moko */}

              {/* 4. СТРАНИЦА УРОКА (без указания языка, если вы используете такой роутинг) */}
              <Route path="/lesson/:lessonId" element={<LessonPage />} />

              {/* ... (Остальные маршруты) */}

              <Route path="/learned" element={<LearnedWords />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/add-lesson" element={<AddLessonPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route
                path="/edit-lesson/:editLessonId"
                element={<AddLessonPage />}
              />
              <Route
                path="/checkout"
                element={<Checkout />}
              />
              <Route
                path="/premium-status"
                element={<PremiumStatusPage />}
              />
              
              <Route
                path="/learned/lesson/:lessonId"
                element={<LessonWords />}
              />

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
          {/* 3. Нижняя панель навигации - Видна ТОЛЬКО на мобилке */}
          <MobileHeader />
        </div>
      </Router>
    </Provider>
  );
}
