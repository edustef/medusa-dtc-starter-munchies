# i18n Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Internationalize the Munchies storefront with Romanian (primary) and English, using Sanity internationalized-array plugin, translated URLs, and cookie-based region detection.

**Architecture:** Hybrid approach — static route segments translated via Astro config map, dynamic slugs stored as per-language fields in Sanity. Language always in URL (`/ro/...`, `/en/...`). Region in cookie (IP auto-detect). GROQ queries resolve i18n fields at query time so components stay unchanged.

**Tech Stack:** `@sanity/internationalized-array`, Astro 5 middleware, Sanity v5, Medusa v2, Cloudflare Workers

---

### Task 1: Create i18n configuration module

**Files:**
- Create: `apps/web/src/i18n/languages.ts`
- Create: `apps/web/src/i18n/routes.ts`
- Create: `apps/web/src/i18n/translations.ts`
- Create: `apps/web/src/i18n/helpers.ts`
- Create: `apps/web/src/i18n/index.ts`
- Modify: `apps/web/src/config.ts`

**Step 1: Create `apps/web/src/i18n/languages.ts`**

```typescript
export const languages = [
  { id: "ro", title: "Romana" },
  { id: "en", title: "English" },
] as const;

export type Language = (typeof languages)[number]["id"];

export const defaultLanguage: Language = "ro";
export const supportedLanguages: Language[] = languages.map((l) => l.id);
```

**Step 2: Create `apps/web/src/i18n/routes.ts`**

```typescript
import type { Language } from "./languages";

// Static route segment translations: canonical -> localized
export const routeSegments: Record<string, Record<Language, string>> = {
  products: { ro: "produse", en: "products" },
  checkout: { ro: "finalizare", en: "checkout" },
  order: { ro: "comanda", en: "order" },
  confirmed: { ro: "confirmata", en: "confirmed" },
  faqs: { ro: "intrebari", en: "faqs" },
};

// Reverse lookup: localized -> canonical (built at module load)
const reverseLookup: Record<string, string> = {};
for (const [canonical, translations] of Object.entries(routeSegments)) {
  for (const localized of Object.values(translations)) {
    reverseLookup[localized] = canonical;
  }
}

export function localizeSegment(
  canonical: string,
  language: Language
): string {
  return routeSegments[canonical]?.[language] ?? canonical;
}

export function canonicalizeSegment(localized: string): string {
  return reverseLookup[localized] ?? localized;
}
```

**Step 3: Create `apps/web/src/i18n/translations.ts`**

```typescript
import type { Language } from "./languages";

const translations: Record<string, Record<Language, string>> = {
  "shop.all": { ro: "Toate produsele", en: "Shop all products" },
  "cart.add": { ro: "Adauga in cos", en: "Add to cart" },
  "cart.title": { ro: "Cos de cumparaturi", en: "Shopping cart" },
};

export function t(key: string, language: Language): string {
  return translations[key]?.[language] ?? translations[key]?.ro ?? key;
}
```

**Step 4: Create `apps/web/src/i18n/helpers.ts`**

```typescript
import type { Language } from "./languages";
import { defaultLanguage } from "./languages";
import { canonicalizeSegment, localizeSegment } from "./routes";

/**
 * Build a localized URL path from a canonical path.
 * canonicalPath: "/products/chocolate-cookies" or "/"
 * Returns: "/ro/produse/chocolate-cookies" or "/en/products/chocolate-cookies"
 */
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
    // Only translate the first segment (the route type)
    if (index === 0) {
      return localizeSegment(seg, language);
    }
    return seg;
  });

  return `/${language}/${localizedSegments.join("/")}`;
}

/**
 * Parse a localized URL path into language + canonical path.
 * localizedPath: "/ro/produse/biscuiti"
 * Returns: { language: "ro", canonicalPath: "/products/biscuiti" }
 */
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
    canonicalSegments.length > 0
      ? `/${canonicalSegments.join("/")}`
      : "/";

  return { language, canonicalPath };
}

/**
 * For links: prepend language + translate first segment
 */
export function getLocalizedHref(
  language: Language,
  href: string
): string {
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("#")
  ) {
    return href;
  }

  // If href already starts with a language prefix, return as-is
  if (href.startsWith("/ro/") || href.startsWith("/en/")) {
    return href;
  }

  return getLocalizedPath(language, href);
}
```

**Step 5: Create `apps/web/src/i18n/index.ts`**

```typescript
export { defaultLanguage, languages, supportedLanguages } from "./languages";
export type { Language } from "./languages";
export { getLocalizedHref, getLocalizedPath, parseLocalizedPath } from "./helpers";
export { t } from "./translations";
export { canonicalizeSegment, localizeSegment, routeSegments } from "./routes";
```

**Step 6: Update `apps/web/src/config.ts` — add language config**

Add `supportedLanguages` and `defaultLanguage` to the config object, importing from the i18n module.

```typescript
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
    : "https://munchies.million-tinloof.com",
  defaultCountryCode: "ro",
  supportedCountryCodes: [
    "ro", "dk", "fr", "de", "es", "jp", "gb", "ca",
    "dz", "ar", "za", "mx", "my", "au", "nz", "br",
  ],
  defaultLanguage,
  supportedLanguages,
  sanity: {
    apiVersion: "2026-01-16",
    dataset: PUBLIC_SANITY_STUDIO_DATASET,
    projectId: PUBLIC_SANITY_STUDIO_PROJECT_ID,
    studioUrl: "/cms",
    token: SANITY_TOKEN,
  },
  title: "Munchies",
  description: "Delicious cookies delivered to your door",
};

export default config;
```

