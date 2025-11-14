import { les1 } from "./les1.10слов";
import { les2 } from "./les2.10слов";

export const lessons = {
  les1,
  les2,
};

// Список уроков для отображения на главной странице
export const lessonsList = Object.keys(lessons); // ["les1", "les2"]
