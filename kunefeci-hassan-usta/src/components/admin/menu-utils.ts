import type { MenuCategory, MenuItem } from "@/content/menu";

/** "Fıstıklı Künefe" → "fistikli-kunefe": the dish's address on the menu (…/menu/kunefeler#fistikli-kunefe). */
export function slugify(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");
}

export function uniqueId(base: string, taken: Set<string>): string {
  const root = slugify(base) || "urun";
  let id = root;
  for (let n = 2; taken.has(id); n++) id = `${root}-${n}`;
  return id;
}

export const TEMP_PREFIX = "yeni-";
export const tempId = () => `${TEMP_PREFIX}${Math.random().toString(36).slice(2, 8)}`;

export function allIds(menu: MenuCategory[]): Set<string> {
  return new Set(menu.flatMap((c) => [c.id, ...c.items.map((i) => i.id)]));
}

export function blankItem(): MenuItem {
  return {
    id: tempId(),
    name: { tr: "", en: "" },
    description: { tr: "", en: "" },
    prices: [{ amount: 0 }],
    allergens: [],
    tags: [],
  };
}

export function blankCategory(): MenuCategory {
  return { id: tempId(), name: { tr: "", en: "" }, layout: "cards", items: [] };
}

export function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return;
  const [entry] = list.splice(from, 1);
  list.splice(to, 0, entry);
}

export const formatTl = (amount: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(amount);