**Step 7: Commit**

```bash
git add apps/web/src/i18n/ apps/web/src/config.ts
git commit -m "feat: add i18n configuration module with languages, routes, translations, and helpers"
```

---

### Task 2: Install and configure @sanity/internationalized-array plugin

**Files:**
- Modify: `apps/web/package.json` (dependency)
- Modify: `apps/web/sanity.config.ts`

**Step 1: Install the plugin**

Run: `cd apps/web && pnpm add @sanity/internationalized-array`

**Step 2: Add plugin to `apps/web/sanity.config.ts`**

Add the import and plugin configuration:

```typescript
import { internationalizedArray } from "@sanity/internationalized-array";
```

Add to the plugins array:

```typescript
internationalizedArray({
  languages: [
    { id: "ro", title: "Romana" },
    { id: "en", title: "English" },
  ],
  defaultLanguages: ["ro"],
  fieldTypes: ["string", "text", "ptBody", "lightPtBody"],
}),
```

**Step 3: Commit**

```bash
git add apps/web/package.json apps/web/sanity.config.ts pnpm-lock.yaml
git commit -m "feat: install and configure @sanity/internationalized-array plugin"
```

---

### Task 3: Update Sanity object schemas for i18n

**Files:**
- Modify: `apps/web/src/sanity/schema/objects/cta.ts`
- Modify: `apps/web/src/sanity/schema/objects/seo.ts`

**Step 1: Update `cta.ts` — make `label` an internationalized array**

Change the `label` field from `type: "string"` to `type: "internationalizedArrayString"`:

```typescript
export const cta = defineType({
  fields: [
    {
      name: "label",
      title: "Button label",
      type: "internationalizedArrayString",
    },
    {
      name: "link",
      type: "link",
      validation: (Rule) =>
        Rule.custom((value, { parent }) => {
          const parentObj = parent as any;
          // Check if any language has a label value
          const hasLabel = Array.isArray(parentObj?.label)
            ? parentObj.label.some((l: any) => l.value)
            : parentObj?.label;
          if (hasLabel) {
            return value ? true : "Required";
          }
          return true;
        }),
    },
  ],
  icon: link.icon,
  name: "cta",
  title: "CTA",
  type: "object",
});
```

**Step 2: Update `seo.ts` — make `title` and `description` internationalized**

Change `title` from `type: "string"` to `type: "internationalizedArrayString"` and `description` from `type: "text"` to `type: "internationalizedArrayText"`:

```typescript
export const seo = defineField({
  fields: [
    {
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
    },
    {
      name: "description",
      rows: 2,
      title: "Short description for SEO & social sharing (meta description)",
      type: "internationalizedArrayText",
    },
    {
      name: "image",
      title: "Social sharing image",
      type: "ogImage",
    },
    {
      description:
        "Use this in case the content of this page is duplicated elsewhere and you'd like to point search engines to that other URL instead",
      name: "canonicalUrl",
      title: "Custom canonical URL",
      type: "url",
    },
  ],
  name: "seo",
  title: "SEO",
  type: "object",
});
```

Note: The `InputWithCharacterCount` component is removed since internationalized array fields have their own input. This can be re-added later as a custom component if needed.

**Step 3: Commit**

```bash
git add apps/web/src/sanity/schema/objects/
git commit -m "feat: update cta and seo object schemas for i18n"
```

---

### Task 4: Update Sanity section schemas for i18n

**Files:**
- Modify: `apps/web/src/sanity/schema/sections/hero.ts`
- Modify: `apps/web/src/sanity/schema/sections/assurance.ts`
- Modify: `apps/web/src/sanity/schema/sections/centered-text.ts`
- Modify: `apps/web/src/sanity/schema/sections/collection-list.ts`
- Modify: `apps/web/src/sanity/schema/sections/featured-products.ts`
- Modify: `apps/web/src/sanity/schema/sections/marquee.ts`
- Modify: `apps/web/src/sanity/schema/sections/media-text.ts`
- Modify: `apps/web/src/sanity/schema/sections/shop-the-look.ts`
- Modify: `apps/web/src/sanity/schema/sections/testimonials.ts`

**Step 1: Update each section's text fields to internationalized types**

For each section, change `type: "string"` to `type: "internationalizedArrayString"` and `type: "text"` to `type: "internationalizedArrayText"` for user-facing text fields.

**hero.ts** — fields `title` and `subtitle`:
- `title`: `type: "string"` → `type: "internationalizedArrayString"`
- `subtitle`: `type: "string"` → `type: "internationalizedArrayString"`

**assurance.ts** — field `title` + inline card fields `title` and `description`:
- Top-level `title`: `type: "string"` → `type: "internationalizedArrayString"`
- Card `title`: `type: "string"` → `type: "internationalizedArrayString"`
- Card `description`: `type: "text"` → `type: "internationalizedArrayText"`

**centered-text.ts** — field `text`:
- `text`: `type: "text"` → `type: "internationalizedArrayText"`

**collection-list.ts** — field `title`:
- `title`: `type: "string"` → `type: "internationalizedArrayString"`
(Card CTAs already handled by cta.ts i18n update)

