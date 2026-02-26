import { getLocalizedHref as i18nGetLocalizedHref } from "@/i18n/helpers";
import type { Language } from "@/i18n/languages";

interface Options {
  href: string;
  language: Language;
}

export function getLocalizedHref({ href, language }: Options): string {
  return i18nGetLocalizedHref(language, href);
}
