export const languages = [
  { id: "ro", title: "Romana" },
  { id: "en", title: "English" },
] as const;

export type Language = (typeof languages)[number]["id"];

export const defaultLanguage: Language = "ro";
export const supportedLanguages: Language[] = languages.map((l) => l.id);