**featured-products.ts** — field `title`:
- `title`: `type: "string"` → `type: "internationalizedArrayString"`

**marquee.ts** — field `text` (array of strings):
- `text`: This is `of: [{ type: "string" }]`. Change to `of: [{ type: "internationalizedArrayString" }]` — or simpler: make the entire text field an `internationalizedArrayString` and change it from array to a single i18n field. Recommend changing to a single `internationalizedArrayText` field since marquee text is typically one string repeated.

Actually, marquee has multiple text items. Keep as array but change each item: `of: [{ type: "internationalizedArrayString" }]`. However, internationalized-array types are objects, not primitives, so they can't go inside `of: []` directly. Instead, wrap each string in an object:

Better approach: change `text` to `type: "internationalizedArrayString"` as a single field, and let the marquee repeat it. Or keep the array and make each entry an object with an i18n string field. Simplest for MVP: single `internationalizedArrayText` field, marquee repeats the one text.

**media-text.ts** — fields `title` and `description`:
- `title`: `type: "string"` → `type: "internationalizedArrayString"`
- `description`: `type: "text"` → `type: "internationalizedArrayText"`

**shop-the-look.ts** — field `title`:
- `title`: `type: "string"` → `type: "internationalizedArrayString"`

**testimonials.ts** — field `title`:
- `title`: `type: "string"` → `type: "internationalizedArrayString"`

**Step 2: Commit**

```bash
git add apps/web/src/sanity/schema/sections/
git commit -m "feat: update all section schemas for i18n text fields"
```

---

### Task 5: Update Sanity document schemas for i18n

**Files:**
- Modify: `apps/web/src/sanity/schema/documents/product.ts`
- Modify: `apps/web/src/sanity/schema/documents/modular-page.ts`
- Modify: `apps/web/src/sanity/schema/documents/text-page.ts`
- Modify: `apps/web/src/sanity/schema/documents/category.ts`
- Modify: `apps/web/src/sanity/schema/documents/collection.ts`
- Modify: `apps/web/src/sanity/schema/documents/testimonial.tsx`

**Step 1: Update product.ts**

- `internalTitle`: stays as `type: "string"` (internal only, not displayed)
- `specs[].title`: `type: "string"` → `type: "internationalizedArrayString"`
- `specs[].content`: `type: "text"` → `type: "internationalizedArrayText"`
- `addons.title`: `type: "string"` → `type: "internationalizedArrayString"`

**Step 2: Update modular-page.ts**

- `title`: `type: "string"` → `type: "internationalizedArrayString"`

**Step 3: Update text-page.ts**

- `title`: `type: "string"` → `type: "internationalizedArrayString"`
- `description`: `type: "text"` → `type: "internationalizedArrayText"`
- `body`: `type: "ptBody"` — This is a Portable Text array. For i18n portable text, use a wrapper object with language-keyed fields, or use `internationalizedArray` with a custom type. The plugin supports custom field types if registered in `fieldTypes`. Since `ptBody` was registered in the plugin config, use `type: "internationalizedArrayPtBody"`.

**Step 4: Update category.ts**

- `internalTitle`: `type: "string"` → `type: "internationalizedArrayString"` (this is displayed as the category name on the storefront)

**Step 5: Update collection.ts**

- `internalTitle`: `type: "string"` → `type: "internationalizedArrayString"`

**Step 6: Update testimonial.tsx**

- `quote`: `type: "text"` → `type: "internationalizedArrayText"`
- `author`: stays as `type: "string"` (author name is not translated)

**Step 7: Commit**

```bash
git add apps/web/src/sanity/schema/documents/
git commit -m "feat: update all document schemas for i18n text fields"
```

---

### Task 6: Update Sanity singleton schemas for i18n

**Files:**
- Modify: `apps/web/src/sanity/schema/singletons/header.ts`
- Modify: `apps/web/src/sanity/schema/singletons/footer.ts`
- Modify: `apps/web/src/sanity/schema/singletons/home.ts`
- Modify: `apps/web/src/sanity/schema/singletons/dictionary.ts`
- Modify: `apps/web/src/sanity/schema/singletons/cookie-banner.ts`
- Modify: `apps/web/src/sanity/schema/singletons/not-found.ts`
- Modify: `apps/web/src/sanity/schema/singletons/faq.ts`

**Step 1: Update header.ts**

- `announcementText`: `type: "lightPtBody"` → `type: "internationalizedArrayLightPtBody"`
- Navigation link objects → the nested `cta` type is already i18n (from Task 3)
- Dropdown `title`: `type: "string"` → `type: "internationalizedArrayString"`
- Dropdown column `title`: `type: "string"` → `type: "internationalizedArrayString"`
- Dropdown card `title`: `type: "string"` → `type: "internationalizedArrayString"`

**Step 2: Update footer.ts**

- `information[].text`: `type: "ptBody"` → `type: "internationalizedArrayPtBody"`
- `copy`: `type: "ptBody"` → `type: "internationalizedArrayPtBody"`
- `signup_success`: `type: "ptBody"` → `type: "internationalizedArrayPtBody"`
- `signup_error`: `type: "ptBody"` → `type: "internationalizedArrayPtBody"`
- `placeholder`: `type: "string"` → `type: "internationalizedArrayString"`
- `button`: `type: "string"` → `type: "internationalizedArrayString"`
- `footnote`: `type: "ptBody"` → `type: "internationalizedArrayPtBody"`
- Link lists → the nested `cta` type is already i18n

