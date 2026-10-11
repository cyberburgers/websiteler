import type { StaticImageData } from "next/image";
import type { Allergen, Tag } from "@/content/menu";

/** Menu data already localized and price-formatted on the server, ready for the client explorer. */
export type MenuViewItem = {
  id: string;
  name: string;
  description: string;
  prices: { label?: string; formatted: string }[];
  allergens: { id: Allergen; label: string }[];
  tags: { id: Tag; label: string }[];
  image?: StaticImageData;
  /** Accent-folded text in every language, so "kunefe" or "pistachio" finds the right item. */
  search: string;
};

export type MenuViewCategory = {
  id: string;
  name: string;
  description?: string;
  layout: "cards" | "list";
  items: MenuViewItem[];
};

export type MenuLabels = {
  search: string;
  searchPlaceholder: string;
  clear: string;
  categories: string;
  noResults: string;
  results: string;
  price: string;
  contains: string;
  noAllergens: string;
  close: string;
};
