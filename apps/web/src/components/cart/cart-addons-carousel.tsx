import type { HttpTypes } from "@medusajs/types";
import { AddonsItem } from "@/components/shared/addons-item";
import { CarouselSection } from "@/components/shared/carousel-section";
import { Heading } from "@/components/shared/typography/heading";
import type { Language } from "@/i18n/languages";
import { t } from "@/i18n/translations";

interface CartAddonsCarouselProps {
  products: HttpTypes.StoreProduct[];
  isEmptyCart: boolean;
  language: Language;
  regionId: string;
}

export function CartAddonsCarousel({
  products,
  isEmptyCart,
  language,
  regionId,
}: CartAddonsCarouselProps) {
  const slides = products.map((item) => (
    <div className="w-95" key={item.id}>
      <AddonsItem
        language={language}
        regionId={regionId}
        variant="cart"
        {...item}
      />
    </div>
  ));

  return (
    <div>
      <CarouselSection
        showButtons
        slides={slides}
        title={
          <Heading font="serif" mobileSize="lg" tag="h3">
            {isEmptyCart
              ? t("cart.youMightLike", language)
              : t("cart.youMightAlsoLike", language)}
          </Heading>
        }
        variant="cart"
      />
    </div>
  );
}
