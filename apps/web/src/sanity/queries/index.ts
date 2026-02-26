import { defineQuery } from "groq";

import { i18n, i18nPt } from "./helpers";
import { SECTIONS_BODY_FRAGMENT } from "./section";

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
  cta {
    ...,
    "label": ${i18n("label")},
  },
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
    "copy": ${i18nPt("copy")},
    "signup_success": ${i18nPt("signup_success")},
    "signup_error": ${i18nPt("signup_error")},
    "footnote": ${i18nPt("footnote")},
    information[] {
      ...,
      "text": ${i18nPt("text")},
    },
    linkList[] {
      ...,
      links[] {
        ...,
        "label": ${i18n("label")},
      },
    },
    bottomLinks[] {
      ...,
      "label": ${i18n("label")},
    },
    socialLinks[] {
      ...,
      "label": ${i18n("label")},
    },
  },
  "header": *[_id == "header" && _type == "header"][0]{
    ...,
    "announcementText": ${i18nPt("announcementText")},
    navigation[] {
      ...,
      _type == "navLink" => {
        ...,
        cta {
          ...,
          "label": ${i18n("label")},
        },
      },
      _type == "dropdown" => {
        ...,
        "title": ${i18n("title")},
        columns[] {
          ...,
          "title": ${i18n("title")},
          links[] {
            ...,
            "label": ${i18n("label")},
          },
        },
        cards[] {
          ...,
          "title": ${i18n("title")},
          cta {
            ...,
            "label": ${i18n("label")},
          },
        },
      },
    },
  },
}`);

export const ROUTE_QUERY = defineQuery(`
  *[
    (slugs[$language].current == $slug && !($slug == "/" && _type != "home"))
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
  "body": ${i18nPt("body")},
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
