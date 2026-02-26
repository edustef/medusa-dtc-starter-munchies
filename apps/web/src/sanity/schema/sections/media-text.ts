import { defineField } from "sanity";

export default defineField({
  fields: [
    {
      initialValue: "left",
      name: "imagePosition",
      options: {
        layout: "dropdown",
        list: [
          {
            title: "Left",
            value: "left",
          },
          {
            title: "Right",
            value: "right",
          },
        ],
      },
      title: "Image Position",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      validation: (Rule) => Rule.required(),
    },
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
  name: "section.mediaText",
  preview: {
    prepare: ({ image, title }) => ({
      media: image,
      subtitle: "Media + text section",
      title,
    }),
    select: {
      image: "image",
      title: "description",
    },
  },
  title: "Media + text section",
  type: "object",
});