**Step 3: Update home.ts**

- `title`: `type: "string"` → `type: "internationalizedArrayString"`

**Step 4: Update dictionary.ts**

- `noResultsText`: `type: "string"` → `type: "internationalizedArrayString"`
- `noResultsDescription`: `type: "string"` → `type: "internationalizedArrayString"`

**Step 5: Update cookie-banner.ts**

- `title`: `type: "string"` → `type: "internationalizedArrayString"`
- `description`: `type: "text"` → `type: "internationalizedArrayText"`
- `rejectButton`: `type: "string"` → `type: "internationalizedArrayString"`
- `acceptButton`: `type: "string"` → `type: "internationalizedArrayString"`

**Step 6: Update not-found.ts**

- `text`: `type: "string"` → `type: "internationalizedArrayString"`
- `cta` type is already i18n

**Step 7: Update faq.ts**

- `title`: `type: "string"` → `type: "internationalizedArrayString"`
- `description`: `type: "string"` → `type: "internationalizedArrayString"`
- `textTranslations.searchPlaceholder`: `type: "string"` → `type: "internationalizedArrayString"`
- `textTranslations.searchNoResults`: `type: "string"` → `type: "internationalizedArrayString"`

**Step 8: Commit**

```bash
git add apps/web/src/sanity/schema/singletons/
git commit -m "feat: update all singleton schemas for i18n text fields"
```

---

### Task 7: Add internationalized slug fields to page documents

**Files:**
- Modify: `apps/web/src/sanity/schema/documents/product.ts`
- Modify: `apps/web/src/sanity/schema/documents/modular-page.ts`
- Modify: `apps/web/src/sanity/schema/documents/text-page.ts`
- Modify: `apps/web/src/sanity/schema/documents/category.ts`
- Modify: `apps/web/src/sanity/schema/singletons/home.ts`

**Step 1: Add slug fields**

Each routable document currently gets a `pathname` field from the `extends: "page"` base type (from `@tinloof/sanity-extends`). We need to add per-language slug fields alongside it.

Add to each document a `slugs` field:

```typescript
{
  name: "slugs",
  title: "URL Slugs",
  type: "object",
  fields: [
    {
      name: "ro",
      title: "Romanian slug",
      type: "slug",
    },
    {
      name: "en",
      title: "English slug",
      type: "slug",
    },
  ],
  group: "settings",
}
```

For documents that extend `"page"` (modular-page, text-page, product, home), the existing `pathname` field stays for backwards compatibility during migration. The new `slugs` field is used for routing.

For `category` (which does NOT extend `"page"`), add the `slugs` field directly.

**Step 2: Commit**

```bash
git add apps/web/src/sanity/schema/documents/ apps/web/src/sanity/schema/singletons/
git commit -m "feat: add per-language slug fields to routable documents"
```

---

### Task 8: Update Astro types and middleware

**Files:**
- Modify: `apps/web/src/env.d.ts`
- Modify: `apps/web/src/middleware.ts`

**Step 1: Update `env.d.ts` — add `language` to Astro.locals**

```typescript
/// <reference path="../.astro/types.d.ts" />
/// <reference types="../worker-configuration.d.ts" />

interface CacheStorage {
  default: Cache;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    language: import("./i18n/languages").Language;
    countryCode: string;
    defaultCountryCode: string;
  }
}
```

**Step 2: Rewrite middleware**

Replace `countryCodeMiddleware` with `languageMiddleware` + `regionMiddleware`:

```typescript
import { defineMiddleware, sequence } from "astro:middleware";
import type { RequestContext } from "@/lib/context";
import config from "./config";
import type { Language } from "./i18n/languages";
import { defaultLanguage, supportedLanguages } from "./i18n/languages";
import { getTags, requestContext } from "./lib/context";

const BUILD_VERSION = import.meta.env.BUILD_VERSION;

const contextMiddleware = defineMiddleware((context, next) => {
  const ctx = context.locals.runtime?.ctx;
  const { cookies } = context;
  const tags = new Set<string>();
  return requestContext.run({ ctx, cookies, tags }, next);
});

const excludedPaths = [
  "/api", "/images", "/icons", "/cdn-cgi", "/favicon.ico",
  "/favicon-inactive.ico", "/_astro", "/_image", "/_server-islands", "/cms",
];

const cacheablePaths = ["/api/og"];

function isExcludedPath(pathname: string): boolean {
  const isCacheable = cacheablePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (isCacheable) return false;
  const match = excludedPaths.find(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  return !!match;
}

const languageMiddleware = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (isExcludedPath(pathname)) {
    context.locals.language = defaultLanguage;
    context.locals.countryCode = config.defaultCountryCode;
    context.locals.defaultCountryCode = config.defaultCountryCode;
    return next();
  }

  const parts = pathname.split("/").filter(Boolean);
  const firstPart = parts[0]?.toLowerCase();

  // Root "/" -> detect browser language and redirect
  if (!firstPart) {
    const acceptLanguage = context.request.headers.get("accept-language") ?? "";
    const preferredLanguage: Language = acceptLanguage.includes("ro")
      ? "ro"
      : "en";
    return context.redirect(`/${preferredLanguage}/`, 302);
  }

  // Check if first segment is a valid language
  const isValidLanguage = supportedLanguages.includes(firstPart as Language);

  if (!isValidLanguage) {
    // Not a language prefix -> redirect to default language
    return context.redirect(`/${defaultLanguage}${pathname}`, 302);
  }

  context.locals.language = firstPart as Language;
  return next();
});

const regionMiddleware = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (isExcludedPath(pathname)) {
    return next();
  }

  // Read region from cookie
  const regionCookie = context.cookies.get("region")?.value;

  if (regionCookie && config.supportedCountryCodes.includes(regionCookie)) {
    context.locals.countryCode = regionCookie;
  } else {
    // Auto-detect from Cloudflare cf-ipcountry header
    const cfCountry = context.request.headers
      .get("cf-ipcountry")
      ?.toLowerCase();
    const detectedCountry =
      cfCountry && config.supportedCountryCodes.includes(cfCountry)
        ? cfCountry
        : config.defaultCountryCode;

    context.locals.countryCode = detectedCountry;
    context.cookies.set("region", detectedCountry, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "lax",
    });
  }

  context.locals.defaultCountryCode = config.defaultCountryCode;
  return next();
});

// cachingMiddleware stays the same (unchanged from current code)

export const onRequest = sequence(
  contextMiddleware,
  languageMiddleware,
  regionMiddleware,
  cachingMiddleware
);
```

