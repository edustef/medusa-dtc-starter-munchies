import type { Language } from "./languages";
import { defaultLanguage } from "./languages";
import { canonicalizeSegment, localizeSegment } from "./routes";

export function getLocalizedPath(
  language: Language,
  canonicalPath: string
): string {
  if (
    canonicalPath.startsWith("http://") ||
    canonicalPath.startsWith("https://") ||
    canonicalPath.startsWith("#")
  ) {
    return canonicalPath;
  }
  const segments = canonicalPath.split("/").filter(Boolean);
  const localizedSegments = segments.map((seg, index) => {
    if (index === 0) {
      return localizeSegment(seg, language);
    }
    return seg;
  });
  return `/${language}/${localizedSegments.join("/")}`;
}

export function parseLocalizedPath(localizedPath: string): {
  language: Language;
  canonicalPath: string;
} {
  const segments = localizedPath.split("/").filter(Boolean);
  const language = (segments[0] as Language) ?? defaultLanguage;
  const rest = segments.slice(1);
  const canonicalSegments = rest.map((seg, index) => {
    if (index === 0) {
      return canonicalizeSegment(seg);
    }
    return seg;
  });
  const canonicalPath =
    canonicalSegments.length > 0 ? `/${canonicalSegments.join("/")}` : "/";
  return { language, canonicalPath };
}

export function getLocalizedHref(language: Language, href: string): string {
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("#")
  ) {
    return href;
  }
  if (href.startsWith("/ro/") || href.startsWith("/en/")) {
    return href;
  }
  return getLocalizedPath(language, href);
}
