import { defineField } from "sanity";

export const seo = defineField({
  fields: [
    {
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
    },
    {
      name: "description",
      title: "Short description for SEO & social sharing (meta description)",
      type: "internationalizedArrayText",
    },
    {
      name: "image",
      title: "Social sharing image",
      type: "ogImage",
    },
    {
      description:
        "Use this in case the content of this page is duplicated elsewhere and you'd like to point search engines to that other URL instead",
      name: "canonicalUrl",
      title: "Custom canonical URL",
      type: "url",
    },
  ],
  name: "seo",
  title: "SEO",
  type: "object",
});