**Step 3: Commit**

```bash
git add apps/web/src/env.d.ts apps/web/src/middleware.ts
git commit -m "feat: rewrite middleware for language detection and cookie-based region"
```

---

### Task 9: Update localized link utility and component

**Files:**
- Modify: `apps/web/src/lib/utils/get-localized-href.ts`
- Modify: `apps/web/src/components/shared/localized-link.astro`

**Step 1: Rewrite `get-localized-href.ts`**

Replace the current implementation that uses countryCode with the i18n version:

```typescript
import type { Language } from "@/i18n/languages";
import { getLocalizedHref as i18nGetLocalizedHref } from "@/i18n/helpers";

interface GetLocalizedHrefParams {
  href: string;
  language: Language;
}

export function getLocalizedHref({
  href,
  language,
}: GetLocalizedHrefParams): string {
  return i18nGetLocalizedHref(language, href);
}
```

**Step 2: Update `localized-link.astro`**

Change from using `countryCode` to using `language`:

```astro
---
import type { HTMLAttributes } from "astro/types";
import { getLocalizedHref } from "@/lib/utils/get-localized-href";

type Props = HTMLAttributes<"a">;

const { href, ...rest } = Astro.props;

const localizedHref = getLocalizedHref({
  language: Astro.locals.language,
  href: href?.toString() ?? "",
});

const isExternalLink =
  href?.toString()?.startsWith("https://") ||
  href?.toString()?.startsWith("http://");
---

<a
  href={localizedHref}
  {...isExternalLink ? { target: "_blank", rel: "noopener noreferrer" } : {}}
  {...rest}
>
  <slot />
</a>
```

**Step 3: Update all other usages of the old `getLocalizedHref`**

Search for all imports of the old function signature and update them to pass `language` instead of `countryCode`/`defaultCountryCode`.

**Step 4: Commit**

```bash
git add apps/web/src/lib/utils/get-localized-href.ts apps/web/src/components/shared/localized-link.astro
git commit -m "feat: update localized link to use language instead of country code"
```

---

### Task 10: Update GROQ queries for i18n

**Files:**
- Modify: `apps/web/src/sanity/queries/index.ts`
- Modify: `apps/web/src/sanity/queries/section.ts`

**Step 1: Add i18n GROQ helper fragment**

Create a pattern for resolving internationalized array values. The `@sanity/internationalized-array` plugin stores values as:
```json
[{"_key": "ro", "value": "Romanian text"}, {"_key": "en", "value": "English text"}]
```

To resolve: `title[_key == $language][0].value` with fallback: `coalesce(title[_key == $language][0].value, title[_key == "ro"][0].value)`

**Step 2: Update all queries to accept `$language` parameter**

Update `ROUTE_QUERY` to look up by i18n slug:

```typescript
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
```

Update `HOME_QUERY`:
```typescript
export const HOME_QUERY = defineQuery(`*[_type == "home"][0]{
  ...,
  "title": coalesce(title[_key == $language][0].value, title[_key == "ro"][0].value),
  sections[] ${SECTIONS_BODY_FRAGMENT},
}`);
```

Update `MODULAR_PAGE_QUERY`:
```typescript
export const MODULAR_PAGE_QUERY =
  defineQuery(`*[_type == "modular.page" && slugs[$language].current == $slug][0]{
  ...,
  "title": coalesce(title[_key == $language][0].value, title[_key == "ro"][0].value),
  sections[] ${SECTIONS_BODY_FRAGMENT},
}`);
```

Update `TEXT_PAGE_QUERY`:
```typescript
export const TEXT_PAGE_QUERY = defineQuery(
  `*[_type == "text.page" && slugs[$language].current == $slug][0]{
  ...,
  "title": coalesce(title[_key == $language][0].value, title[_key == "ro"][0].value),
  "description": coalesce(description[_key == $language][0].value, description[_key == "ro"][0].value),
  "body": coalesce(body[_key == $language][0].value, body[_key == "ro"][0].value),
}`);
```

