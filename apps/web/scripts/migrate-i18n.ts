/**
 * Sanity i18n migration script
 *
 * Converts plain string/text fields to internationalized array format.
 * Run: npx tsx apps/web/scripts/migrate-i18n.ts
 *
 * Requires env vars: PUBLIC_SANITY_STUDIO_PROJECT_ID, PUBLIC_SANITY_STUDIO_DATASET, SANITY_TOKEN
 */
import { createClient } from "@sanity/client";

const projectId = process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_STUDIO_DATASET;
const token = process.env.SANITY_TOKEN;

if (!(projectId && dataset && token)) {
  console.error(
    "Missing env vars: PUBLIC_SANITY_STUDIO_PROJECT_ID, PUBLIC_SANITY_STUDIO_DATASET, SANITY_TOKEN"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-01-16",
  useCdn: false,
});

function toI18nArray(
  value: unknown
): Array<{ _key: string; value: unknown }> | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  // Already migrated (is an array with _key)
  if (Array.isArray(value) && value.length > 0 && value[0]?._key) {
    return undefined;
  }
  return [{ _key: "ro", value }];
}

interface FieldSpec {
  /** Sanity field name */
  field: string;
  /** Nested path (e.g., "addons.title") */
  nested?: boolean;
}

interface MigrationSpec {
  type: string;
  fields: FieldSpec[];
  /** Array fields with nested objects to migrate */
  arrayFields?: Array<{
    arrayField: string;
    fields: string[];
  }>;
}

const migrations: MigrationSpec[] = [
  // Sections are inline objects, so they are migrated as part of their parent documents
  // Documents
  {
    type: "product",
    fields: [],
    arrayFields: [{ arrayField: "specs", fields: ["title", "content"] }],
  },
  {
    type: "modular.page",
    fields: [{ field: "title" }],
  },
  {
    type: "text.page",
    fields: [{ field: "title" }, { field: "description" }],
  },
  {
    type: "category",
    fields: [{ field: "internalTitle" }],
  },
  {
    type: "collection",
    fields: [{ field: "internalTitle" }],
  },
  {
    type: "testimonial",
    fields: [{ field: "quote" }],
  },
  {
    type: "faq.category",
    fields: [{ field: "title" }],
  },
  {
    type: "faq.entry",
    fields: [{ field: "question" }, { field: "answer" }],
  },
  // Singletons
  {
    type: "header",
    fields: [],
    // Nested dropdown titles and card titles are in navigation array — complex migration
  },
  {
    type: "footer",
    fields: [{ field: "placeholder" }, { field: "button" }],
  },
  {
    type: "home",
    fields: [{ field: "title" }],
  },
  {
    type: "dictionary",
    fields: [{ field: "noResultsText" }, { field: "noResultsDescription" }],
  },
  {
    type: "cookie.banner",
    fields: [
      { field: "title" },
      { field: "description" },
      { field: "rejectButton" },
      { field: "acceptButton" },
    ],
  },
  {
    type: "not.found",
    fields: [{ field: "text" }],
  },
  {
    type: "faq.index",
    fields: [{ field: "title" }, { field: "description" }],
  },
];

async function migrateType(spec: MigrationSpec) {
  const docs = await client.fetch(`*[_type == "${spec.type}"]`);
  console.log(`\nMigrating ${docs.length} ${spec.type} documents...`);

  let patchCount = 0;

  for (const doc of docs) {
    const patches: Record<string, unknown> = {};

    // Simple top-level fields
    for (const { field } of spec.fields) {
      const converted = toI18nArray(doc[field]);
      if (converted) {
        patches[field] = converted;
      }
    }

    // Array fields with nested objects
    if (spec.arrayFields) {
      for (const { arrayField, fields } of spec.arrayFields) {
        const arr = doc[arrayField];
        if (Array.isArray(arr)) {
          for (const item of arr) {
            if (!item._key) {
              continue;
            }
            for (const field of fields) {
              const converted = toI18nArray(item[field]);
              if (converted) {
                patches[`${arrayField}[_key=="${item._key}"].${field}`] =
                  converted;
              }
            }
          }
        }
      }
    }

    if (Object.keys(patches).length > 0) {
      await client.patch(doc._id).set(patches).commit();
      patchCount++;
      console.log(`  Patched ${doc._id}`);
    }
  }

  console.log(`  ${patchCount}/${docs.length} documents patched.`);
}

