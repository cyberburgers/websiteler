import type { WheelSlice } from "@/components/wheel/DessertWheel";
import type { MenuCategory } from "@/content/menu";
import type { ArtKind } from "@/components/art/FoodArt";
import type { Locale } from "@/i18n/config";
import { foldForSearch, formatPrice, tx } from "./format";
import { itemPath } from "./menu-view";

/** The drawing on each dessert's slice, by dish. */
const ART: Record<string, ArtKind> = {
  kunefe: "kunefe",
  "fistikli-kunefe": "kunefe-fistik",
  "kaymakli-kunefe": "kunefe-kaymak",
  "dondurmali-kunefe": "kunefe-dondurma",
  "tepsi-kunefe": "tepsi",
  sillik: "sillik",
  "fistikli-baklava": "baklava",
  "burma-kadayif": "burma",
  sobiyet: "sobiyet",
  "fistikli-katmer": "katmer",
  "maras-dondurmasi": "dondurma",
  "firin-sutlac": "sutlac",
};

/** A dessert added in the panel gets the drawing its name suggests, if any. */
const ART_BY_NAME: [RegExp, ArtKind][] = [
  [/kunefe/, "kunefe"],
  [/baklava/, "baklava"],
  [/kadayif|burma/, "burma"],
  [/sobiyet|sobie/, "sobiyet"],
  [/katmer/, "katmer"],
  [/sillik/, "sillik"],
  [/dondurma/, "dondurma"],
  [/sutlac/, "sutlac"],
];

function artFor(id: string, name: string): ArtKind | undefined {
  if (ART[id]) return ART[id];
  const folded = foldForSearch(name);
  return ART_BY_NAME.find(([pattern]) => pattern.test(folded))?.[1];
}

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
    .flatMap((c) => c.items)
    .filter((item) => !item.tags?.includes("siparis") && !item.soldOutSince)
    .map((item) => ({
      id: item.id,
      name: tx(item.name, locale),
      lines: twoLines(tx(item.shortName, locale) || tx(item.name, locale)),
      description: tx(item.description, locale),
      price: formatPrice(item.prices[0].amount, locale),
      art: artFor(item.id, item.name.tr),
      href: itemPath(locale, item.id),
    }));
}
