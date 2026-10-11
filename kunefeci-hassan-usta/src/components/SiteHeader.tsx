"use client";

import Link from "next/link";
import { Menu as MenuIcon, Phone, X } from "lucide-react";
import { Fragment, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WhatsAppIcon } from "./BrandIcons";
import { WheelTrigger } from "./wheel/DessertWheel";
import type { Locale } from "@/i18n/config";

type NavItem = { href: string; label: string };

type Props = {
  locale: Locale;
  logo: ReactNode;
  homeHref: string;
  nav: NavItem[];
  labels: { open: string; close: string; language: string; primary: string; call: string; whatsapp: string };
  phoneHref: string;
  phoneDisplay: string;
  whatsappHref: string;
  wheelLabel: string;
};

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function SiteHeader({
  locale,
  logo,
  homeHref,
  nav,
  labels,
  phoneHref,
  phoneDisplay,
  whatsappHref,
  wheelLabel,
}: Props) {
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 24,
    () => false,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled && !open;
  const tone = solid ? "light" : "dark";

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
          onClick={() => setOpen(false)}
          className={`relative z-10 block shrink-0 transition-all duration-500 ease-[var(--ease-out-expo)] ${
            solid ? "w-[76px] md:w-[96px]" : "w-[112px] translate-y-3 md:w-[148px] md:translate-y-7"
          }`}
        >
          {logo}
        </Link>

        <nav aria-label={labels.primary} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item, i) => (
              <Fragment key={item.href}>
                <li>
                  <Link
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
                      solid ? "text-lacivert-800 hover:bg-lacivert-800/[0.06]" : "text-krem-100 hover:bg-krem-50/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
                {/* The dessert wheel sits right after the menu link, the first item. */}
                {i === 0 && (
                  <li className="me-2">
                    <WheelTrigger label={wheelLabel} tone={tone} className="text-sm" />
                  </li>
                )}
              </Fragment>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <WheelTrigger label={wheelLabel} tone={tone} className="lg:hidden" />
          <div className="hidden sm:block">
            <LanguageSwitcher current={locale} label={labels.language} tone={tone} />
          </div>
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
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? labels.close : labels.open}
            className={`relative z-10 grid size-11 place-items-center rounded-full transition-colors lg:hidden ${
              solid ? "text-lacivert-800 hover:bg-lacivert-800/[0.06]" : "text-krem-50 hover:bg-krem-50/10"
            }`}
          >
            {open ? <X className="size-6" /> : <MenuIcon className="size-6" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="pattern-star animate-fade-in fixed inset-0 h-[100dvh] overflow-y-auto bg-lacivert-900 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-28 lg:hidden"
      >
        <div className="container-page flex min-h-full flex-col">
          <nav aria-label={labels.primary}>
            <ul className="space-y-1">
              {nav.map((item, i) => (
                <li key={item.href} className="animate-rise" style={{ animationDelay: `${60 + i * 50}ms` }}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="font-display flex items-baseline justify-between border-b border-krem-50/10 py-4 text-4xl text-krem-50"
                  >
                    {item.label}
                    <span className="font-brand text-lg text-karamel-300">0{i + 1}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto space-y-5 pt-10">
            <LanguageSwitcher current={locale} label={labels.language} tone="dark" size="lg" />
            <div className="grid grid-cols-2 gap-3">
              <a
                href={phoneHref}
                className="flex items-center justify-center gap-2 rounded-2xl bg-sari-300 px-4 py-4 font-bold text-lacivert-900"
              >
                <Phone className="size-5" aria-hidden="true" />
                {labels.call}
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-krem-50/10 px-4 py-4 font-bold text-krem-50 ring-1 ring-krem-50/15"
              >
                <WhatsAppIcon className="size-5" />
                {labels.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
