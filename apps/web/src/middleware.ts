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
  "/api",
  "/images",
  "/icons",
  "/cdn-cgi",
  "/favicon.ico",
  "/favicon-inactive.ico",
  "/_astro",
  "/_image",
  "/_server-islands",
  "/cms",
];

const cacheablePaths = ["/api/og"];

function isExcludedPath(pathname: string): boolean {
  const isCacheable = cacheablePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (isCacheable) {
    return false;
  }

  const match = excludedPaths.find(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  return !!match;
}

const languageMiddleware = defineMiddleware(async (context, next) => {
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

  // Canonicalize translated route segments so file-based routing matches
  // e.g., /ro/produse/handle -> rewrite to /ro/products/handle
  const restSegments = parts.slice(1);
  if (restSegments.length > 0) {
    const { canonicalizeSegment } = await import("./i18n/routes");
    const canonicalized = restSegments.map((seg, index) => {
      if (index === 0) {
        return canonicalizeSegment(seg);
      }
      return seg;
    });
    const canonicalPath = `/${firstPart}/${canonicalized.join("/")}`;
    if (canonicalPath !== pathname) {
      return context.rewrite(canonicalPath);
    }
  }

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

const cachingMiddleware = defineMiddleware(async (context, next) => {
  const { request, url } = context;
  const { pathname } = url;
  const ctx = context.locals.runtime?.ctx;

  // Skip caching for non-GET, API routes, CMS, static assets, and draft mode
  const isDraftMode = request.headers
    .get("cookie")
    ?.includes("sanity-draft-mode=true");

  if (isExcludedPath(pathname) || isDraftMode || request.method !== "GET") {
    return next();
  }

  // Cache API not available (e.g., dev mode or workers.dev domain)
  if (typeof caches === "undefined") {
    return next();
  }

  const cache = caches.default;
  const cacheKey = new Request(
    new URL(`/_v/${BUILD_VERSION}${pathname}${url.search}`, url.origin)
  );
  const cachedResponse = await cache.match(cacheKey);

  // HIT - return immediately
  if (cachedResponse) {
    const headers = new Headers(cachedResponse.headers);
    return new Response(cachedResponse.body, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers,
    });
  }

  // MISS - return streaming response immediately, cache in background
  const originalResponse = await next();

  const cacheControl = originalResponse.headers.get("Cache-Control");
  const shouldCache =
    !(
      cacheControl?.includes("private") || cacheControl?.includes("no-store")
    ) &&
    originalResponse.status >= 200 &&
    originalResponse.status < 300;

  if (!shouldCache) {
    const headers = new Headers(originalResponse.headers);
    headers.set("X-Cache", "SKIP");
    return new Response(originalResponse.body, {
      status: originalResponse.status,
      statusText: originalResponse.statusText,
      headers,
    });
  }

  // Clone for caching, return original immediately
  const responseToCache = originalResponse.clone();

  // Add X-Cache header and return immediately
  const headers = new Headers(originalResponse.headers);
  headers.set("X-Cache", "MISS");

  // Defer all caching work to waitUntil, re-entering ALS context
  const cacheWork = (store: RequestContext) =>
    requestContext.run(store, async () => {
      // Consume body - streaming completes, components render, tags collected
      const body = await responseToCache.arrayBuffer();

      // Now tags are complete
      const contextTags = getTags();

      const cacheHeaders = new Headers(responseToCache.headers);

      if (!cacheHeaders.has("Cache-Control")) {
        cacheHeaders.set(
          "Cache-Control",
          "public, max-age=0, s-maxage=31536000"
        );
      }

      // Merge Cache-Tag from response header + collected tags
      const responseTags = cacheHeaders.get("Cache-Tag");
      const allTags = new Set<string>(contextTags ?? []);

      if (responseTags) {
        for (const tag of responseTags.split(",")) {
          allTags.add(tag.trim());
        }
      }

      if (allTags.size) {
        cacheHeaders.set("Cache-Tag", [...allTags].join(","));
      }

      const finalResponse = new Response(body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: cacheHeaders,
      });

      await cache.put(cacheKey, finalResponse);
    });

  // Capture ALS store to re-enter context in waitUntil
  const contextStore = requestContext.getStore();

  if (contextStore) {
    if (ctx?.waitUntil) {
      ctx.waitUntil(cacheWork(contextStore));
    } else {
      await cacheWork(contextStore);
    }
  }

  return new Response(originalResponse.body, {
    status: originalResponse.status,
    statusText: originalResponse.statusText,
    headers,
  });
});

export const onRequest = sequence(
  contextMiddleware,
  languageMiddleware,
  regionMiddleware,
  cachingMiddleware
);
