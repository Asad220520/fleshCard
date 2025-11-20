import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Временная метка последнего проигрыша (null, если игра активна)
  gameOverTimestamp: null,
  // Максимальное время ожидания (5 минут в миллисекундах)
  cooldownDuration: 1 * 60 * 1000,
};

const gameStateSlice = createSlice({
  name: "gameState",
  initialState,
  reducers: {
    // Устанавливает временную метку при Game Over
    setGameOver: (state, action) => {
      state.gameOverTimestamp = action.payload.timestamp;
    },
    // Сбрасывает состояние Game Over (используется при истечении таймера/покупке)
    clearGameOver: (state) => {
      state.gameOverTimestamp = null;
    },
  },
});

export const { setGameOver, clearGameOver } = gameStateSlice.actions;
export default gameStateSlice.reducer;
