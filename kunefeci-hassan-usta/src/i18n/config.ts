export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

type LocaleMeta = {
  /** Name of the language in that language, for the switcher. */
  label: string;
  short: string;
  /** BCP 47 tag used for Intl formatting. */
  intl: string;
  ogLocale: string;
};

export const localeMeta: Record<Locale, LocaleMeta> = {
  tr: { label: "Türkçe", short: "TR", intl: "tr-TR", ogLocale: "tr_TR" },
  en: { label: "English", short: "EN", intl: "en-GB", ogLocale: "en_GB" },
};

/** Builds a locale-prefixed path: localePath("en", "/menu") -> "/en/menu". */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}
