import { defineType } from "sanity";

export default defineType({
  extends: "page",
  fields: [
    {
      hidden: true,
      name: "internalTitle",
      title: "Title",
      description:
        "This title is only used internally in Sanity, it won't be displayed on the website.",
      type: "string",
      group: "settings",
    },
    {
      group: "content",
      name: "specs",
      of: [
        {
          fields: [
            {
              name: "title",
              title: "Title",
              type: "internationalizedArrayString",
            },
            {
              name: "content",
              title: "Content",
              type: "internationalizedArrayText",
            },
          ],
          name: "spec",
          type: "object",
        },
      ],
      type: "array",
    },
    {
      fields: [
        { name: "title", title: "Title", type: "internationalizedArrayString" },
        {
          name: "products",
          of: [{ to: [{ type: "product" }], type: "reference" }],
          title: "Addons",
          type: "array",
          validation: (Rule) => Rule.max(3),
        },
      ],
      name: "addons",
      type: "object",
    },

    {
      group: "content",
      name: "sections",
      type: "sectionsBody",
    },
    {
      name: "slugs",
      title: "URL Slugs",
      type: "object",
      fields: [
        {
          name: "ro",
          title: "Romanian slug",
          type: "slug",
        },
        {
          name: "en",
          title: "English slug",
          type: "slug",
        },
      ],
      group: "settings",
    },
  ],
  name: "product",
  options: {
    disableCreation: true,
    localized: false,
  },
  preview: {
    select: {
      title: "internalTitle",
    },
  },
  title: "Product Page",
  type: "document",
});
