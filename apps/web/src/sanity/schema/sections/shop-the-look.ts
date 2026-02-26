import { defineField } from "sanity";

export default defineField({
  fields: [
    {
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "productHotSpots",
      of: [{ type: "spot" }],
      options: {
        imageHotspot: {
          imagePath: "image",
          pathRoot: "parent",
        },
      },
      title: "Product Spots",
      type: "array",
    },
  ],
  name: "section.shopTheLook",
  preview: {
    prepare: ({ title }) => ({
      subtitle: "Shop the look section",
      title: Array.isArray(title) ? title[0]?.value : title,
    }),
    select: {
      title: "title",
    },
  },
  title: "Shop the look section",
  type: "object",
});
