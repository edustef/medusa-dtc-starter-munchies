import type { StoreProduct } from "@medusajs/types";

import { LocalizedLink } from "@/components/shared/localized-link";
import { Body } from "@/components/shared/typography/body";
import type { Language } from "@/i18n/languages";
import { t } from "@/i18n/translations";

export function BreadCrumbs({
  collection,
  title,
  language,
}: Pick<StoreProduct, "collection" | "title"> & { language: Language }) {
  return (
    <Body className="-mb-1" desktopSize="base" font="sans" mobileSize="sm">
      <LocalizedLink href="/">{t("breadcrumb.home", language)}</LocalizedLink>{" "}
      {collection ? (
        <>
          {" / "}
          <LocalizedLink href={`/products?collection=${collection.id}`}>
            {collection.title}
          </LocalizedLink>{" "}
        </>
      ) : null}
      {" / "}
      {title}
    </Body>
  );
}
