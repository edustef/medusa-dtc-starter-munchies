import { Dialog, Title } from "@radix-ui/react-dialog";
import { cx } from "class-variance-authority";
import { useState } from "react";
import {
  CloseDialog,
  OpenDialog,
  SideDialog,
} from "@/components/shared/side-dialog";
import { Body } from "@/components/shared/typography/body";
import { Heading } from "@/components/shared/typography/heading";
import { Label } from "@/components/shared/typography/label";
import { Icon } from "@/generated/Icon";
import { CLOSE } from "@/generated/icons";
import { languages } from "@/i18n/languages";
import type { Country } from "@/lib/medusa/regions";
import { useCountryCodeContext, useLanguage } from "@/stores/country";

interface DialogRootProps {
  className?: string;
  countries: Country[];
  alternateUrls: Record<string, string>;
}

export function CountrySelectorDialog({
  className,
  countries,
  alternateUrls,
}: DialogRootProps) {
  const [open, setOpen] = useState(false);

  const { countryCode } = useCountryCodeContext();
  const currentLanguage = useLanguage();

  const handleCountrySelect = async (newCountryCode: string) => {
    if ("cookieStore" in window) {
      await (window as unknown as { cookieStore: CookieStore }).cookieStore.set(
        {
          name: "region",
          value: newCountryCode,
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          sameSite: "lax",
        }
      );
    } else {
      // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not available
      document.cookie = `region=${newCountryCode};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    }
    setOpen(false);
    window.location.reload();
  };

  const selectedCountry =
    countries.find((country) => country?.code === countryCode) || countries[0];

  return (
    <Dialog onOpenChange={(v) => setOpen(v)} open={open}>
      <OpenDialog className={className}>
        <Body
          className={cx(
            "overflow-hidden whitespace-nowrap rounded-lg border-[1.5px] border-accent p-2 lg:border-none",
            className
          )}
          font="sans"
          mobileSize="lg"
        >
          {currentLanguage.toUpperCase()} /{" "}
          {selectedCountry.code?.toUpperCase()} [
          {selectedCountry.currency.symbol}]
        </Body>
      </OpenDialog>
      <SideDialog>
        <div className="relative flex h-full w-full flex-col border-accent border-l bg-background">
          <div className="flex h-full w-full flex-col bg-background p-s pr-xs">
            <Title asChild>
              <Heading
                className="py-4"
                desktopSize="lg"
                font="serif"
                mobileSize="base"
                tag="h2"
              >
                Preferences
              </Heading>
            </Title>
            <CloseDialog
              aria-label="Close"
              className="absolute top-2.5 right-2.5"
            >
              <Icon className="size-9" href={CLOSE} />
            </CloseDialog>
            <div className="flex flex-1 flex-col overflow-y-auto">
              {/* Language */}
              <Label
                className="mb-xs px-s text-accent"
                font="sans"
                mobileSize="sm"
              >
                Language
              </Label>
              <div className="mb-m flex flex-col items-stretch">
                {languages.map((lang) => (
                  <a
                    className={cx(
                      "whitespace-nowrap rounded px-s py-xs text-left hover:bg-secondary",
                      currentLanguage === lang.id &&
                        "bg-secondary font-semibold"
                    )}
                    href={alternateUrls[lang.id] ?? `/${lang.id}/`}
                    key={lang.id}
                  >
                    {lang.title}
                  </a>
                ))}
              </div>
              {/* Country */}
              <Label
                className="mb-xs px-s text-accent"
                font="sans"
                mobileSize="sm"
              >
                Country
              </Label>
              <div className="flex flex-col items-stretch">
                {countries.map((country) => (
                  <button
                    className={cx(
                      "whitespace-nowrap rounded px-s py-xs text-left hover:bg-secondary",
                      country.code === countryCode &&
                        "bg-secondary font-semibold"
                    )}
                    key={country.code}
                    onClick={() => handleCountrySelect(country.code)}
                    type="button"
                  >
                    {country.name} [{country.currency.symbol}]
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SideDialog>
    </Dialog>
  );
}
