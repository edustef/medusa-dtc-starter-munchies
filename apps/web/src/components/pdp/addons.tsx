import type { HttpTypes } from "@medusajs/types";
import { AddonsItem } from "@/components/shared/addons-item";
import { Heading } from "@/components/shared/typography/heading";
import type { Language } from "@/i18n/languages";

export function Addons({
  products,
  regionId,
  title,
  language,
}: {
  products: HttpTypes.StoreProduct[];
  title?: string;
  regionId: string;
  language: Language;
}) {
  if (products.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-xs rounded-lg bg-secondary p-s">
      <Heading desktopSize="lg" mobileSize="base" tag="h2">
        {title}
      </Heading>
      {products.map((product) => (
        <AddonsItem
          key={product.id}
          language={language}
          regionId={regionId}
          {...product}
        />
      ))}
    </div>
  );
}
