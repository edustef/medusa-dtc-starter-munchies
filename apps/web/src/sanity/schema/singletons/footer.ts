import type { PortableTextBlock } from "@portabletext/types";

import { EnvelopeIcon, InsertBelowIcon, LinkIcon } from "@sanity/icons";
import { defineType } from "sanity";

type RichText = PortableTextBlock[];
const richTextToPlainText = (richText: RichText) => {
  if (Array.isArray(richText)) {
    return richText
      .map((block) => block.children.map((child) => child.text).join(""))
      .join("\n");
  }
  return "";
};

export default defineType({
  extends: [
    {
      type: "singleton",
      parameters: {
        id: "footer",
      },
    },
  ],
  __experimental_formPreviewTitle: false,
  fields: [
    {
      hidden: true,
      name: "title",
      title: "Title",
      type: "string",
    },

    {
      group: "topLinks",
      name: "information",
      of: [
        {
          fields: [
            {
              name: "text",
              type: "i18nPtBody",
            },
          ],
          preview: {
            prepare({ title }) {
              const text = title?.ro || title?.en;
              return {
                title: richTextToPlainText(text) || "line",
              };
            },
            select: {
              title: "text",
            },
          },
          type: "object",
        },
      ],
      title: "Information",
      type: "array",
    },
    {
      group: "topLinks",
      name: "linkList",
      of: [
        {
          fields: [
            {
              name: "links",
              of: [
                {
                  type: "cta",
                },
              ],
              type: "array",
            },
          ],
          preview: {
            prepare: ({ links }) => ({
              title: links
                .map((link: { label: string }) => link.label)
                .join(", "),
            }),
            select: {
              links: "links",
            },
          },
          type: "object",
        },
      ],
      title: "Link list",
      type: "array",
    },
    {
      name: "image",
      title: "Image",
      type: "image",
    },
    {
      group: "newsletter",
      name: "copy",
      title: "Newsletter Copy",
      type: "i18nPtBody",
    },
    {
      group: "newsletter",
      name: "signup_success",
      title: "Signup success message",
      type: "i18nPtBody",
    },
    {
      group: "newsletter",
      name: "signup_error",
      title: "Signup error message",
      type: "i18nPtBody",
    },
    {
      group: "newsletter",
      name: "placeholder",
      title: "Input placeholder",
      type: "internationalizedArrayString",
    },
    {
      group: "newsletter",
      name: "button",
      title: "Newsletter button",
      type: "internationalizedArrayString",
    },
    {
      group: "newsletter",
      name: "footnote",
      title: "Newsletter footnote",
      type: "i18nPtBody",
    },
    {
      group: "bottomLinks",
      name: "bottomLinks",
      of: [
        {
          type: "cta",
        },
      ],
      title: "Bottom links",
      type: "array",
    },
    {
      group: "bottomLinks",
      name: "socialLinks",
      of: [
        {
          type: "cta",
        },
      ],
      title: "Social links",
      type: "array",
    },
  ],
  groups: [
    {
      icon: EnvelopeIcon,
      name: "newsletter",
      title: "Newsletter",
    },
    {
      default: true,
      icon: LinkIcon,
      name: "topLinks",
      title: "Top links",
    },
    {
      icon: LinkIcon,
      name: "bottomLinks",
      title: "Bottom links",
    },
  ],
  icon: InsertBelowIcon,
  name: "footer",
  options: {
    disableCreation: true,
    structureGroup: "Layout",
  },
  preview: {
    prepare: () => ({
      title: "Footer",
    }),
  },
  title: "Footer",
  type: "document",
});
