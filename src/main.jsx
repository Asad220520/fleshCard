// index.js (или корневой файл)

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
// ❗ ИМПОРТЫ ДЛЯ REDUX
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
// ❗ Импортируем настроенный store и persistor
import { store, persistor } from "./store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      {/* PersistGate ждет загрузки состояния из localStorage */}
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
