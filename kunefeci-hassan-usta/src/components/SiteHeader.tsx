"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Phone, Search } from "lucide-react";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  logo: ReactNode;
  homeHref: string;
  searchHref: string;
  labels: { search: string; back: string; language: string };
  phoneHref: string;
  phoneDisplay: string;
};

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const roundButton =
  "grid size-11 shrink-0 place-items-center rounded-full bg-lacivert-950/45 text-krem-50 ring-1 ring-krem-50/10 backdrop-blur-md transition-colors hover:bg-lacivert-950/70";

/** Search (or back) on the left, the logo in the middle, the language on the right. */
export function SiteHeader({ locale, logo, homeHref, searchHref, labels, phoneHref, phoneDisplay }: Props) {
  const pathname = usePathname();
  const isHome = pathname === homeHref || pathname === `${homeHref}/`;
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
        solid ? "bg-lacivert-925/85 shadow-[0_1px_0_rgba(251,246,231,.06),0_16px_32px_-20px_rgba(0,0,0,.6)] backdrop-blur-xl" : ""
      }`}
    >
      <div className="container-page relative flex h-16 items-center justify-between gap-3 md:h-20">
        {isHome ? (
          <Link href={searchHref} aria-label={labels.search} className={roundButton}>
            <Search className="size-5" aria-hidden="true" />
          </Link>
        ) : (
          <Link href={homeHref} aria-label={labels.back} className={roundButton}>
            <ArrowLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        )}

        <Link
          href={homeHref}
          className="absolute left-1/2 top-1/2 block w-[70px] -translate-x-1/2 -translate-y-1/2 md:w-[96px]"
        >
          {logo}
        </Link>

        <div className="flex items-center gap-3">
          <a
            href={phoneHref}
            className="hidden items-center gap-2 rounded-full bg-sari-300 px-4 py-2.5 text-sm font-bold text-lacivert-900 transition-colors hover:bg-sari-200 md:inline-flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            <span>{phoneDisplay}</span>
          </a>
          <LanguageSwitcher current={locale} label={labels.language} />
        </div>
      </div>
    </header>
  );
}
