# SolarEdge Supply

## Linting

- `pnpm biome check --fix` before committing

## Sanity i18n

The `_key` in internationalized arrays MUST be the language ID (`"ro"`, `"en"`). The Sanity MCP `patch_document_from_json` tool auto-generates random keys which breaks this — use `@sanity/client` scripts instead when writing i18n data.

GROQ i18n helpers are in `apps/web/src/sanity/queries/helpers.ts`. Always resolve i18n fields in GROQ projections — don't rely on `...` spread for fields using `internationalizedArrayString/Text` or `i18nPtBody/i18nLightPtBody`.
