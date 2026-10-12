import type { MenuCategory } from "@/content/menu";
import type { Locale } from "@/i18n/config";
import { formatPrice, tx } from "@/lib/format";
import type { OrderCatalog } from "./types";

/** Every dish a guest can order right now (on the menu, not run out today), keyed by id. */
export function orderCatalog(locale: Locale, menu: MenuCategory[]): OrderCatalog {
  return Object.fromEntries(
    menu
      .flatMap((c) => c.items)
      .filter((item) => !item.soldOutOn)
      .map((item) => [
        item.id,
        {
          name: tx(item.name, locale),
          options: item.prices.map((p) => ({
            label: tx(p.label, locale) || undefined,
            amount: p.amount,
            formatted: formatPrice(p.amount, locale),
          })),
        },
      ]),
  );
}
