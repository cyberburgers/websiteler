"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLocale, localeMeta, locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher({
  current,
  label,
  tone,
  size = "md",
}: {
  current: Locale;
  label: string;
  tone: "dark" | "light";
  size?: "md" | "lg";
}) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const rest = isLocale(segments[1] ?? "") ? segments.slice(2).join("/") : segments.slice(1).join("/");

  const idle = tone === "dark" ? "text-krem-100/70 hover:text-krem-50" : "text-lacivert-800/60 hover:text-lacivert-800";
  const active = tone === "dark" ? "bg-krem-50 text-lacivert-900" : "bg-lacivert-800 text-krem-50";

  return (
    <nav aria-label={label}>
      <ul
        className={`inline-flex items-center gap-0.5 rounded-full p-1 ring-1 transition-colors ${tone === "dark" ? "ring-krem-50/20" : "ring-lacivert-800/15"}`}
      >
        {locales.map((locale) => {
          const isCurrent = locale === current;
          return (
            <li key={locale}>
              <Link
                href={`/${locale}${rest ? `/${rest}` : ""}`}
                hrefLang={locale}
                lang={locale}
                aria-current={isCurrent ? "true" : undefined}
                title={localeMeta[locale].label}
                className={`grid place-items-center rounded-full font-bold tracking-wide transition-colors ${size === "lg" ? "h-11 min-w-14 px-4 text-sm" : "h-7 min-w-9 px-2 text-xs"} ${isCurrent ? active : idle}`}
              >
                {localeMeta[locale].short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
