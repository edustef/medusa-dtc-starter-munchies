import type { Language } from "./languages";

const translations: Record<string, Record<Language, string>> = {
  "shop.all": { ro: "Toate produsele", en: "Shop all products" },
  "breadcrumb.home": { ro: "Acasa", en: "Home" },
  "filter.filter": { ro: "Filtru", en: "Filter" },
  "filter.collections": { ro: "Colectii", en: "Collections" },
  "filter.categories": { ro: "Categorii", en: "Categories" },
  "filter.noFilters": { ro: "Nu exista filtre", en: "No filters to select" },
  "filter.clearAll": { ro: "Sterge tot", en: "Clear all" },
  "filter.clearFilters": { ro: "Sterge filtrele", en: "Clear filters" },
  "filter.showResults": { ro: "Arata rezultatele", en: "Show Results" },
  "cart.add": { ro: "Adauga in cos", en: "Add to cart" },
  "cart.addShort": { ro: "Adauga +", en: "Add +" },
  "cart.title": { ro: "Cos de cumparaturi", en: "Shopping cart" },
  "cart.myBag": { ro: "Cosul meu", en: "My Bag" },
  "cart.empty": {
    ro: "Cosul tau este gol.",
    en: "Your bag is currently empty.",
  },
  "cart.youMightLike": { ro: "S-ar putea sa iti placa", en: "You might like" },
  "cart.youMightAlsoLike": {
    ro: "S-ar putea sa iti placa si",
    en: "You might also like",
  },
  "cart.subtotal": { ro: "Subtotal", en: "Subtotal" },
  "cart.taxesShipping": {
    ro: "Taxele si livrarea se calculeaza la finalizare",
    en: "Taxes and shipping calculated at checkout",
  },
  "cart.goToCheckout": { ro: "Finalizeaza comanda", en: "Go to checkout" },
  "checkout.title": { ro: "Finalizare comanda", en: "Checkout" },
  "checkout.orderDetails": { ro: "Detalii comanda", en: "Order details" },
  "checkout.subtotal": { ro: "Subtotal", en: "Subtotal" },
  "checkout.taxes": { ro: "Taxe", en: "Taxes" },
  "checkout.shipping": { ro: "Livrare", en: "Shipping" },
  "checkout.total": { ro: "Total", en: "Total" },
  "checkout.shippingAddress": {
    ro: "Adresa de livrare",
    en: "Shipping Address",
  },
  "checkout.billingAddress": {
    ro: "Adresa de facturare",
    en: "Billing address",
  },
  "checkout.contact": { ro: "Contact", en: "Contact" },
  "checkout.edit": { ro: "Editeaza", en: "Edit" },
  "checkout.continueToDelivery": {
    ro: "Continua spre livrare",
    en: "Continue to delivery",
  },
  "checkout.delivery": { ro: "Livrare", en: "Delivery" },
  "checkout.method": { ro: "Metoda", en: "Method" },
  "checkout.continueToPayment": {
    ro: "Continua spre plata",
    en: "Continue to payment",
  },
  "checkout.payment": { ro: "Plata", en: "Payment" },
  "checkout.enterCardDetails": {
    ro: "Introdu detaliile cardului:",
    en: "Enter your card details:",
  },
  "checkout.addCardDetails": {
    ro: "Adauga detalii card",
    en: "Add card details",
  },
  "checkout.continueToReview": {
    ro: "Continua spre verificare",
    en: "Continue to review",
  },
  "checkout.review": { ro: "Verificare", en: "Review" },
  "checkout.reviewDisclaimer": {
    ro: "Apasand butonul 'Finalizeaza comanda', confirmati ca ati citit, inteles si acceptat Termenii de utilizare, Termenii de vanzare si Politica de retururi si ca ati luat la cunostinta Politica de confidentialitate.",
    en: "By clicking the 'Complete order' button, you confirm that you have read, understand, and accept our Terms of Use, Terms of Sale and Returns Policy and acknowledge that you have read Medusa Store's Privacy Policy.",
  },
  "checkout.completeOrder": { ro: "Finalizeaza comanda", en: "Complete order" },
  "checkout.firstName": { ro: "Prenume", en: "First name" },
  "checkout.lastName": { ro: "Nume", en: "Last name" },
  "checkout.address": { ro: "Adresa", en: "Address" },
  "checkout.company": { ro: "Companie", en: "Company" },
  "checkout.postalCode": { ro: "Cod postal", en: "Postal code" },
  "checkout.city": { ro: "Oras", en: "City" },
  "checkout.country": { ro: "Tara", en: "Country" },
  "checkout.stateProvince": { ro: "Judet", en: "State/Province" },
  "checkout.email": { ro: "Email", en: "Email" },
  "checkout.phone": { ro: "Telefon", en: "Phone" },
  "checkout.testingMethod": { ro: "Metoda de test", en: "Testing method" },
};

export function t(key: string, language: Language): string {
  return translations[key]?.[language] ?? translations[key]?.ro ?? key;
}
