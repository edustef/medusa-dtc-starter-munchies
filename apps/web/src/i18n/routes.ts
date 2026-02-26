import type { Language } from "./languages";

export const routeSegments: Record<string, Record<Language, string>> = {
  products: { ro: "produse", en: "products" },
  checkout: { ro: "finalizare", en: "checkout" },
  order: { ro: "comanda", en: "order" },
  confirmed: { ro: "confirmata", en: "confirmed" },
  faqs: { ro: "intrebari", en: "faqs" },
};

const reverseLookup: Record<string, string> = {};
for (const [canonical, translations] of Object.entries(routeSegments)) {
  for (const localized of Object.values(translations)) {
    reverseLookup[localized] = canonical;
  }
}

export function localizeSegment(
  canonical: string,
  language: Language,
): string {
  return routeSegments[canonical]?.[language] ?? canonical;
}

export function canonicalizeSegment(localized: string): string {
  return reverseLookup[localized] ?? localized;
}
