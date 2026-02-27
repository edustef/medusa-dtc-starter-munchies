import type { StoreCart } from "@medusajs/types";

import { Body } from "@/components/shared/typography/body";
import { Heading } from "@/components/shared/typography/heading";
import type { Language } from "@/i18n/languages";
import { t } from "@/i18n/translations";

import { PaymentButton } from "./payment/button";

export function Review({
  active,
  cart,
  language,
}: {
  active: boolean;
  cart: StoreCart;
  language: Language;
}) {
  if (!active) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-8 border-accent border-t py-8">
      <Heading desktopSize="xs" font="sans" mobileSize="xs" tag="h6">
        {t("checkout.review", language)}
      </Heading>
      <Body>{t("checkout.reviewDisclaimer", language)}</Body>
      <PaymentButton cart={cart} language={language} />
    </div>
  );
}
