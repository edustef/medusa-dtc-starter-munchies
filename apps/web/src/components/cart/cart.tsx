import type { HttpTypes } from "@medusajs/types";
import type { Language } from "@/i18n/languages";
import { CartProvider } from "../context/cart";
import { CartUI } from "./cart-ui";

interface CartProps {
  cart: HttpTypes.StoreCart | null;
  language: Language;
  region?: HttpTypes.StoreRegion | null;
  cartAddons: HttpTypes.StoreProduct[] | null;
  countryCode: string;
}

export function Cart(props: CartProps) {
  return (
    <CartProvider
      addons={props.cartAddons}
      cart={props.cart}
      countryCode={props.countryCode}
      language={props.language}
      region={props.region}
    >
      <CartUI />
    </CartProvider>
  );
}
