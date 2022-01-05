export type Language = "en" | "es";

export function validateLanguage(language: any): language is Language {
  return language === "en" || language === "es";
}
