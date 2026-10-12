import type { FilterId, MenuViewCategory, MenuViewItem } from "@/components/menu/types";
import { allergens, tags, type MenuCategory, type MenuItem } from "@/content/menu";
import { locales, localePath, type Locale } from "@/i18n/config";
import { foldForSearch, formatPrice, tx } from "./format";

/** Drinks suggested next to every dessert in its detail sheet. */
const PAIRING_IDS = ["cay", "mirra"];
const HOT_CATEGORIES = ["kunefeler", "sicak-icecekler"];
const COLD_CATEGORIES = ["sutlu-ve-dondurma", "soguk-icecekler"];
// Categories added in the panel are sorted by their name instead.
const isHot = (c: MenuCategory) => HOT_CATEGORIES.includes(c.id) || foldForSearch(c.name.tr).includes("sicak");
const isCold = (c: MenuCategory) =>
  COLD_CATEGORIES.includes(c.id) || /soguk|dondurma/.test(foldForSearch(c.name.tr));
const CHEAP_UNDER = 250;

function filtersFor(item: MenuItem, category: MenuCategory): FilterId[] {
  const out: FilterId[] = [];
  if (foldForSearch(`${item.name.tr} ${item.description.tr}`).includes("fistik")) out.push("fistikli");
  if (isHot(category) || item.tags?.includes("sicak")) out.push("sicak");
  if (isCold(category)) out.push("soguk");
  if (Math.min(...item.prices.map((p) => p.amount)) < CHEAP_UNDER) out.push("ucuz");
  if (item.prices.length > 1 || item.tags?.includes("siparis")) out.push("paylasmalik");
  return out;
}

/** The menu guests see (hidden dishes already left out), localized for one language. */
export function menuView(locale: Locale, menu: MenuCategory[]): MenuViewCategory[] {
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
        allergens: item.allergens.map((a) => ({ id: a, label: allergens[a][locale] })),
        tags: (item.tags ?? []).map((t) => ({ id: t, label: tags[t][locale] })),
        photo: item.image,
        soldOut: item.soldOutOn !== undefined,
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

export function pairingItems(categories: MenuViewCategory[]): MenuViewItem[] {
  const all = categories.flatMap((c) => c.items);
  return PAIRING_IDS.map((id) => all.find((i) => i.id === id)).filter((i): i is MenuViewItem => Boolean(i));
}

export function categoryPath(locale: Locale, categoryId: string, itemId?: string): string {
  return `${localePath(locale, `/menu/${categoryId}`)}${itemId ? `#${itemId}` : ""}`;
}

export { fill } from "./format";
