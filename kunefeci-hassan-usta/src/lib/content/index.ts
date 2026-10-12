import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { availableMenu, defaultMenu, defaultMenuUpdatedAt, type MenuCategory, type Text } from "@/content/menu";
import { defaultInfo, type ShopInfo } from "@/content/site";
import { serviceDay } from "@/lib/serviceDay";
import { contentSchema } from "./schema";
import { readStoredContent } from "./store";

/** The menu and shop details, as edited in the panel (or the starting content until the first save). */
export type SiteContent = {
  info: ShopInfo;
  menu: MenuCategory[];
  /** No longer shown; kept so content saved by older versions of the panel still reads. */
  featuredId?: string;
  /** A short note shown at the top of the home page (holiday hours and the like). Empty: no note. */
  notice?: Text;
  /** False: guests at a table can only call the waiter, not order from the menu. On unless turned off. */
  tableOrders?: boolean;
  menuUpdatedAt: string;
  /** When the panel last saved; the panel uses it to spot two people editing at once. */
  savedAt?: string;
};

export const CONTENT_TAG = "icerik";

export function defaultContent(): SiteContent {
  return { info: defaultInfo, menu: defaultMenu, menuUpdatedAt: defaultMenuUpdatedAt };
}

/** Reads the store directly, bypassing the cache: for the panel and for saving. */
export async function readContentFresh(): Promise<SiteContent> {
  const raw = await readStoredContent();
  if (raw === null) return defaultContent();
  const parsed = contentSchema.safeParse(raw);
  // Never fall back to the starting menu over a stored one: that would quietly undo the shop's edits.
  if (!parsed.success) throw new Error(`Kayıtlı menü okunamadı: ${parsed.error.issues[0]?.message}`);
  return parsed.data as SiteContent;
}

/** "Bugün yok" only holds for the day it was set; from the next morning the dish is back on its own. */
function dropPastSoldOut(content: SiteContent, today: string): SiteContent {
  return {
    ...content,
    menu: content.menu.map((c) => ({
      ...c,
      items: c.items.map(({ soldOutOn, ...item }) => (soldOutOn === today ? { ...item, soldOutOn } : item)),
    })),
  };
}

/**
 * The content for the public pages. Cached until the panel saves (which expires the tag), and read
 * again every hour so yesterday's "bugün yok" marks are gone by the time the shop opens.
 */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  return dropPastSoldOut(await readContentFresh(), serviceDay());
}

/** What guests see: hidden dishes and empty categories left out. */
export async function getMenu(): Promise<MenuCategory[]> {
  return availableMenu((await getContent()).menu);
}
