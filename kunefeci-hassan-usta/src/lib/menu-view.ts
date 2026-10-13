import type { FilterId, MenuViewCategory, MenuViewItem } from "@/components/menu/types";
import { MAX_PAIRING, defaultPairing, tags, type MenuCategory, type MenuItem } from "@/content/menu";
import { locales, localePath, type Locale } from "@/i18n/config";
import { foldForSearch, formatPrice, tx } from "./format";

const HOT_CATEGORIES = ["kunefeler", "sicak-icecekler"];
const COLD_CATEGORIES = ["sutlu-ve-dondurma", "soguk-icecekler"];
// Categories added in the panel are sorted by their name instead.
const isHot = (c: MenuCategory) => HOT_CATEGORIES.includes(c.id) || foldForSearch(c.name.tr).includes("sicak");
const isCold = (c: MenuCategory) =>
  COLD_CATEGORIES.includes(c.id) || /soguk|dondurma/.test(foldForSearch(c.name.tr));

function filtersFor(item: MenuItem, category: MenuCategory): FilterId[] {
  const out: FilterId[] = [];
  if (foldForSearch(`${item.name.tr} ${item.description.tr}`).includes("fistik")) out.push("fistikli");
  if (isHot(category) || item.tags?.includes("sicak")) out.push("sicak");
  if (isCold(category)) out.push("soguk");
  if (item.prices.length > 1 || item.tags?.includes("siparis")) out.push("paylasmalik");
  return out;
}

/**
 * "Yanında iyi gider" for one dish: its own list if the panel gave it one, otherwise the general list for
 * desserts (nothing for drinks). Only what is on the menu and not run out today, never the dish itself.
 */
function pairingFor(
  item: MenuItem,
  category: MenuCategory,
  general: string[],
  onMenu: Map<string, MenuItem>,
): string[] {
  const ids = item.pairing ?? (category.layout === "cards" ? general : []);
  return ids
    .filter((id) => id !== item.id && onMenu.has(id) && !onMenu.get(id)!.soldOutSince)
    .slice(0, MAX_PAIRING);
}

/** The menu guests see (hidden dishes already left out), localized for one language. */
export function menuView(
  locale: Locale,
  menu: MenuCategory[],
  generalPairing: string[] = defaultPairing,
): MenuViewCategory[] {
  const onMenu = new Map(menu.flatMap((c) => c.items).map((i) => [i.id, i]));
  return menu.map((category) => ({
    id: category.id,
    name: tx(category.name, locale),
    description: tx(category.description, locale) || undefined,
    layout: category.layout,
    photo: category.image,
    items: category.items.map(
      (item): MenuViewItem => ({
        id: item.id,
        categoryId: category.id,
        name: tx(item.name, locale),
        description: tx(item.description, locale),
        prices: item.prices.map((p) => ({ label: tx(p.label, locale) || undefined, formatted: formatPrice(p.amount, locale) })),
        tags: (item.tags ?? []).map((t) => ({ id: t, label: tags[t][locale] })),
        photo: item.image,
        soldOut: item.soldOutSince !== undefined,
        pairing: pairingFor(item, category, generalPairing, onMenu),
        filters: filtersFor(item, category),
        search: foldForSearch(
          [...locales.map((l) => item.name[l]), tx(item.description, locale), tx(category.name, locale)].join(" "),
        ),
        waiter: {
          name: item.name.tr,
          prices: item.prices.map((p) => ({ label: p.label?.tr || undefined, formatted: formatPrice(p.amount, "tr") })),
        },
      }),
    ),
  }));
}

/** The whole menu is one page: a dish opens there by its id (/tr#fistikli-kunefe). */
export function itemPath(locale: Locale, itemId: string): string {
  return `${localePath(locale)}#${itemId}`;
}

export { fill } from "./format";
