// src/utils/filterLessonsByLanguage.js
export const filterLessonsByLanguage = (allLessonIds, languageId) => {
  if (!languageId) return allLessonIds;

  const lowerCaseId = languageId.toLowerCase();

  return allLessonIds.filter((id) => {
    if (
      (lowerCaseId === "de" || lowerCaseId === "german") &&
      (id === "moko" || id.startsWith("de_"))
    ) {
      return true;
    }

    // Английский: en_
    if (
      (lowerCaseId === "en" || lowerCaseId === "english") &&
      id.startsWith("en_")
    ) {
      return true;
    }

    // Испанский: es_
    if (
      (lowerCaseId === "es" || lowerCaseId === "spanish") &&
      id.startsWith("es_")
    ) {
      return true;
    }

    // Французский: fr_
    if (
      (lowerCaseId === "fr" || lowerCaseId === "french") &&
      id.startsWith("fr_")
    ) {
      return true;
    }

    // Итальянский: it_
    if (
      (lowerCaseId === "it" || lowerCaseId === "italian") &&
      id.startsWith("it_")
    ) {
      return true;
    }

    // Русский: ru_
    if (
      (lowerCaseId === "ru" || lowerCaseId === "russian") &&
      id.startsWith("ru_")
    ) {
      return true;
    }

    // Китайский: zh_
    if (
      (lowerCaseId === "zh" || lowerCaseId === "chinese") &&
      id.startsWith("zh_")
    ) {
      return true;
    }

    // Японский: ja_
    if (
      (lowerCaseId === "ja" || lowerCaseId === "japanese") &&
      id.startsWith("ja_")
    ) {
      return true;
    }

    // Корейский: ko_
    if (
      (lowerCaseId === "ko" || lowerCaseId === "korean") &&
      id.startsWith("ko_")
    ) {
      return true;
    }

    // Арабский: ar_
    if (
      (lowerCaseId === "ar" || lowerCaseId === "arabic") &&
      id.startsWith("ar_")
    ) {
      return true;
    }

    // Турецкий: tr_
    if (
      (lowerCaseId === "tr" || lowerCaseId === "turkish") &&
      id.startsWith("tr_")
    ) {
      return true;
    }

    // Общий префикс: первые 2 буквы
    const shortPrefix = lowerCaseId.substring(0, 2);
    if (id.startsWith(`${shortPrefix}_`)) {
      return true;
    }

    return false;
  });
};