Update `CATEGORY_QUERY`:
```typescript
export const CATEGORY_QUERY = defineQuery(
  `*[_type == "category" && slugs[$language].current == $slug][0]{
  _id,
  _type,
  "internalTitle": coalesce(internalTitle[_key == $language][0].value, internalTitle[_key == "ro"][0].value),
  slugs,
}`);
```

Update `PRODUCT_QUERY`:
```typescript
export const PRODUCT_QUERY =
  defineQuery(`*[_type == "product" && slugs[$language].current == $handle][0]{
  ...,
  "addons": {
    "title": coalesce(addons.title[_key == $language][0].value, addons.title[_key == "ro"][0].value),
    "products": addons.products,
  },
  sections[] ${SECTIONS_BODY_FRAGMENT},
}`);
```

Update `GLOBAL_QUERY` to resolve i18n fields in header/footer:
```typescript
export const GLOBAL_QUERY = defineQuery(`{
  "fallbackOGImage": *[_type == "settings"][0].fallbackOgImage,
  "footer": *[_id == "footer" && _type == "footer"][0]{
    ...,
    "placeholder": coalesce(placeholder[_key == $language][0].value, placeholder[_key == "ro"][0].value),
    "button": coalesce(button[_key == $language][0].value, button[_key == "ro"][0].value),
  },
  "header": *[_id == "header" && _type == "header"][0]{
    ...,
  },
}`);
```

Note: Deep i18n resolution inside nested arrays (header navigation, footer links) is complex in GROQ. For MVP, resolve these in the Astro component layer using a helper function, or pass `$language` and resolve in the components.

**Step 3: Update `SECTIONS_BODY_FRAGMENT` in `section.ts`**

```typescript
export const SECTIONS_BODY_FRAGMENT = /* groq */ `{
    ...,
    _type == "section.testimonials" => {
      ...,
      "title": coalesce(title[_key == $language][0].value, title[_key == "ro"][0].value),
      testimonials[] -> {
        ...,
        "quote": coalesce(quote[_key == $language][0].value, quote[_key == "ro"][0].value),
      }
    },
    _type == "section.hero" => {
      ...,
      "title": coalesce(title[_key == $language][0].value, title[_key == "ro"][0].value),
      "subtitle": coalesce(subtitle[_key == $language][0].value, subtitle[_key == "ro"][0].value),
    },
    _type == "section.centeredText" => {
      ...,
      "text": coalesce(text[_key == $language][0].value, text[_key == "ro"][0].value),
    },
    _type == "section.mediaText" => {
      ...,
      "title": coalesce(title[_key == $language][0].value, title[_key == "ro"][0].value),
      "description": coalesce(description[_key == $language][0].value, description[_key == "ro"][0].value),
    },
    _type == "section.featuredProducts" => {
      ...,
      "title": coalesce(title[_key == $language][0].value, title[_key == "ro"][0].value),
    },
    _type == "section.assurance" => {
      ...,
      "title": coalesce(title[_key == $language][0].value, title[_key == "ro"][0].value),
    },
    _type == "section.collectionList" => {
      ...,
      "title": coalesce(title[_key == $language][0].value, title[_key == "ro"][0].value),
    },
    _type == "section.shopTheLook" => {
      ...,
      "title": coalesce(title[_key == $language][0].value, title[_key == "ro"][0].value),
    },
    _type == "section.marquee" => {
      ...,
      "text": coalesce(text[_key == $language][0].value, text[_key == "ro"][0].value),
    },
}`;
```

**Step 4: Commit**

```bash
git add apps/web/src/sanity/queries/
git commit -m "feat: update all GROQ queries with i18n language parameter and fallback"
```

---

### Task 11: Update Sanity loaders and fetch functions

**Files:**
- Modify: `apps/web/src/lib/sanity/index.ts`
- Modify: `apps/web/src/lib/sanity/sanity-fetch.ts`

**Step 1: Update `sanity-fetch.ts` to accept language parameter**

```typescript
import type { QueryParams } from "sanity";
import type { Language } from "@/i18n/languages";
import { getCookies } from "../context";
import { client } from "./client";

interface SanityFetchParams {
  query: string;
  params?: QueryParams;
  perspective?: "published" | "drafts";
}

export function sanityFetch<T>({
  query,
  params = {},
  perspective: _perspective,
}: SanityFetchParams) {
  const cookies = getCookies();
  const isDraftMode = cookies?.get("sanity-draft-mode")?.value === "true";
  const perspective = _perspective ?? (isDraftMode ? "drafts" : "published");
  return client
    .withConfig({ perspective })
    .fetch<T>(query, params, {
      filterResponse: false,
      cacheMode: "noStale",
    });
}
```

No changes needed to sanity-fetch itself — the `$language` param is passed through the `params` object.

**Step 2: Update `index.ts` loaders to accept and pass language**

