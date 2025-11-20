import { createSlice } from "@reduxjs/toolkit";

const MAX_LIVES = 3;

const initialState = {
  count: MAX_LIVES,
  maxLives: MAX_LIVES,
  isUnlimited: false, // 💡 Флаг для безлимитных жизней
};

export const livesSlice = createSlice({
  name: "lives",
  initialState,
  reducers: {
    loseLife: (state) => {
      // ⚠️ Жизни теряются только, если пользователь НЕ в безлимитном режиме
      if (!state.isUnlimited && state.count > 0) {
        state.count -= 1;
      }
    },

    resetLives: (state) => {
      state.count = state.maxLives;
      // При сбросе игры/таймера, isUnlimited остается как есть (подписка активна или нет)
    },

    // 🚀 КЛЮЧЕВОЕ ДЕЙСТВИЕ: Используется после подтверждения подписки через код
    restoreLives: (state) => {
      state.count = state.maxLives; // Восстанавливаем жизни до максимума
      state.isUnlimited = true; // 🚀 АКТИВИРУЕМ БЕЗЛИМИТНЫЕ ЖИЗНИ
    },

    addLife: (state) => {
      if (state.count < state.maxLives) {
        state.count += 1;
      }
    },

    setLives: (state, action) => {
      state.count = action.payload.count;
    },

    // Опциональное действие для отмены подписки (например, по истечении срока)
    deactivateUnlimited: (state) => {
      state.isUnlimited = false;
    },
  },
});

export const {
  loseLife,
  resetLives,
  addLife,
  setLives,
  restoreLives,
  deactivateUnlimited,
} = livesSlice.actions;

export default livesSlice.reducer;
