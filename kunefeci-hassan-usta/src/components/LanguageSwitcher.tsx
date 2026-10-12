"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLocale, localeMeta, locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const rest = isLocale(segments[1] ?? "") ? segments.slice(2).join("/") : segments.slice(1).join("/");

  return (
    <nav aria-label={label}>
      <ul className="inline-flex items-center rounded-full bg-zumrut-950/45 p-[3px] ring-1 ring-krem-50/10 backdrop-blur-md">
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
                className={`grid h-[38px] min-w-10 place-items-center rounded-full px-2.5 text-xs font-extrabold tracking-wide transition-colors ${
                  isCurrent ? "bg-krem-50 text-zumrut-925" : "text-krem-100/70 hover:text-krem-50"
                }`}
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
