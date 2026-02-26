import { defineQuery } from "groq";

import { SECTIONS_BODY_FRAGMENT } from "./section";

const i18n = (field: string) =>
  `coalesce(${field}[_key == $language][0].value, ${field}[_key == "ro"][0].value)`;

export const MODULAR_PAGE_QUERY =
  defineQuery(`*[_type == "modular.page" && slugs[$language].current == $slug][0]{
  ...,
  "title": ${i18n("title")},
  sections[] ${SECTIONS_BODY_FRAGMENT},
}`);

export const HOME_QUERY = defineQuery(`*[_type == "home"][0]{
  ...,
  "title": ${i18n("title")},
  sections[] ${SECTIONS_BODY_FRAGMENT},
}`);

export const NOT_FOUND_PAGE_QUERY = defineQuery(
  `*[_type == "not.found"][0]{
  ...,
  "text": ${i18n("text")},
}`
);

export const COOKIE_BANNER_QUERY = defineQuery(
  `*[_type == "cookie.banner"][0]{
  ...,
  "title": ${i18n("title")},
  "description": ${i18n("description")},
  "rejectButton": ${i18n("rejectButton")},
  "acceptButton": ${i18n("acceptButton")},
}`
);

export const GLOBAL_QUERY = defineQuery(`{
  "fallbackOGImage": *[_type == "settings"][0].fallbackOgImage,
  "footer": *[_id == "footer" && _type == "footer"][0]{
    ...,
    "placeholder": ${i18n("placeholder")},
    "button": ${i18n("button")},
  },
  "header": *[_id == "header" && _type == "header"][0]{
    ...,
  },
}`);

export const ROUTE_QUERY = defineQuery(`
  *[
    slugs[$language].current == $slug
    || (_type == "home" && $slug == "/")
  ][0] {
    'routeData': {
      ...,
      'slugs': slugs,
    },
  }
`);

export const SITEMAP_QUERY = defineQuery(`
  *[
    (pathname.current != null && indexable)
  ] {
    pathname,
    slugs,
    "lastModified": _updatedAt,
  }
`);

export const TEXT_PAGE_QUERY = defineQuery(
  `*[_type == "text.page" && slugs[$language].current == $slug][0]{
  ...,
  "title": ${i18n("title")},
  "description": ${i18n("description")},
}`
);

export const CATEGORY_QUERY = defineQuery(
  `*[_type == "category" && slugs[$language].current == $slug][0]{
  _id,
  _type,
  "internalTitle": ${i18n("internalTitle")},
  slugs,
}`
);

export const FAQS_PAGE_QUERY = defineQuery(`*[_type == "faq.index"][0]{
  ...,
  "title": ${i18n("title")},
  "description": ${i18n("description")},
  "textTranslations": {
    "searchPlaceholder": ${i18n("textTranslations.searchPlaceholder")},
    "searchNoResults": ${i18n("textTranslations.searchNoResults")},
  },
  category[]-> {
    ...,
    "title": ${i18n("title")},
    questions[]-> {
      ...,
      "question": ${i18n("question")},
      "answer": ${i18n("answer")},
    }
  }
}`);

export const DICTIONARY_QUERY = defineQuery(`*[_type == "dictionary"][0]{
  ...,
  "noResultsText": ${i18n("noResultsText")},
  "noResultsDescription": ${i18n("noResultsDescription")},
}`);

export const PRODUCT_QUERY =
  defineQuery(`*[_type == "product" && slugs[$language].current == $handle][0]{
  ...,
  "addons": {
    "title": ${i18n("addons.title")},
    "products": addons.products,
  },
  "specs": specs[]{
    ...,
    "title": ${i18n("title")},
    "content": ${i18n("content")},
  },
  sections[] ${SECTIONS_BODY_FRAGMENT},
}`);
