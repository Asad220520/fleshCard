import React from "react";
import { Provider } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// Импорты компонентов
import MobileHeader from "./components/MobileHeader";
import Header from "./components/Header.jsx";
import LessonsList from "./pages/lessons/LessonsList.jsx";
import LessonWords from "./pages/LessonWords";
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
import PremiumStatusPage from "./pages/PremiumStatusPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";

// Импорт Redux store
import { store } from "./store/index.js";

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <div
          className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
        >
          <Header />

          <main className="flex-grow  md:pb-0">
            <Routes>
              {/* 🟢 1. МАРШРУТ ПАПОК: Главная страница (folderId = undefined) */}
              <Route path="/" element={<LessonsList />} />

              {/* 🟢 2. МАРШРУТ УРОКОВ: Уроки внутри папки (folderId читается из URL) */}
              <Route path="/lessons/:folderId" element={<LessonsList />} />

              {/* 3. ОСТАЛЬНЫЕ МАРШРУТЫ */}
              <Route path="/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/add-lesson" element={<AddLessonPage />} />
              <Route
                path="/edit-lesson/:editLessonId"
                element={<AddLessonPage />}
              />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/premium-status" element={<PremiumStatusPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route
                path="/learned/lesson/:lessonId"
                element={<LessonWords />}
              />

              {/* 4. РЕЖИМЫ ОБУЧЕНИЯ (Lesson Modes) */}
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

              {/* Дополнительный роут для перенаправления */}
              <Route
                path="/lessons-list"
                element={<Navigate to="/" replace />}
              />
              <Route path="*" element={<div>404 Страница не найдена</div>} />
            </Routes>
          </main>

          <MobileHeader />
        </div>
      </Router>
    </Provider>
  );
}
