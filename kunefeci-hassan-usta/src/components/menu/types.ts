import type { Tag } from "@/content/menu";

/** The quick filters on the home page and the search page. */
export const filterIds = ["fistikli", "sicak", "soguk", "paylasmalik"] as const;
export type FilterId = (typeof filterIds)[number];

/** Menu data already localized and price-formatted on the server, ready for the client. */
export type MenuViewItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  prices: { label?: string; formatted: string }[];
  tags: { id: Tag; label: string }[];
  photo?: string;
  /** Marked "bugün yok" in the panel: still listed, but shown as not available today. */
  soldOut: boolean;
  /** "Yanında iyi gider": ids of dishes on the menu today, already worked out from the panel's settings. */
  pairing: string[];
  filters: FilterId[];
  /** Accent-folded text in every language, so "kunefe" or "pistachio" finds the right item. */
  search: string;
  /** Turkish name and price labels for the "show the waiter" screen, whatever language the guest reads. */
  waiter: { name: string; prices: { label?: string; formatted: string }[] };
};

export type MenuViewCategory = {
  id: string;
  name: string;
  description?: string;
  layout: "cards" | "list";
  photo?: string;
  items: MenuViewItem[];
};
