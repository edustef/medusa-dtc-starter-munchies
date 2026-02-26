/**
 * Populate homepage with sections.
 * Run: npx tsx apps/web/scripts/populate-home.ts
 */
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.PUBLIC_SANITY_STUDIO_DATASET!,
  token: process.env.SANITY_TOKEN!,
  apiVersion: "2026-02-26",
  useCdn: false,
});

const i18nStr = (ro: string, en: string) => [
  { _key: "ro", _type: "internationalizedArrayStringValue", value: ro },
  { _key: "en", _type: "internationalizedArrayStringValue", value: en },
];

const i18nTxt = (ro: string, en: string) => [
  { _key: "ro", _type: "internationalizedArrayTextValue", value: ro },
  { _key: "en", _type: "internationalizedArrayTextValue", value: en },
];

const cta = (ro: string, en: string, link: string) => ({
  _type: "cta",
  label: i18nStr(ro, en),
  link,
});

const sections = [
  {
    _type: "section.hero",
    _key: "hero1",
    mediaType: "image",
    title: i18nStr(
      "Energia solară pentru viitorul tău",
      "Solar energy for your future"
    ),
    subtitle: i18nStr(
      "Panouri, invertoare și baterii de top la cele mai bune prețuri",
      "Top panels, inverters & batteries at the best prices"
    ),
    cta: cta("Vezi produsele", "Shop now", "/products"),
  },
  {
    _type: "section.featuredProducts",
    _key: "featured1",
    title: i18nStr("Produse populare", "Popular products"),
    products: [
      {
        _type: "reference",
        _ref: "prod_01KJDJ2SHY16GDZ02M6PPQFCAR",
        _key: "fp1",
      },
      {
        _type: "reference",
        _ref: "prod_01KJDJ2SN2P7YVNBTY7PWP6WYB",
        _key: "fp2",
      },
      {
        _type: "reference",
        _ref: "prod_01KJDJ2SPXXSKCT4KYTY90CXV4",
        _key: "fp3",
      },
      {
        _type: "reference",
        _ref: "prod_01KJDJ2SRR6KBW0YMA397PC4EX",
        _key: "fp4",
      },
    ],
    cta: cta("Toate produsele", "All products", "/products"),
  },
  {
    _type: "section.assurance",
    _key: "assurance1",
    title: i18nStr("De ce SolarEdge?", "Why SolarEdge?"),
    cards: [
      {
        _key: "card1",
        _type: "card",
        title: i18nStr("Calitate garantată", "Guaranteed quality"),
        description: i18nTxt(
          "Toate produsele noastre sunt certificate și vin cu garanție extinsă de la producător.",
          "All our products are certified and come with extended manufacturer warranty."
        ),
      },
      {
        _key: "card2",
        _type: "card",
        title: i18nStr("Suport instalare", "Installation support"),
        description: i18nTxt(
          "Echipa noastră de specialiști te ghidează de la proiectare până la punerea în funcțiune.",
          "Our specialist team guides you from design to commissioning."
        ),
      },
      {
        _key: "card3",
        _type: "card",
        title: i18nStr("Livrare rapidă", "Fast delivery"),
        description: i18nTxt(
          "Livrare gratuită la comenzi peste 5000 RON. Stoc disponibil în România pentru livrare în 2-5 zile.",
          "Free delivery on orders over 5000 RON. Stock available in Romania for 2-5 day delivery."
        ),
      },
    ],
  },
  {
    _type: "section.marquee",
    _key: "marquee1",
    text: i18nTxt(
      "Livrare gratuită la comenzi peste 5000 RON • Garanție extinsă • Suport tehnic dedicat",
      "Free delivery on orders over 5000 RON • Extended warranty • Dedicated tech support"
    ),
  },
  {
    _type: "section.testimonials",
    _key: "testimonials1",
    title: i18nStr("Ce spun clienții noștri", "What our customers say"),
    testimonials: [
      {
        _type: "reference",
        _ref: "7e033347-ae6d-4181-b7cf-723c1b5d8d05",
        _key: "t1",
        _weak: true,
        _strengthenOnPublish: { _type: "reference" },
      },
      {
        _type: "reference",
        _ref: "1b1a9142-14c4-4505-8bd4-9ff4eb13ebff",
        _key: "t2",
        _weak: true,
        _strengthenOnPublish: { _type: "reference" },
      },
      {
        _type: "reference",
        _ref: "71d8da91-b829-4f9b-b9ce-c7dcc2750848",
        _key: "t3",
        _weak: true,
        _strengthenOnPublish: { _type: "reference" },
      },
      {
        _type: "reference",
        _ref: "0ed4abbc-04dd-47fd-a300-5ac5b5f9c48e",
        _key: "t4",
        _weak: true,
        _strengthenOnPublish: { _type: "reference" },
      },
      {
        _type: "reference",
        _ref: "c81489c4-c820-47dc-bc9d-eba35658071e",
        _key: "t5",
        _weak: true,
        _strengthenOnPublish: { _type: "reference" },
      },
      {
        _type: "reference",
        _ref: "e1103066-f985-45ec-96a1-a2d8ae2bf8f4",
        _key: "t6",
        _weak: true,
        _strengthenOnPublish: { _type: "reference" },
      },
    ],
  },
];

async function main() {
  console.log("Populating homepage sections...");

  await client
    .patch("drafts.home")
    .set({
      title: i18nStr("SolarEdge Supply", "SolarEdge Supply"),
      sections,
    })
    .commit();

  console.log("Homepage populated successfully!");
}

main().catch(console.error);
