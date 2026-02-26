import type { Language } from "@/i18n/languages";
import {
  $countryCode,
  $defaultCountryCode,
  $language,
  $pathname,
} from "@/stores/country";

interface Props {
  language: Language;
  countryCode: string;
  defaultCountryCode: string;
  pathname: string;
}

export function CountryInit(props: Props) {
  $language.set(props.language);
  $countryCode.set(props.countryCode);
  $defaultCountryCode.set(props.defaultCountryCode);
  $pathname.set(props.pathname);
  return null;
}
