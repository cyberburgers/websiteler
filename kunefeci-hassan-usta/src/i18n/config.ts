export const locales = ["tr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

type LocaleMeta = {
  /** Name of the language in that language, for the switcher. */
  label: string;
  short: string;
  dir: "ltr" | "rtl";
  /** BCP 47 tag used for Intl formatting. Arabic keeps Latin digits for prices. */
  intl: string;
  ogLocale: string;
};

export const localeMeta: Record<Locale, LocaleMeta> = {
  tr: { label: "Türkçe", short: "TR", dir: "ltr", intl: "tr-TR", ogLocale: "tr_TR" },
  en: { label: "English", short: "EN", dir: "ltr", intl: "en-GB", ogLocale: "en_GB" },
  ar: { label: "العربية", short: "ع", dir: "rtl", intl: "ar-u-nu-latn", ogLocale: "ar_AR" },
};

/** Builds a locale-prefixed path: localePath("en", "/menu") -> "/en/menu". */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}
