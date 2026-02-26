import {
  PUBLIC_SANITY_STUDIO_DATASET,
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
} from "astro:env/client";
import { SANITY_TOKEN } from "astro:env/server";
import { defaultLanguage, supportedLanguages } from "./i18n/languages";

const isDev = process.env.NODE_ENV === "development";

const config = {
  baseUrl: isDev
    ? "http://localhost:3000"
    : "https://solaredge-supply.million-tinloof.com",
  defaultCountryCode: "ro",
  defaultLanguage,
  // Supported country codes - paths not matching these will use default
  supportedCountryCodes: [
    "ro",
    "dk",
    "fr",
    "de",
    "es",
    "jp",
    "gb",
    "ca",
    "dz",
    "ar",
    "za",
    "mx",
    "my",
    "au",
    "nz",
    "br",
  ],
  supportedLanguages,
  sanity: {
    apiVersion: "2026-01-16",
    dataset: PUBLIC_SANITY_STUDIO_DATASET,
    projectId: PUBLIC_SANITY_STUDIO_PROJECT_ID,
    studioUrl: "/cms",
    // Not exposed to the front-end, used solely by the server
    token: SANITY_TOKEN,
  },
  title: "SolarEdge Supply",
  description:
    "Premium solar panels and equipment for your energy independence",
};

export default config;
