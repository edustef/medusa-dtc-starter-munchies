import { defineType } from "sanity";

export default defineType({
  __experimental_formPreviewTitle: false,
  fields: [
    {
      hidden: true,
      name: "internalTitle",
      title: "Title",
      type: "internationalizedArrayString",
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
    },
  ],
  name: "category",
  options: {
    disableCreation: true,
  },
  preview: {
    select: {
      title: "internalTitle",
    },
  },
  title: "Category",
  type: "document",
});
