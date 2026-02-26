import { defineField } from "sanity";

export default defineField({
  fields: [
    {
      name: "text",
      title: "Text",
      type: "internationalizedArrayText",
      validation: (Rule) => Rule.required(),
    },
  ],
  name: "section.centeredText",
  preview: {
    prepare: ({ text }) => ({
      subtitle: "Centered text section",
      title: Array.isArray(text) ? text[0]?.value : text,
    }),
    select: {
      text: "text",
    },
  },
  title: "Centered text section",
  type: "object",
});
