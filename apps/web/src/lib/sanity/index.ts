import type {
  DICTIONARY_QUERY_RESULT,
  FAQS_PAGE_QUERY_RESULT,
  GLOBAL_QUERY_RESULT,
  HOME_QUERY_RESULT,
  MODULAR_PAGE_QUERY_RESULT,
  NOT_FOUND_PAGE_QUERY_RESULT,
  PRODUCT_QUERY_RESULT,
  ROUTE_QUERY_RESULT,
  TEXT_PAGE_QUERY_RESULT,
} from "sanity.types";
import type { Language } from "@/i18n/languages";
import {
  CATEGORY_QUERY,
  COOKIE_BANNER_QUERY,
  DICTIONARY_QUERY,
  FAQS_PAGE_QUERY,
  GLOBAL_QUERY,
  HOME_QUERY,
  MODULAR_PAGE_QUERY,
  NOT_FOUND_PAGE_QUERY,
  PRODUCT_QUERY,
  ROUTE_QUERY,
  TEXT_PAGE_QUERY,
} from "@/sanity/queries";
import { sanityFetch } from "./sanity-fetch";

export function loadRoute(slug: string, language: Language) {
  return sanityFetch<ROUTE_QUERY_RESULT>({
    query: ROUTE_QUERY,
    params: { slug, language },
  });
}

export function loadModularPage(slug: string, language: Language) {
  return sanityFetch<MODULAR_PAGE_QUERY_RESULT>({
    query: MODULAR_PAGE_QUERY,
    params: { slug, language },
  });
}

export function loadHome(language: Language) {
  return sanityFetch<HOME_QUERY_RESULT>({
    query: HOME_QUERY,
    params: { language },
  });
}

export function loadGlobalData(language: Language) {
  return sanityFetch<GLOBAL_QUERY_RESULT>({
    query: GLOBAL_QUERY,
    params: { language },
  });
}

interface CategoryResult {
  _id: string;
  _type: "category";
  internalTitle: string | null;
  slugs: Record<string, { current: string } | null> | null;
}

export function loadCategory(slug: string, language: Language) {
  return sanityFetch<CategoryResult | null>({
    query: CATEGORY_QUERY,
    params: { slug, language },
  });
}

export async function loadPageByPathname(slug: string, language: Language) {
  const { result } = await loadRoute(slug, language);
  const documentType = result?.routeData._type;

  switch (documentType) {
    case "home":
      return loadHome(language);
    case "modular.page":
      return loadModularPage(slug, language);
    case "text.page":
      return loadTextPage(slug, language);
    case "category":
      return loadCategory(slug, language);
    default:
      return null;
  }
}

export function loadNotFound(language: Language) {
  return sanityFetch<NOT_FOUND_PAGE_QUERY_RESULT>({
    query: NOT_FOUND_PAGE_QUERY,
    params: { language },
  });
}

export function loadCookieBanner(language: Language) {
  return sanityFetch({
    query: COOKIE_BANNER_QUERY,
    params: { language },
  });
}

export function loadTextPage(slug: string, language: Language) {
  return sanityFetch<TEXT_PAGE_QUERY_RESULT>({
    query: TEXT_PAGE_QUERY,
    params: { slug, language },
  });
}

export function loadFaqs(language: Language) {
  return sanityFetch<FAQS_PAGE_QUERY_RESULT>({
    query: FAQS_PAGE_QUERY,
    params: { language },
  });
}

export function loadDictionary(language: Language) {
  return sanityFetch<DICTIONARY_QUERY_RESULT>({
    query: DICTIONARY_QUERY,
    params: { language },
  });
}

export function loadProductContent(handle: string, language: Language) {
  return sanityFetch<PRODUCT_QUERY_RESULT>({
    query: PRODUCT_QUERY,
    params: { handle, language },
  });
}
