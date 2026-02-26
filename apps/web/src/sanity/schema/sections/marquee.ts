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
  name: "section.marquee",
  preview: {
    prepare: ({ text }) => ({
      subtitle: "Marquee section",
      title: text,
    }),
    select: {
      text: "text",
    },
  },
  title: "Marquee section",
  type: "object",
});
