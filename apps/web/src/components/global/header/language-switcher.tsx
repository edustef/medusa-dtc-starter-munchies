import { languages } from "@/i18n/languages";
import { useLanguage } from "@/stores/country";

interface LanguageSwitcherProps {
  alternateUrls: Record<string, string>;
}

export function LanguageSwitcher({ alternateUrls }: LanguageSwitcherProps) {
  const currentLanguage = useLanguage();

  return (
    <div className="flex items-center gap-1 text-sm">
      {languages.map((lang, index) => (
        <span className="flex items-center gap-1" key={lang.id}>
          {index > 0 && <span className="text-accent">/</span>}
          <a
            className={
              currentLanguage === lang.id
                ? "font-semibold"
                : "opacity-60 transition-opacity hover:opacity-100"
            }
            href={alternateUrls[lang.id] ?? `/${lang.id}/`}
          >
            {lang.id.toUpperCase()}
          </a>
        </span>
      ))}
    </div>
  );
}
