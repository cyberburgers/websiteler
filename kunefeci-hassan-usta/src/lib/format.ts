import { localeMeta, type Locale } from "@/i18n/config";
import type { Text } from "@/content/menu";

/** The text in this language; the Turkish one when the English hasn't been written yet. */
export function tx(text: Text | undefined, locale: Locale): string {
  return text?.[locale] || text?.tr || "";
}

export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(localeMeta[locale].intl, {
    style: "currency",
    currency: "TRY",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeMeta[locale].intl, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** Folds Turkish letters and accents so "kunefe" finds "Künefe" and "fistik" finds "fıstık". */
export function foldForSearch(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Fills "{n} lezzet" style strings from the dictionary. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}
