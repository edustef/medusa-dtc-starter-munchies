import { useStore } from "@nanostores/react";
import { atom, computed } from "nanostores";
import type { Language } from "@/i18n/languages";
import { defaultLanguage } from "@/i18n/languages";

// Atoms
export const $language = atom<Language>(defaultLanguage);
export const $countryCode = atom<string>("");
export const $defaultCountryCode = atom<string>("");
export const $pathname = atom<string>("");

// Computed
export const $isDefaultCountry = computed(
  [$countryCode, $defaultCountryCode],
  (country, defaultCountry) => country === defaultCountry
);

// Helper to set all values at once
export function setCountryContext(config: {
  language: Language;
  countryCode: string;
  defaultCountryCode: string;
  pathname: string;
}) {
  $language.set(config.language);
  $countryCode.set(config.countryCode);
  $defaultCountryCode.set(config.defaultCountryCode);
  $pathname.set(config.pathname);
}
export function useCountryCode() {
  return useStore($countryCode);
}

export function useDefaultCountryCode() {
  return useStore($defaultCountryCode);
}

export function useIsDefaultCountry() {
  return useStore($isDefaultCountry);
}

export function useLanguage() {
  return useStore($language);
}

export function useCountryCodeContext() {
  return {
    language: useStore($language),
    countryCode: useStore($countryCode),
    defaultCountryCode: useStore($defaultCountryCode),
    pathname: useStore($pathname),
  };
}