```typescript
import type { Language } from "@/i18n/languages";

export function loadRoute(slug: string, language: Language) {
  return sanityFetch<ROUTE_QUERY_RESULT>({
    query: ROUTE_QUERY,
    params: { slug, language },
  });
}

export function loadModularPage(slug: string, language: Language) {
  return sanityFetch<MODULAR_PAGE_QUERY_RESULT>({
    query: MODULAR_PAGE_QUERY,
    params: { slug, language },
  });
}

export function loadHome(language: Language) {
  return sanityFetch<HOME_QUERY_RESULT>({
    query: HOME_QUERY,
    params: { language },
  });
}

export function loadGlobalData(language: Language) {
  return sanityFetch<GLOBAL_QUERY_RESULT>({
    query: GLOBAL_QUERY,
    params: { language },
  });
}

export function loadCategory(slug: string, language: Language) {
  return sanityFetch<CategoryResult | null>({
    query: CATEGORY_QUERY,
    params: { slug, language },
  });
}

export async function loadPageByPathname(slug: string, language: Language) {
  const { result } = await loadRoute(slug, language);
  const documentType = result?.routeData._type;

  switch (documentType) {
    case "home":
      return loadHome(language);
    case "modular.page":
      return loadModularPage(slug, language);
    case "text.page":
      return loadTextPage(slug, language);
    case "category":
      return loadCategory(slug, language);
    default:
      return null;
  }
}

export function loadTextPage(slug: string, language: Language) {
  return sanityFetch<TEXT_PAGE_QUERY_RESULT>({
    query: TEXT_PAGE_QUERY,
    params: { slug, language },
  });
}

export function loadFaqs(language: Language) {
  return sanityFetch<FAQS_PAGE_QUERY_RESULT>({
    query: FAQS_PAGE_QUERY,
    params: { language },
  });
}

export function loadDictionary(language: Language) {
  return sanityFetch<DICTIONARY_QUERY_RESULT>({
    query: DICTIONARY_QUERY,
    params: { language },
  });
}

export function loadProductContent(handle: string, language: Language) {
  return sanityFetch<PRODUCT_QUERY_RESULT>({
    query: PRODUCT_QUERY,
    params: { handle, language },
  });
}
```

**Step 3: Commit**

```bash
git add apps/web/src/lib/sanity/
git commit -m "feat: update all Sanity loaders to accept and pass language parameter"
```

---

### Task 12: Update page routes to use language

**Files:**
- Modify: `apps/web/src/pages/[...path]/index.astro`
- Modify: `apps/web/src/pages/[...path]/products/[handle].astro`
- Modify: `apps/web/src/pages/[...path]/products/index.astro`
- Modify: `apps/web/src/pages/[...path]/checkout.astro`
- Modify: `apps/web/src/pages/[...path]/faqs.astro`
- Modify: `apps/web/src/pages/[...path]/order/confirmed/[id].astro`
- Modify: `apps/web/src/pages/404.astro`

**Step 1: Update `[...path]/index.astro`**

The main catch-all page needs to:
1. Extract language from `Astro.locals.language`
2. Parse the path to get canonical segments (strip language prefix, translate static segments)
3. Pass language to all Sanity loaders

```typescript
import { all } from "better-all";
import { parseLocalizedPath } from "@/i18n/helpers";
import CategoryPage from "@/components/category/category-page.astro";
import SectionRenderer from "@/components/sections/section-renderer.astro";
import Preloads from "@/components/shared/preloads.astro";
import TextPage from "@/components/text-page/index.astro";
import Layout from "@/layouts/layout.astro";
import { loadGlobalData, loadPageByPathname } from "@/lib/sanity";

const { path } = Astro.params;
const language = Astro.locals.language;

// Parse path: strip language prefix and translate static segments
const fullPath = path ? `/${path}` : "/";
const { canonicalPath } = parseLocalizedPath(fullPath);

// For the home page
const slug = canonicalPath === "/" ? "/" : canonicalPath;

const { globalData, page } = await all({
  globalData() {
    return loadGlobalData(language);
  },
  page() {
    return loadPageByPathname(slug, language);
  },
});

// ... rest stays similar but uses language
```

**Step 2: Update `products/[handle].astro`**

Extract language, pass to `loadProductContent`:

```typescript
const language = Astro.locals.language;
// ...
productContent() {
  return loadProductContent(handle, language);
},
```

**Step 3: Update `products/index.astro`**

Use `t()` for the "Shop all products" heading:

```typescript
import { t } from "@/i18n";

const language = Astro.locals.language;
// ...
<Heading ...>{t("shop.all", language)}</Heading>
```

**Step 4: Update all remaining pages similarly**

Each page:
- Gets `language` from `Astro.locals.language`
- Passes it to Sanity loaders
- Uses `t()` for static strings

**Step 5: Commit**

```bash
git add apps/web/src/pages/
git commit -m "feat: update all page routes to use language for i18n"
```

---

### Task 13: Update layout with html lang and hreflang tags

**Files:**
- Modify: `apps/web/src/layouts/layout.astro`

**Step 1: Update the layout**

- Change `<html lang="en">` to `<html lang={Astro.locals.language}>`
- Add hreflang alternate links in `<head>`
- Pass language to `CountryInit` (or create a new `LanguageInit` component)

```html
<html lang={Astro.locals.language} transition:animate="none" class="overflow-x-clip overscroll-y-none">
  <head>
    ...
    <link rel="alternate" hreflang="ro" href={`${config.baseUrl}/ro${canonicalPath}`} />
    <link rel="alternate" hreflang="en" href={`${config.baseUrl}/en${canonicalPath}`} />
    <link rel="alternate" hreflang="x-default" href={`${config.baseUrl}/ro${canonicalPath}`} />
    ...
  </head>
```

**Step 2: Commit**

```bash
git add apps/web/src/layouts/layout.astro
git commit -m "feat: add html lang attribute and hreflang alternate links"
```

---

### Task 14: Update nanostores for language state

