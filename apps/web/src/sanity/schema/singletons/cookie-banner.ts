import { defineType } from "sanity";

export const cookieBanner = defineType({
  extends: [
    {
      type: "singleton",
      parameters: {
        id: "cookieBanner",
      },
    },
  ],
  description: "Only relevant if you're storing user cookies",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
    },
    {
      name: "description",
      title: "Description",
      type: "internationalizedArrayText",
    },
    {
      name: "rejectButton",
      title: "Reject cookies button",
      type: "internationalizedArrayString",
    },
    {
      name: "acceptButton",
      title: "Accept cookies button",
      type: "internationalizedArrayString",
    },
  ],
  name: "cookie.banner",
  options: {
    disableCreation: true,
    structureGroup: "Layout",
  },
  preview: {
    prepare: ({ title }) => ({
      title: Array.isArray(title) ? title[0]?.value : title,
    }),
    select: {
      title: "title",
    },
  },
  title: "Cookie banner",
  type: "document",
});
