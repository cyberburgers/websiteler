import type { WheelSlice } from "@/components/wheel/DessertWheel";
import { availableMenu } from "@/content/menu";
import { photoArt } from "@/content/photos";
import { localePath, type Locale } from "@/i18n/config";
import { formatPrice } from "./format";

/** Splits a name over at most two lines, as evenly as the words allow. */
function twoLines(name: string): string[] {
  const words = name.split(" ");
  if (words.length < 2) return [name];
  let best = [name];
  let bestLen = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const longest = Math.max(a.length, b.length);
    if (longest < bestLen) {
      bestLen = longest;
      best = [a, b];
    }
  }
  return best;
}

/** Every dessert on the menu (not drinks, not pre-order trays) as a slice of the wheel. */
export function wheelSlices(locale: Locale): WheelSlice[] {
  return availableMenu()
    .filter((c) => c.layout === "cards")
    .flatMap((c) => c.items)
    .filter((item) => !item.tags?.includes("siparis"))
    .map((item) => ({
      id: item.id,
      name: item.name[locale],
      lines: twoLines((item.shortName ?? item.name)[locale]),
      description: item.description[locale],
      price: formatPrice(item.prices[0].amount, locale),
      art: item.image ? photoArt[item.image] : undefined,
      href: `${localePath(locale, "/menu")}#${item.id}`,
    }));
}
