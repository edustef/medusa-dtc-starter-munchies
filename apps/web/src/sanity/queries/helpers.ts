/** Resolve an internationalized array field (internationalizedArrayString/Text) */
export const i18n = (field: string) =>
  `coalesce(${field}[_key == $language][0].value, ${field}[_key == "ro"][0].value)`;

/** Resolve an i18n portable text field (object with { ro, en } keys) */
export const i18nPt = (field: string) =>
  `coalesce(${field}[$language], ${field}.ro)`;
