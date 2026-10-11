import type { Locale } from "../config";
import en from "./en";
import tr, { type Dictionary } from "./tr";

const dictionaries: Record<Locale, Dictionary> = { tr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
