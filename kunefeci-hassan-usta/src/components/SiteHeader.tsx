"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  logo: ReactNode;
  homeHref: string;
  languageLabel: string;
  phoneHref: string;
  phoneDisplay: string;
};

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** Logo, language and phone. The page itself is the menu, so there is nothing else to navigate to. */
export function SiteHeader({ locale, logo, homeHref, languageLabel, phoneHref, phoneDisplay }: Props) {
  const solid = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 24,
    () => false,
  );

  // Tuck the header away while reading down the page; bring it back on any upward scroll.
  useEffect(() => {
    const root = document.documentElement;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 8) return;
      root.dataset.header = y > lastY && y > 320 ? "hidden" : "shown";
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      delete root.dataset.header;
    };
  }, []);

  return (
    <header
      className={`site-header print-hidden fixed inset-x-0 top-0 z-50 ${
        solid
          ? "bg-krem-100/85 shadow-[0_1px_0_rgba(35,38,74,.08),0_12px_32px_-18px_rgba(35,38,74,.35)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Link
          href={homeHref}
          className={`relative z-10 block shrink-0 transition-all duration-500 ease-[var(--ease-out-expo)] ${
            solid ? "w-[76px] md:w-[96px]" : "w-[112px] translate-y-3 md:w-[148px] md:translate-y-7"
          }`}
        >
          {logo}
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher current={locale} label={languageLabel} tone={solid ? "light" : "dark"} />
          <a
            href={phoneHref}
            className={`hidden items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors md:inline-flex ${
              solid
                ? "bg-lacivert-800 text-krem-50 hover:bg-lacivert-700"
                : "bg-sari-300 text-lacivert-900 hover:bg-sari-200"
            }`}
          >
            <Phone className="size-4" aria-hidden="true" />
            <span>{phoneDisplay}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
