import { defineType } from "sanity";

export const faqIndex = defineType({
  extends: [
    "page",
    {
      type: "singleton",
      parameters: {
        id: "faq",
      },
    },
  ],
  fields: [
    {
      group: "content",
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (Rule) => Rule.required(),
    },
    {
      group: "content",
      name: "description",
      title: "Description",
      type: "internationalizedArrayString",
      validation: (Rule) => Rule.required(),
    },
    {
      fields: [
        {
          name: "searchPlaceholder",
          title: "Search placeholder",
          type: "internationalizedArrayString",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "searchNoResults",
          title: "Search no results",
          type: "internationalizedArrayString",
          validation: (Rule) => Rule.required(),
        },
      ],
      group: "content",
      name: "textTranslations",
      title: "Text translations",
      type: "object",
      validation: (Rule) => Rule.required(),
    },
    {
      group: "content",
      name: "category",
      of: [
        {
          name: "title",
          title: "Category title",
          to: [{ type: "faq.category" }],
          type: "reference",
          validation: (Rule) => Rule.required(),
        },
      ],
      title: "Category",
      type: "array",
      validation: (Rule) => Rule.required(),
    },
  ],
  name: "faq.index",
  options: {
    disableCreation: true,
    structureGroup: "FAQ",
    structureOptions: {
      title: "FAQ index",
    },
  },
  preview: {
    prepare: ({ title }) => ({
      title: Array.isArray(title) ? title[0]?.value : title,
    }),
    select: {
      title: "title",
    },
  },
  title: "Faq Index",
  type: "document",
});
