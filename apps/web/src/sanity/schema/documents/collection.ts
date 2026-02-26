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
  ],
  name: "collection",
  options: {
    disableCreation: true,
  },
  preview: {
    prepare: ({ title }) => ({
      title: Array.isArray(title) ? title[0]?.value : title,
    }),
    select: {
      title: "internalTitle",
    },
  },
  title: "Collection",
  type: "document",
});
