import { HelpCircleIcon } from "@sanity/icons";
import { defineType } from "sanity";

export const faqEntry = defineType({
  description: "Frequently asked questions",
  fields: [
    {
      name: "question",
      title: "Question",
      type: "internationalizedArrayString",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "answer",
      title: "Answer",
      type: "internationalizedArrayText",
      validation: (Rule) => Rule.required(),
    },
  ],
  icon: HelpCircleIcon,
  name: "faq.entry",
  options: {
    structureGroup: "FAQ",
    structureOptions: {
      title: "FAQ entries",
    },
  },
  preview: {
    prepare({ title }) {
      return {
        title: title ? `${title} - FAQ` : "FAQ",
      };
    },
    select: {
      title: "question",
    },
  },
  title: "FAQs",
  type: "document",
});