// Also migrate inline sections in documents that have sectionsBody
async function migrateSections() {
  const typesWithSections = ["home", "modular.page", "product"];

  // Section field mappings: section type -> fields to migrate
  const sectionFields: Record<string, string[]> = {
    "section.hero": ["title", "subtitle"],
    "section.assurance": ["title"],
    "section.centeredText": ["text"],
    "section.collectionList": ["title"],
    "section.featuredProducts": ["title"],
    "section.marquee": ["text"],
    "section.mediaText": ["title", "description"],
    "section.shopTheLook": ["title"],
    "section.testimonials": ["title"],
  };

  for (const docType of typesWithSections) {
    const docs = await client.fetch(
      `*[_type == "${docType}" && defined(sections)]`
    );
    console.log(
      `\nMigrating sections in ${docs.length} ${docType} documents...`
    );

    for (const doc of docs) {
      const patches: Record<string, unknown> = {};

      if (Array.isArray(doc.sections)) {
        for (const section of doc.sections) {
          if (!(section._key && section._type)) {
            continue;
          }
          const fields = sectionFields[section._type];
          if (!fields) {
            continue;
          }
          for (const field of fields) {
            const converted = toI18nArray(section[field]);
            if (converted) {
              patches[`sections[_key=="${section._key}"].${field}`] = converted;
            }
          }

          // Migrate nested cards in assurance section
          if (
            section._type === "section.assurance" &&
            Array.isArray(section.cards)
          ) {
            for (const card of section.cards) {
              if (!card._key) {
                continue;
              }
              for (const cardField of ["title", "description"]) {
                const converted = toI18nArray(card[cardField]);
                if (converted) {
                  patches[
                    `sections[_key=="${section._key}"].cards[_key=="${card._key}"].${cardField}`
                  ] = converted;
                }
              }
            }
          }
        }
      }

      if (Object.keys(patches).length > 0) {
        await client.patch(doc._id).set(patches).commit();
        console.log(`  Patched sections in ${doc._id}`);
      }
    }
  }
}

// Migrate CTA labels in header navigation
async function migrateHeaderNavigation() {
  const headers = await client.fetch(`*[_type == "header"]`);
  console.log("\nMigrating header navigation...");

  for (const header of headers) {
    const patches: Record<string, unknown> = {};

    if (Array.isArray(header.navigation)) {
      for (const navItem of header.navigation) {
        if (!navItem._key) {
          continue;
        }

        // Migrate CTA labels in link items
        if (navItem.cta?.label) {
          const converted = toI18nArray(navItem.cta.label);
          if (converted) {
            patches[`navigation[_key=="${navItem._key}"].cta.label`] =
              converted;
          }
        }

        // Migrate dropdown titles
        if (navItem._type === "dropdown" && navItem.title) {
          const converted = toI18nArray(navItem.title);
          if (converted) {
            patches[`navigation[_key=="${navItem._key}"].title`] = converted;
          }
        }

        // Migrate dropdown column titles
        if (Array.isArray(navItem.columns)) {
          for (const col of navItem.columns) {
            if (!col._key) {
              continue;
            }
            const titleConverted = toI18nArray(col.title);
            if (titleConverted) {
              patches[
                `navigation[_key=="${navItem._key}"].columns[_key=="${col._key}"].title`
              ] = titleConverted;
            }

            // Migrate link labels inside columns
            if (Array.isArray(col.links)) {
              for (const link of col.links) {
                if (!link._key) {
                  continue;
                }
                if (link.label) {
                  const labelConverted = toI18nArray(link.label);
                  if (labelConverted) {
                    patches[
                      `navigation[_key=="${navItem._key}"].columns[_key=="${col._key}"].links[_key=="${link._key}"].label`
                    ] = labelConverted;
                  }
                }
              }
            }
          }
        }

        // Migrate card titles
        if (Array.isArray(navItem.cards)) {
          for (const card of navItem.cards) {
            if (!card._key) {
              continue;
            }
            const titleConverted = toI18nArray(card.title);
            if (titleConverted) {
              patches[
                `navigation[_key=="${navItem._key}"].cards[_key=="${card._key}"].title`
              ] = titleConverted;
            }
            // Card CTA label
            if (card.cta?.label) {
              const labelConverted = toI18nArray(card.cta.label);
              if (labelConverted) {
                patches[
                  `navigation[_key=="${navItem._key}"].cards[_key=="${card._key}"].cta.label`
                ] = labelConverted;
              }
            }
          }
        }
      }
    }

    if (Object.keys(patches).length > 0) {
      await client.patch(header._id).set(patches).commit();
      console.log(`  Patched header ${header._id}`);
    }
  }
}

