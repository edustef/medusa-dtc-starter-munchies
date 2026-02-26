import { defineType } from "sanity";

export default defineType({
  extends: "page",
  fields: [
    {
      group: "content",
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
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
  name: "modular.page",
  preview: {
    prepare: ({ title }) => ({
      title: Array.isArray(title) ? title[0]?.value : title,
    }),
    select: {
      title: "title",
    },
  },
  title: "Modular Page",
  type: "document",
});
