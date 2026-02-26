import { defineType } from "sanity";

export default defineType({
  extends: "page",
  __experimental_formPreviewTitle: false,
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
  name: "home",
  options: {
    disableCreation: true,
  },
  preview: {
    select: {
      title: "title",
    },
  },
  type: "document",
});
