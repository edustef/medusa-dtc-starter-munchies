import { actions } from "astro:actions";
import { withState } from "@astrojs/react/actions";
import type { StoreCart, StoreCartAddress } from "@medusajs/types";
import type { BaseRegionCountry } from "@medusajs/types/dist/http/region/common";
import type { Dispatch, SetStateAction } from "react";
import { startTransition, useEffect, useState } from "react";
import { Cta } from "@/components/shared/button";
import { Checkbox } from "@/components/shared/checkbox";
import { Input } from "@/components/shared/input";
import { InputCombobox } from "@/components/shared/input-combobox";
import { Body } from "@/components/shared/typography/body";
import { Heading } from "@/components/shared/typography/heading";
import type { Language } from "@/i18n/languages";
import { t } from "@/i18n/translations";
import { useResetableActionState } from "@/lib/hooks/use-resetable-action-state";

export function AddressForm({
  active,
  cart,
  language,
  setStep,
  setCart,
  nextStep,
}: {
  active: boolean;
  cart: StoreCart;
  language: Language;
  nextStep: "addresses" | "delivery" | "payment" | "review";
  setCart: Dispatch<SetStateAction<StoreCart>>;
  setStep: Dispatch<
    SetStateAction<"addresses" | "delivery" | "payment" | "review">
  >;
}) {
  const [checked, setChecked] = useState(true);

  const [{ data }, action, isPending, reset] = useResetableActionState(
    withState(actions.order.setCheckoutAddresses),
    {
      error: undefined,
      data: {
        status: "idle",
        cart,
      },
    }
  );

  useEffect(() => {
    if (data?.status === "success") {
      if (data.cart) {
        setCart(data.cart);
      }
      setStep(nextStep);
      startTransition(() => reset());
    }
  }, [data?.status, data?.cart, setStep, nextStep, reset, setCart]);

  const isFilled = !active && !!cart.shipping_address?.address_1;

  return (
    <form
      action={action}
      className="flex flex-col gap-8 border-accent border-t py-8"
    >
      <div className="flex items-center justify-between">
        <Heading desktopSize="xs" font="sans" mobileSize="xs" tag="h6">
          {t("checkout.shippingAddress", language)}
        </Heading>
        {isFilled ? (
          <Cta onClick={() => setStep("addresses")} size="sm" variant="outline">
            {t("checkout.edit", language)}
          </Cta>
        ) : null}
      </div>
      {isFilled ? (
        <div className="flex w-full flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 flex-col gap-4">
            <Body className="font-semibold" font="sans">
              {t("checkout.shippingAddress", language)}
            </Body>
            <div className="flex flex-col gap-1.5">
              <Body font="sans">
                {cart.shipping_address?.first_name}{" "}
                {cart.shipping_address?.last_name}
              </Body>
              <Body font="sans">{cart.shipping_address?.address_1}</Body>
              <Body font="sans">
                {cart.shipping_address?.postal_code},{" "}
                {cart.shipping_address?.city}
              </Body>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <Body className="font-semibold" font="sans">
              {t("checkout.contact", language)}
            </Body>
            <Body font="sans">{cart.email}</Body>
          </div>
        </div>
      ) : null}
      {active ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <AddressInputs
              address={cart.shipping_address}
              addressName="shipping_address"
              countries={cart.region?.countries}
              language={language}
            />
          </div>
          <Checkbox
            checked={checked}
            onCheckedChange={(v) =>
              setChecked(v === "indeterminate" ? false : v)
            }
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              defaultValue={cart.email}
              name="email"
              placeholder={t("checkout.email", language)}
              required
              type="email"
            />
            <Input
              defaultValue={cart.shipping_address?.phone}
              name="shipping_address.phone"
              placeholder={t("checkout.phone", language)}
            />
          </div>

          {!checked && (
            <>
              <Heading desktopSize="xs" font="sans" mobileSize="xs" tag="h6">
                {t("checkout.billingAddress", language)}
              </Heading>
              <div className="grid gap-4 lg:grid-cols-2">
                <AddressInputs
                  address={cart.billing_address}
                  addressName="billing_address"
                  countries={cart.region?.countries}
                  language={language}
                />
                <Input
                  defaultValue={cart.billing_address?.phone}
                  name="billing_address.phone"
                  placeholder={t("checkout.phone", language)}
                />
              </div>
            </>
          )}
          <Cta loading={isPending} size="sm" type="submit">
            {t("checkout.continueToDelivery", language)}
          </Cta>
        </div>
      ) : null}
    </form>
  );
}

function AddressInputs({
  address,
  addressName,
  countries,
  language,
}: {
  address?: StoreCartAddress;
  addressName: string;
  countries?: BaseRegionCountry[];
  language: Language;
}) {
  const inputName = (name: string) => `${addressName}.${name}`;

  return (
    <>
      <Input
        defaultValue={address?.first_name}
        name={inputName("first_name")}
        placeholder={t("checkout.firstName", language)}
        required
      />
      <Input
        defaultValue={address?.last_name}
        name={inputName("last_name")}
        placeholder={t("checkout.lastName", language)}
        required
      />
      <Input
        defaultValue={address?.address_1}
        name={inputName("address_1")}
        placeholder={t("checkout.address", language)}
        required
      />
      <Input
        defaultValue={address?.company}
        name={inputName("company")}
        placeholder={t("checkout.company", language)}
      />
      <Input
        defaultValue={address?.postal_code}
        name={inputName("postal_code")}
        placeholder={t("checkout.postalCode", language)}
        required
      />
      <Input
        defaultValue={address?.city}
        name={inputName("city")}
        placeholder={t("checkout.city", language)}
        required
      />
      <InputCombobox
        defaultValue={address?.country_code}
        name={inputName("country_code")}
        options={
          countries
            ?.filter(
              (
                country
              ): country is {
                display_name: string;
                iso_2: string;
              } & BaseRegionCountry => !!country.display_name && !!country.iso_2
            )
            .map(({ display_name, iso_2 }) => ({
              id: iso_2,
              label: display_name,
            })) || []
        }
        placeholder={t("checkout.country", language)}
        required
      />
      <Input
        defaultValue={address?.province}
        name={inputName("province")}
        placeholder={t("checkout.stateProvince", language)}
        required
      />
    </>
  );
}
