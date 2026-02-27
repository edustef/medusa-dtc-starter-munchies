import type { HttpTypes } from "@medusajs/types";
import type { Language } from "@/i18n/languages";
import { isManual, isStripe } from "../utils";
import { ManualPaymentButton } from "./manual";
import { StripePaymentButton } from "./stripe";

interface Props {
  cart: HttpTypes.StoreCart;
  disabled?: boolean;
  language?: Language;
}
export function PaymentButton({ cart, disabled, language }: Props) {
  const paymentSession = cart.payment_collection?.payment_sessions?.[0];

  const notReady = !(cart?.shipping_address && cart?.email) || disabled;

  if (isStripe(paymentSession?.provider_id)) {
    return (
      <StripePaymentButton
        cart={cart}
        language={language}
        notReady={Boolean(notReady)}
      />
    );
  }

  if (isManual(paymentSession?.provider_id)) {
    return (
      <ManualPaymentButton language={language} notReady={Boolean(notReady)} />
    );
  }
}
