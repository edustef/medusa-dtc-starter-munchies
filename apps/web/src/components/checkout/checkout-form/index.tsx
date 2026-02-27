import type {
  StoreCart,
  StoreCartShippingOption,
  StorePaymentProvider,
} from "@medusajs/types";
import { useState } from "react";
import { Heading } from "@/components/shared/typography/heading";
import type { Language } from "@/i18n/languages";
import { t } from "@/i18n/translations";
import { AddressForm } from "./address-form";
import Delivery from "./delivery";
import { Payment } from "./payment";
import { Wrapper as StripeWrapper } from "./payment/wrapper";
import { Review } from "./review";

export function CheckoutForm({
  cart: initialCart,
  language,
  paymentMethods,
  shippingMethods,
}: {
  cart: StoreCart;
  language: Language;
  paymentMethods: StorePaymentProvider[];
  shippingMethods: StoreCartShippingOption[];
}) {
  const [cart, setCart] = useState(initialCart);
  const [step, setStep] = useState<
    "addresses" | "delivery" | "payment" | "review"
  >("addresses");

  return (
    <StripeWrapper cart={cart}>
      <div className="w-full">
        <Heading desktopSize="2xl" font="serif" mobileSize="xl" tag="h3">
          {t("checkout.title", language)}
        </Heading>
        <AddressForm
          active={step === "addresses"}
          cart={cart}
          language={language}
          nextStep={shippingMethods.length > 0 ? "delivery" : "payment"}
          setCart={setCart}
          setStep={setStep}
        />
        {shippingMethods.length > 0 && (
          <Delivery
            active={step === "delivery"}
            cart={cart}
            currency_code={cart.currency_code}
            language={language}
            methods={shippingMethods}
            setCart={setCart}
            setStep={setStep}
          />
        )}
        <Payment
          active={step === "payment"}
          cart={cart}
          language={language}
          methods={paymentMethods}
          setCart={setCart}
          setStep={setStep}
        />
        <Review active={step === "review"} cart={cart} language={language} />
      </div>
    </StripeWrapper>
  );
}
