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
import { Icon } from "@/generated/Icon";
import { CLOSE } from "@/generated/icons";
import type { Country } from "@/lib/medusa/regions";
import { useCountryCodeContext } from "@/stores/country";

interface DialogRootProps {
  className?: string;
  countries: Country[];
}

export function CountrySelectorDialog({
  className,
  countries,
}: DialogRootProps) {
  const [open, setOpen] = useState(false);

  const { countryCode } = useCountryCodeContext();

  const handleCountrySelect = (newCountryCode: string) => {
    // Set region cookie and reload to get new pricing
    document.cookie = `region=${newCountryCode};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
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
                Select your country
              </Heading>
            </Title>
            <CloseDialog
              aria-label="Close"
              className="absolute top-2.5 right-2.5"
            >
              <Icon className="size-9" href={CLOSE} />
            </CloseDialog>
            <div className="flex flex-1 flex-col items-stretch overflow-y-auto">
              {countries.map((country) => (
                <button
                  className="whitespace-nowrap rounded px-s py-xs text-left hover:bg-secondary"
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
      </SideDialog>
    </Dialog>
  );
}