// Migrate SEO fields in all documents that have them
async function migrateSeoFields() {
  const docs = await client.fetch("*[defined(seo)]");
  console.log(`\nMigrating SEO fields in ${docs.length} documents...`);

  for (const doc of docs) {
    const patches: Record<string, unknown> = {};

    if (doc.seo?.title) {
      const converted = toI18nArray(doc.seo.title);
      if (converted) {
        patches["seo.title"] = converted;
      }
    }
    if (doc.seo?.description) {
      const converted = toI18nArray(doc.seo.description);
      if (converted) {
        patches["seo.description"] = converted;
      }
    }

    if (Object.keys(patches).length > 0) {
      await client.patch(doc._id).set(patches).commit();
      console.log(`  Patched SEO in ${doc._id}`);
    }
  }
}

// Migrate FAQ index text translations
async function migrateFaqTextTranslations() {
  const faqIndexes = await client.fetch(`*[_type == "faq.index"]`);
  console.log("\nMigrating FAQ index text translations...");

  for (const doc of faqIndexes) {
    const patches: Record<string, unknown> = {};

    if (doc.textTranslations?.searchPlaceholder) {
      const converted = toI18nArray(doc.textTranslations.searchPlaceholder);
      if (converted) {
        patches["textTranslations.searchPlaceholder"] = converted;
      }
    }
    if (doc.textTranslations?.searchNoResults) {
      const converted = toI18nArray(doc.textTranslations.searchNoResults);
      if (converted) {
        patches["textTranslations.searchNoResults"] = converted;
      }
    }

    if (Object.keys(patches).length > 0) {
      await client.patch(doc._id).set(patches).commit();
      console.log(`  Patched FAQ translations in ${doc._id}`);
    }
  }
}

// Migrate collection list card CTA labels in sections
async function migrateCollectionListCards() {
  const docs = await client.fetch(
    `*[defined(sections)] { _id, sections[_type == "section.collectionList"] }`
  );

  for (const doc of docs) {
    if (!Array.isArray(doc.sections)) {
      continue;
    }
    const patches: Record<string, unknown> = {};

    for (const section of doc.sections) {
      if (!(section._key && Array.isArray(section.cards))) {
        continue;
      }
      for (const card of section.cards) {
        if (!(card._key && card.cta?.label)) {
          continue;
        }
        const converted = toI18nArray(card.cta.label);
        if (converted) {
          patches[
            `sections[_key=="${section._key}"].cards[_key=="${card._key}"].cta.label`
          ] = converted;
        }
      }
    }

    if (Object.keys(patches).length > 0) {
      await client.patch(doc._id).set(patches).commit();
      console.log(`  Patched collection list cards in ${doc._id}`);
    }
  }
}

async function main() {
  console.log("Starting i18n migration...");
  console.log(`Project: ${projectId}, Dataset: ${dataset}`);

  // Migrate top-level document fields
  for (const spec of migrations) {
    await migrateType(spec);
  }

  // Migrate inline sections
  await migrateSections();

  // Migrate header navigation
  await migrateHeaderNavigation();

  // Migrate SEO fields
  await migrateSeoFields();

  // Migrate FAQ text translations
  await migrateFaqTextTranslations();

  // Migrate collection list card CTAs
  await migrateCollectionListCards();

  console.log("\nMigration complete!");
}

main().catch(console.error);
