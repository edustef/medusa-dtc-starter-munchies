import { defineField } from "sanity";

export default defineField({
  fields: [
    {
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
    },
    {
      name: "cards",
      of: [
        {
          fields: [
            {
              name: "title",
              title: "Title",
              type: "internationalizedArrayString",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "description",
              title: "Description",
              type: "internationalizedArrayText",
              validation: (Rule) => Rule.required(),
            },
          ],
          name: "card",
          title: "Card",
          type: "object",
        },
      ],
      title: "Cards",
      type: "array",
      validation: (Rule) => Rule.required().min(3).max(3),
    },
  ],
  name: "section.assurance",
  preview: {
    prepare: ({ title }) => ({
      subtitle: "Assurance section",
      title: Array.isArray(title) ? title[0]?.value : title,
    }),
    select: {
      title: "title",
    },
  },
  title: "Assurance section",
  type: "object",
});
