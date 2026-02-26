const i18n = (field: string) =>
  `coalesce(${field}[_key == $language][0].value, ${field}[_key == "ro"][0].value)`;

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
    },
    _type == "section.assurance" => {
      ...,
      "title": ${i18n("title")},
    },
    _type == "section.collectionList" => {
      ...,
      "title": ${i18n("title")},
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
