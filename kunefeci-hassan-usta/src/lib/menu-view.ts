import type { FilterId, MenuViewCategory, MenuViewItem } from "@/components/menu/types";
import { allergens, availableMenu, tags, type MenuCategory, type MenuItem } from "@/content/menu";
import { locales, localePath, type Locale } from "@/i18n/config";
import { foldForSearch, formatPrice } from "./format";

/** Drinks suggested next to every dessert in its detail sheet. */
const PAIRING_IDS = ["cay", "mirra"];
const HOT_CATEGORIES = ["kunefeler", "sicak-icecekler"];
const COLD_CATEGORIES = ["sutlu-ve-dondurma", "soguk-icecekler"];
const CHEAP_UNDER = 250;

function filtersFor(item: MenuItem, category: MenuCategory): FilterId[] {
  const out: FilterId[] = [];
  if (foldForSearch(`${item.name.tr} ${item.description.tr}`).includes("fistik")) out.push("fistikli");
  if (HOT_CATEGORIES.includes(category.id) || item.tags?.includes("sicak")) out.push("sicak");
  if (COLD_CATEGORIES.includes(category.id)) out.push("soguk");
  if (Math.min(...item.prices.map((p) => p.amount)) < CHEAP_UNDER) out.push("ucuz");
  if (item.prices.length > 1 || item.tags?.includes("siparis")) out.push("paylasmalik");
  return out;
}

/** The whole menu, localized for one language. */
export function menuView(locale: Locale): MenuViewCategory[] {
  return availableMenu().map((category) => ({
    id: category.id,
    name: category.name[locale],
    description: category.description?.[locale],
    layout: category.layout,
    photo: category.image,
    items: category.items.map(
      (item): MenuViewItem => ({
        id: item.id,
        categoryId: category.id,
        name: item.name[locale],
        description: item.description[locale],
        prices: item.prices.map((p) => ({ label: p.label?.[locale], formatted: formatPrice(p.amount, locale) })),
        allergens: item.allergens.map((a) => ({ id: a, label: allergens[a][locale] })),
        tags: (item.tags ?? []).map((t) => ({ id: t, label: tags[t][locale] })),
        photo: item.image,
        filters: filtersFor(item, category),
        search: foldForSearch(
          [...locales.map((l) => item.name[l]), item.description[locale], category.name[locale]].join(" "),
        ),
        waiter: {
          name: item.name.tr,
          prices: item.prices.map((p) => ({ label: p.label?.tr, formatted: formatPrice(p.amount, "tr") })),
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
