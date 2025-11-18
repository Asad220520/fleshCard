// store/words/index.js

import { combineReducers } from "@reduxjs/toolkit";

// 1. ПЕРЕИМЕНОВАННЫЙ ИМПОРТ: используем 'baseWordsActions' и 'baseProgressActions'
import wordsReducer, * as baseWordsActions from "./wordsSlice";
import progressReducer, * as baseProgressActions from "./progressSlice";

// Объединяем два редьюсера в один фичер-редьюсер 'words'
const combinedWordsReducer = combineReducers({
  navigation: wordsReducer,
  progress: progressReducer,
  
});

// 2. ЭКСПОРТ ДЕЙСТВИЙ: создаем единый объект wordsActions для экспорта
export const wordsActions = {
  ...baseWordsActions,
  ...baseProgressActions,
};

export default combinedWordsReducer;
