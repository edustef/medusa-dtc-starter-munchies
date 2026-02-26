import { i18n } from "./helpers";

export const TESTIMONIALS_SECTION_QUERY = /* groq */ `{
    ...,
    "title": ${i18n("title")},
    testimonials[] -> {
      ...,
      "quote": ${i18n("quote")},
    }
}`;

export const SECTIONS_BODY_FRAGMENT = /* groq */ `{
    ...,
    _type == "section.testimonials" => ${TESTIMONIALS_SECTION_QUERY},
    _type == "section.hero" => {
      ...,
      "title": ${i18n("title")},
      "subtitle": ${i18n("subtitle")},
      cta {
        ...,
        "label": ${i18n("label")},
      },
    },
    _type == "section.centeredText" => {
      ...,
      "text": ${i18n("text")},
    },
    _type == "section.mediaText" => {
      ...,
      "title": ${i18n("title")},
      "description": ${i18n("description")},
    },
    _type == "section.featuredProducts" => {
      ...,
      "title": ${i18n("title")},
      cta {
        ...,
        "label": ${i18n("label")},
      },
    },
    _type == "section.assurance" => {
      ...,
      "title": ${i18n("title")},
      cards[] {
        ...,
        "title": ${i18n("title")},
        "description": ${i18n("description")},
      },
    },
    _type == "section.collectionList" => {
      ...,
      "title": ${i18n("title")},
      cards[] {
        ...,
        cta {
          ...,
          "label": ${i18n("label")},
        },
      },
    },
    _type == "section.shopTheLook" => {
      ...,
      "title": ${i18n("title")},
    },
    _type == "section.marquee" => {
      ...,
      "text": ${i18n("text")},
    },
}`;
