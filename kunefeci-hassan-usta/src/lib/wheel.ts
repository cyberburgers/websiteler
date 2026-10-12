import type { WheelSlice } from "@/components/wheel/DessertWheel";
import type { MenuCategory } from "@/content/menu";
import { isPhotoKey, photoArt } from "@/content/photos";
import type { Locale } from "@/i18n/config";
import { formatPrice, tx } from "./format";
import { categoryPath } from "./menu-view";

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

/** Every dessert on the menu (not drinks, not pre-order trays, not what has run out today) as a slice of the wheel. */
export function wheelSlices(locale: Locale, menu: MenuCategory[]): WheelSlice[] {
  return menu
    .filter((c) => c.layout === "cards")
    .flatMap((c) => c.items.map((item) => ({ item, categoryId: c.id })))
    .filter(({ item }) => !item.tags?.includes("siparis") && !item.soldOutOn)
    .map(({ item, categoryId }) => ({
      id: item.id,
      name: tx(item.name, locale),
      lines: twoLines(tx(item.shortName, locale) || tx(item.name, locale)),
      description: tx(item.description, locale),
      price: formatPrice(item.prices[0].amount, locale),
      art: item.image && isPhotoKey(item.image) ? photoArt[item.image] : undefined,
      href: categoryPath(locale, categoryId, item.id),
    }));
}
