import type { Metadata } from "next";
import { site } from "@/content/site";
import { defaultLocale, localeMeta, localePath, locales, type Locale } from "@/i18n/config";

type Options = {
  locale: Locale;
  /** Path without the language prefix, e.g. "/menu". */
  path: string;
  title?: string;
  description: string;
  noindex?: boolean;
};

export function pageMetadata({ locale, path, title, description, noindex }: Options): Metadata {
  const languages = Object.fromEntries(locales.map((l) => [l, localePath(l, path)]));
  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: { ...languages, "x-default": localePath(defaultLocale, path) },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: localeMeta[locale].ogLocale,
      url: localePath(locale, path),
      ...(title ? { title } : {}),
      description,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image" },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