**Files:**
- Modify: `apps/web/src/stores/country.ts` (or create `apps/web/src/stores/language.ts`)
- Modify: `apps/web/src/components/shared/country-init.tsx` (or similar)

**Step 1: Add language store**

```typescript
import { atom } from "nanostores";
import type { Language } from "@/i18n/languages";

export const $language = atom<Language>("ro");
```

**Step 2: Update CountryInit to also set language**

Pass `language` prop and set the store on mount.

**Step 3: Update React island components that need language**

Components like `ProductInformation`, `HeaderClient`, etc. that render text should read from the language store if they need to display translated content client-side.

**Step 4: Commit**

```bash
git add apps/web/src/stores/ apps/web/src/components/shared/
git commit -m "feat: add language nanostore and update client-side state"
```

---

### Task 15: Write Sanity data migration script

**Files:**
- Create: `apps/web/scripts/migrate-i18n.ts`

**Step 1: Write migration script**

This script fetches all documents and converts plain text fields to internationalized array format:

```typescript
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.PUBLIC_SANITY_STUDIO_DATASET!,
  token: process.env.SANITY_TOKEN!,
  apiVersion: "2026-01-16",
  useCdn: false,
});

function toI18nArray(value: string | undefined | null) {
  if (!value) return undefined;
  return [{ _key: "ro", value }];
}

// Migrate each document type...
// For each: fetch all documents, create transaction, patch fields
```

The full script iterates over each document type, reads current field values, and patches them into the `[{_key: "ro", value: "..."}]` format.

**Step 2: Run migration**

Run: `npx tsx apps/web/scripts/migrate-i18n.ts`

**Step 3: Commit**

```bash
git add apps/web/scripts/migrate-i18n.ts
git commit -m "feat: add Sanity data migration script for i18n"
```

---

### Task 16: Add language switcher to header

**Files:**
- Create: `apps/web/src/components/global/header/language-switcher.tsx`
- Modify: `apps/web/src/components/global/header/default-header.astro`

**Step 1: Create language switcher component**

A React island component that:
- Reads current language from nanostore
- Renders RO/EN toggle buttons
- On click: navigates to the alternate language URL
- Needs the alternate slug (passed as prop from server)

```tsx
import { useStore } from "@nanostores/react";
import { $language } from "@/stores/language";
import { languages } from "@/i18n/languages";

interface LanguageSwitcherProps {
  alternateUrls: Record<string, string>; // { ro: "/ro/produse/...", en: "/en/products/..." }
}

export function LanguageSwitcher({ alternateUrls }: LanguageSwitcherProps) {
  const currentLanguage = useStore($language);

  return (
    <div class="flex gap-1">
      {languages.map((lang) => (
        <a
          key={lang.id}
          href={alternateUrls[lang.id] ?? `/${lang.id}/`}
          class={currentLanguage === lang.id ? "font-bold" : "opacity-60"}
        >
          {lang.id.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
```

**Step 2: Add to header**

Add `<LanguageSwitcher>` to the header template, passing alternate URLs.

**Step 3: Commit**

```bash
git add apps/web/src/components/global/header/language-switcher.tsx apps/web/src/components/global/header/default-header.astro
git commit -m "feat: add language switcher component to header"
```

---

### Task 17: Add region picker component

**Files:**
- Create: `apps/web/src/components/global/header/region-picker.tsx`
- Modify: `apps/web/src/components/global/header/default-header.astro`

**Step 1: Create region picker**

A React island component that:
- Shows current region flag/name
- Opens a dropdown with supported countries
- On selection: sets the `region` cookie and reloads (to get new pricing)

**Step 2: Add to header alongside language switcher**

**Step 3: Commit**

```bash
git add apps/web/src/components/global/header/region-picker.tsx apps/web/src/components/global/header/default-header.astro
git commit -m "feat: add region picker component to header"
```

---

### Task 18: Update product sync script

**Files:**
- Modify: `apps/medusa-backend/src/scripts/seed.ts` (or wherever product sync to Sanity lives)

**Step 1: Update sync to write i18n arrays**

Change the sync to write product title and description into the Romanian entry of the internationalized array:

```typescript
// Before
{ title: product.title }

// After
{ title: [{ _key: "ro", value: product.title }] }
```

**Step 2: Commit**

```bash
git add apps/medusa-backend/src/scripts/
git commit -m "feat: update product sync to write i18n array format"
```

---

### Task 19: Final integration testing and cleanup

**Step 1: Run the Sanity schema deploy**

Run: `cd apps/web && npx sanity@latest schema deploy`

**Step 2: Run the data migration**

Run: `npx tsx apps/web/scripts/migrate-i18n.ts`

**Step 3: Run the dev server and test**

Run: `cd apps/web && pnpm dev`

Test:
- Visit `/` — should redirect to `/ro/` or `/en/` based on browser language
- Visit `/ro/` — should show homepage in Romanian
- Visit `/en/` — should show homepage in English (with Romanian fallback for untranslated content)
- Visit `/ro/produse` — should show product listing
- Visit `/en/products` — should show product listing
- Visit `/ro/produse/[handle]` — should show product detail page
- Language switcher toggles between `/ro/...` and `/en/...`
- Region picker changes cookie, pricing updates on reload

**Step 4: Run linter**

Run: `pnpm dlx ultracite fix`

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete i18n integration — Romanian and English with translated URLs"
```
