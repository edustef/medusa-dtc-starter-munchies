import { defineType } from "sanity";

import { link } from "./link";

export const cta = defineType({
  fields: [
    {
      name: "label",
      title: "Button label",
      type: "internationalizedArrayString",
    },
    {
      name: "link",
      type: "link",
      validation: (Rule) =>
        Rule.custom((value, { parent }) => {
          const label = (parent as any)?.label;
          if (Array.isArray(label) && label.length > 0) {
            return value ? true : "Required";
          }
          return true;
        }),
    },
  ],
  icon: link.icon,
  name: "cta",
  title: "CTA",
  type: "object",
});
