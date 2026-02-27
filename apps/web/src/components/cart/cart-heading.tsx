import { Title } from "@radix-ui/react-dialog";
import { Heading } from "@/components/shared/typography/heading";
import { t } from "@/i18n/translations";

import { useCart } from "../context/cart";

export function CartHeading() {
  const { cart, language } = useCart();

  const count = (cart?.items?.length ?? 0).toString();

  return (
    <div className="flex min-h-[calc(var(--header-height))] items-center justify-start px-4">
      <Title asChild>
        <Heading desktopSize="2xl" font="serif" mobileSize="lg" tag="h2">
          {t("cart.myBag", language)} ({count})
        </Heading>
      </Title>
    </div>
  );
}
