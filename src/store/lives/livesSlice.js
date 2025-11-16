// store/lives/livesSlice.js

import { createSlice } from "@reduxjs/toolkit";

const MAX_LIVES = 3;

const initialState = {
  count: MAX_LIVES,
  maxLives: MAX_LIVES,
};

export const livesSlice = createSlice({
  name: "lives",
  initialState,
  reducers: {
    loseLife: (state) => {
      if (state.count > 0) {
        state.count -= 1;
      }
    },

    resetLives: (state) => {
      state.count = state.maxLives;
    },

    // ❗ НОВОЕ ДЕЙСТВИЕ: Используется после подтверждения покупки
    restoreLives: (state) => {
      state.count = state.maxLives;
    },

    addLife: (state) => {
      if (state.count < state.maxLives) {
        state.count += 1;
      }
    },

    setLives: (state, action) => {
      state.count = action.payload.count;
    },
  },
});

export const { loseLife, resetLives, addLife, setLives, restoreLives } =
  livesSlice.actions;

export default livesSlice.reducer;
