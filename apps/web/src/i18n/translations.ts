import type { Language } from "./languages";

const translations: Record<string, Record<Language, string>> = {
  "shop.all": { ro: "Toate produsele", en: "Shop all products" },
  "cart.add": { ro: "Adauga in cos", en: "Add to cart" },
  "cart.title": { ro: "Cos de cumparaturi", en: "Shopping cart" },
};

export function t(key: string, language: Language): string {
  return translations[key]?.[language] ?? translations[key]?.ro ?? key;
}
