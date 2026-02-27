import { actions } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { useTransition } from "react";
import { Cta } from "@/components/shared/button";
import type { Language } from "@/i18n/languages";
import { t } from "@/i18n/translations";

export function ManualPaymentButton({
  language,
  notReady,
}: {
  language?: Language;
  notReady: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      // track("checkout-completed");

      const res = await actions.order.placeOrder();

      if (!res.error && res.data?.redirect) {
        navigate(res.data.redirect);
      }
    });
  };

  return (
    <Cta
      disabled={notReady}
      loading={isPending}
      onClick={handleClick}
      size="sm"
      type="submit"
    >
      {t("checkout.completeOrder", language ?? "ro")}
    </Cta>
  );
}
