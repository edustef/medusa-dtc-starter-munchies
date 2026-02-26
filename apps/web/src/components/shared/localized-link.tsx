import type { ComponentProps } from "react";
import { getLocalizedHref } from "@/lib/utils/get-localized-href";
import { useLanguage } from "@/stores/country";

export function LocalizedLink({
  href = "",
  ...passThroughProps
}: ComponentProps<"a">) {
  const language = useLanguage();

  const localizedHref = getLocalizedHref({
    href: href.toString(),
    language,
  });

  return <a href={localizedHref} {...passThroughProps} />;
}
