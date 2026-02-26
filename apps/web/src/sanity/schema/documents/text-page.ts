import { DocumentTextIcon } from "@sanity/icons";
import { defineType } from "sanity";

export const textPage = defineType({
  extends: "page",
  fields: [
    {
      group: "content",
      name: "title",
      title: "title",
      type: "internationalizedArrayString",
      validation: (Rule) => Rule.required(),
    },
    {
      group: "content",
      name: "description",
      title: "Description",
      type: "internationalizedArrayText",
      validation: (Rule) => Rule.required(),
    },
    {
      group: "content",
      name: "body",
      title: "Content",
      type: "ptBody",
      validation: (Rule) => Rule.required(),
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
  icon: DocumentTextIcon,
  name: "text.page",
  preview: {
    select: {
      title: "title",
    },
  },
  title: "Text Page",
  type: "document",
});
