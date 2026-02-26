import type { Link } from "@medusajs/framework/modules-sdk";
import type {
  ExecArgs,
  IFulfillmentModuleService,
  ISalesChannelModuleService,
  IStoreModuleService,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import type { Logger } from "@medusajs/medusa";
import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedDemoData({ container }: ExecArgs) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const remoteLink: Link = container.resolve(ContainerRegistrationKeys.LINK);
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(
    Modules.FULFILLMENT
  );
  const salesChannelModuleService: ISalesChannelModuleService =
    container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService: IStoreModuleService = container.resolve(
    Modules.STORE
  );

  const countries = ["ro"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: "ron",
            is_default: true,
          },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Romania",
          currency_code: "ron",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
      default_tax_rate: {
        name: "Default",
        rate: 19,
        code: `${country_code}-vat`,
      },
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Romanian Warehouse",
          address: {
            city: "Bucharest",
            country_code: "RO",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await remoteLink.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const { result: shippingProfileResult } =
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default",
            type: "default",
          },
        ],
      },
    });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Romanian Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Romania",
        geo_zones: [
          {
            country_code: "ro",
            type: "country",
          },
        ],
      },
    ],
  });

  await remoteLink.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Delivery in 3-5 business days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "ron",
            amount: 150,
          },
          {
            region_id: region.id,
            amount: 150,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: '"true"',
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Express delivery in 1-2 business days.",
          code: "express",
        },
        prices: [
          {
            currency_code: "ron",
            amount: 350,
          },
          {
            region_id: region.id,
            amount: 350,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: '"true"',
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Webshop",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Solar Panels", is_active: true },
        { name: "Inverters", is_active: true },
        { name: "Batteries", is_active: true },
        { name: "Mounting Hardware", is_active: true },
        { name: "Cables & Connectors", is_active: true },
      ],
    },
  });

  // Product 1: SunPower Mono 400W Panel
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "SunPower Mono 400W Panel",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Solar Panels")?.id ?? "",
          ],
          description:
            "High-efficiency 400W monocrystalline solar panel with 21.4% cell efficiency. PERC technology for superior low-light performance. 25-year performance warranty.",
          handle: "sunpower-mono-400w",
          weight: 21_000,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://placehold.co/800x800/FFF6E6/FF5227?text=SunPower+400W",
            },
          ],
          options: [
            {
              title: "Configuration",
              values: ["Single Panel", "Pack of 4", "Pack of 10"],
            },
          ],
          variants: [
            {
              title: "Single Panel",
              sku: "SP-MONO-400-1",
              options: { Configuration: "Single Panel" },
              manage_inventory: false,
              prices: [{ amount: 1450, currency_code: "ron" }],
            },
            {
              title: "Pack of 4",
              sku: "SP-MONO-400-4",
              options: { Configuration: "Pack of 4" },
              manage_inventory: false,
              prices: [{ amount: 5400, currency_code: "ron" }],
            },
            {
              title: "Pack of 10",
              sku: "SP-MONO-400-10",
              options: { Configuration: "Pack of 10" },
              manage_inventory: false,
              prices: [{ amount: 12_500, currency_code: "ron" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });

  // Product 2: EcoLine Poly 330W Panel
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "EcoLine Poly 330W Panel",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Solar Panels")?.id ?? "",
          ],
          description:
            "Reliable 330W polycrystalline solar panel, ideal for residential and commercial installations. Anti-reflective glass coating with salt mist corrosion resistance.",
          handle: "ecoline-poly-330w",
          weight: 19_500,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://placehold.co/800x800/FFF6E6/FF5227?text=EcoLine+330W",
            },
          ],
          options: [
            {
              title: "Configuration",
              values: ["Single Panel", "Pack of 6", "Pack of 12"],
            },
          ],
          variants: [
            {
              title: "Single Panel",
              sku: "EL-POLY-330-1",
              options: { Configuration: "Single Panel" },
              manage_inventory: false,
              prices: [{ amount: 950, currency_code: "ron" }],
            },
            {
              title: "Pack of 6",
              sku: "EL-POLY-330-6",
              options: { Configuration: "Pack of 6" },
              manage_inventory: false,
              prices: [{ amount: 5200, currency_code: "ron" }],
            },
            {
              title: "Pack of 12",
              sku: "EL-POLY-330-12",
              options: { Configuration: "Pack of 12" },
              manage_inventory: false,
              prices: [{ amount: 9800, currency_code: "ron" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });

  // Product 3: NovaSun Bifacial 450W Panel
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "NovaSun Bifacial 450W Panel",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Solar Panels")?.id ?? "",
          ],
          description:
            "Premium 450W bifacial solar panel that captures light from both sides. Up to 30% additional energy yield from rear side. N-type TOPCon cell technology.",
          handle: "novasun-bifacial-450w",
          weight: 24_000,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://placehold.co/800x800/FFF6E6/FF5227?text=NovaSun+450W",
            },
          ],
          options: [
            {
              title: "Configuration",
              values: ["Single Panel", "Pack of 4"],
            },
          ],
          variants: [
            {
              title: "Single Panel",
              sku: "NS-BIFAC-450-1",
              options: { Configuration: "Single Panel" },
              manage_inventory: false,
              prices: [{ amount: 2100, currency_code: "ron" }],
            },
            {
              title: "Pack of 4",
              sku: "NS-BIFAC-450-4",
              options: { Configuration: "Pack of 4" },
              manage_inventory: false,
              prices: [{ amount: 7800, currency_code: "ron" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });

  // Product 4: FlexiSol 100W Flexible Panel
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "FlexiSol 100W Flexible Panel",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Solar Panels")?.id ?? "",
          ],
          description:
            "Lightweight 100W flexible solar panel for RVs, boats, and curved surfaces. Ultra-thin design at only 3mm. IP67 water-resistant junction box.",
          handle: "flexisol-100w-flexible",
          weight: 2500,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://placehold.co/800x800/FFF6E6/FF5227?text=FlexiSol+100W",
            },
          ],
          options: [
            {
              title: "Configuration",
              values: ["Single Panel", "Pack of 2"],
            },
          ],
          variants: [
            {
              title: "Single Panel",
              sku: "FS-FLEX-100-1",
              options: { Configuration: "Single Panel" },
              manage_inventory: false,
              prices: [{ amount: 650, currency_code: "ron" }],
            },
            {
              title: "Pack of 2",
              sku: "FS-FLEX-100-2",
              options: { Configuration: "Pack of 2" },
              manage_inventory: false,
              prices: [{ amount: 1200, currency_code: "ron" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });

  // Product 5: PowerGrid 5kW Hybrid Inverter
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "PowerGrid Hybrid Inverter",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Inverters")?.id ?? "",
          ],
          description:
            "Hybrid solar inverter with built-in MPPT charge controller. Compatible with lithium and lead-acid batteries. WiFi monitoring included. IP65 rated.",
          handle: "powergrid-hybrid-inverter",
          weight: 16_000,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://placehold.co/800x800/FFF6E6/FF5227?text=PowerGrid+Inverter",
            },
          ],
          options: [
            {
              title: "Power Rating",
              values: ["3kW", "5kW", "8kW"],
            },
          ],
          variants: [
            {
              title: "3kW",
              sku: "PG-HYB-3KW",
              options: { "Power Rating": "3kW" },
              manage_inventory: false,
              prices: [{ amount: 3500, currency_code: "ron" }],
            },
            {
              title: "5kW",
              sku: "PG-HYB-5KW",
              options: { "Power Rating": "5kW" },
              manage_inventory: false,
              prices: [{ amount: 5200, currency_code: "ron" }],
            },
            {
              title: "8kW",
              sku: "PG-HYB-8KW",
              options: { "Power Rating": "8kW" },
              manage_inventory: false,
              prices: [{ amount: 7800, currency_code: "ron" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });

  // Product 6: MicroInvert 400 Microinverter
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "MicroInvert 400 Microinverter",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Inverters")?.id ?? "",
          ],
          description:
            "400W microinverter for panel-level power conversion. Maximizes energy harvest with per-panel MPPT. 25-year warranty with real-time monitoring.",
          handle: "microinvert-400",
          weight: 3200,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://placehold.co/800x800/FFF6E6/FF5227?text=MicroInvert+400",
            },
          ],
          options: [
            {
              title: "Configuration",
              values: ["Single Unit", "Pack of 4", "Pack of 10"],
            },
          ],
          variants: [
            {
              title: "Single Unit",
              sku: "MI-400-1",
              options: { Configuration: "Single Unit" },
              manage_inventory: false,
              prices: [{ amount: 850, currency_code: "ron" }],
            },
            {
              title: "Pack of 4",
              sku: "MI-400-4",
              options: { Configuration: "Pack of 4" },
              manage_inventory: false,
              prices: [{ amount: 3100, currency_code: "ron" }],
            },
            {
              title: "Pack of 10",
              sku: "MI-400-10",
              options: { Configuration: "Pack of 10" },
              manage_inventory: false,
              prices: [{ amount: 7000, currency_code: "ron" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });

  // Product 7: VoltStore 10kWh LiFePO4 Battery
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "VoltStore LiFePO4 Battery",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Batteries")?.id ?? "",
          ],
          description:
            "Lithium iron phosphate home battery storage. 6,000+ cycle life at 90% depth of discharge. Stackable design for easy capacity expansion.",
          handle: "voltstore-lifepo4-battery",
          weight: 95_000,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://placehold.co/800x800/FFF6E6/FF5227?text=VoltStore+Battery",
            },
          ],
          options: [
            {
              title: "Capacity",
              values: ["5kWh", "10kWh", "15kWh"],
            },
          ],
          variants: [
            {
              title: "5kWh",
              sku: "VS-LIFE-5",
              options: { Capacity: "5kWh" },
              manage_inventory: false,
              prices: [{ amount: 8500, currency_code: "ron" }],
            },
            {
              title: "10kWh",
              sku: "VS-LIFE-10",
              options: { Capacity: "10kWh" },
              manage_inventory: false,
              prices: [{ amount: 15_500, currency_code: "ron" }],
            },
            {
              title: "15kWh",
              sku: "VS-LIFE-15",
              options: { Capacity: "15kWh" },
              manage_inventory: false,
              prices: [{ amount: 22_000, currency_code: "ron" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });

  // Product 8: CompactCell 2.4kWh Wall Battery
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "CompactCell Wall Battery",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Batteries")?.id ?? "",
          ],
          description:
            "Compact 2.4kWh wall-mounted battery for small solar systems. Integrated BMS with Bluetooth monitoring. Sleek design for indoor or outdoor installation.",
          handle: "compactcell-wall-battery",
          weight: 28_000,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://placehold.co/800x800/FFF6E6/FF5227?text=CompactCell+Battery",
            },
          ],
          options: [
            {
              title: "Configuration",
              values: ["Single Unit", "Pack of 2"],
            },
          ],
          variants: [
            {
              title: "Single Unit",
              sku: "CC-WALL-1",
              options: { Configuration: "Single Unit" },
              manage_inventory: false,
              prices: [{ amount: 4200, currency_code: "ron" }],
            },
            {
              title: "Pack of 2",
              sku: "CC-WALL-2",
              options: { Configuration: "Pack of 2" },
              manage_inventory: false,
              prices: [{ amount: 7800, currency_code: "ron" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });

  // Product 9: RoofMount Pro Universal Kit
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "RoofMount Pro Universal Kit",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Mounting Hardware")
              ?.id ?? "",
          ],
          description:
            "Universal roof mounting system for solar panels. Adjustable tilt angle 15-45 degrees. Anodized aluminum rails with stainless steel hardware. Wind load rated to 170 km/h.",
          handle: "roofmount-pro-universal",
          weight: 18_000,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://placehold.co/800x800/FFF6E6/FF5227?text=RoofMount+Kit",
            },
          ],
          options: [
            {
              title: "Kit Size",
              values: ["4-Panel Kit", "6-Panel Kit", "10-Panel Kit"],
            },
          ],
          variants: [
            {
              title: "4-Panel Kit",
              sku: "RM-PRO-4",
              options: { "Kit Size": "4-Panel Kit" },
              manage_inventory: false,
              prices: [{ amount: 1200, currency_code: "ron" }],
            },
            {
              title: "6-Panel Kit",
              sku: "RM-PRO-6",
              options: { "Kit Size": "6-Panel Kit" },
              manage_inventory: false,
              prices: [{ amount: 1700, currency_code: "ron" }],
            },
            {
              title: "10-Panel Kit",
              sku: "RM-PRO-10",
              options: { "Kit Size": "10-Panel Kit" },
              manage_inventory: false,
              prices: [{ amount: 2600, currency_code: "ron" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });

  // Product 10: SolarLink MC4 Cable Kit
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "SolarLink MC4 Cable Kit",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Cables & Connectors")
              ?.id ?? "",
          ],
          description:
            "Complete MC4 solar cable connection kit. Includes UV-resistant solar cable, MC4 connectors, and crimping tool. TUV certified.",
          handle: "solarlink-mc4-cable-kit",
          weight: 3500,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://placehold.co/800x800/FFF6E6/FF5227?text=MC4+Cable+Kit",
            },
          ],
          options: [
            {
              title: "Cable Length",
              values: ["10m Kit", "20m Kit", "50m Kit"],
            },
          ],
          variants: [
            {
              title: "10m Kit",
              sku: "SL-MC4-10",
              options: { "Cable Length": "10m Kit" },
              manage_inventory: false,
              prices: [{ amount: 280, currency_code: "ron" }],
            },
            {
              title: "20m Kit",
              sku: "SL-MC4-20",
              options: { "Cable Length": "20m Kit" },
              manage_inventory: false,
              prices: [{ amount: 480, currency_code: "ron" }],
            },
            {
              title: "50m Kit",
              sku: "SL-MC4-50",
              options: { "Cable Length": "50m Kit" },
              manage_inventory: false,
              prices: [{ amount: 1050, currency_code: "ron" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });

  logger.info("Finished seeding product data.");
}
