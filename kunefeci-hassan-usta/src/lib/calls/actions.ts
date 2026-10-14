"use server";

import { availableMenu } from "@/content/menu";
import { getContent, readContentFresh } from "@/lib/content";
import { count, visitorAddress } from "@/lib/limits";
import { callsEnabled, createCall, createOrder, type CallKind, type OrderLine } from "./store";
import { DEFAULT_TABLES } from "@/content/tables";

export type CallResult =
  | { ok: true; id: string; at: number }
  | { ok: false; reason: "sik" | "dolu" | "kapali" | "hata" };

const KINDS: CallKind[] = ["garson", "hesap"];
const validTable = (table: string) => /^\d{1,3}$/.test(table) && Number(table) >= 1;
/** Above the shop's table count (set in the panel), a table number can only have been typed in by hand. */
const tableExists = (table: string, tables: number | undefined) => Number(table) <= (tables ?? DEFAULT_TABLES);

/**
 * Calls and orders from one visitor's address per minute. Generous, because a busy evening's guests
 * all come through the shop's own wi-fi; it only stops someone flooding the counter screen.
 */
const PER_ADDRESS_PER_MINUTE = 30;
async function tooMany(): Promise<boolean> {
  return (await count(`misafir:${await visitorAddress()}`, 60)) > PER_ADDRESS_PER_MINUTE;
}

/** A guest at a table asks for the waiter (or the bill). */
export async function callWaiterAction(table: string, kind: string): Promise<CallResult> {
  if (!validTable(table)) return { ok: false, reason: "hata" };
  if (!KINDS.includes(kind as CallKind)) return { ok: false, reason: "hata" };
  if (!callsEnabled()) return { ok: false, reason: "kapali" };
  try {
    if (!tableExists(table, (await getContent()).tables)) return { ok: false, reason: "hata" };
    if (await tooMany()) return { ok: false, reason: "sik" };
    return await createCall(String(Number(table)), kind as CallKind);
  } catch (error) {
    console.error("Garson çağrısı kaydedilemedi", error);
    return { ok: false, reason: "hata" };
  }
}

/** `amount`: the unit price the guest was shown, so a price changed in the meantime is noticed. */
export type CartLine = { id: string; option: number; qty: number; amount: number };

export type OrderResult =
  | { ok: true; id: string; at: number }
  /** "bitti": these dishes ran out (or left the menu) since the guest added them. */
  | { ok: false; reason: "bitti"; ids: string[] }
  /** "degisti": the price or the sizes of these dishes changed since the guest's menu was loaded. */
  | { ok: false; reason: "degisti"; ids: string[] }
  | { ok: false; reason: "sik" | "dolu" | "kapali" | "hata" };

const MAX_LINES = 20;
const MAX_QTY = 20;
const MAX_ITEMS = 40;
const MAX_NOTE = 140;

/**
 * A guest sends the basket. Names and prices come from the menu here, never from the phone,
 * and anything that has run out is refused. The menu is read straight from the store, not the page cache,
 * so a dish marked "Bugün yok" a moment ago can't slip through.
 *
 * `requestId` is made once per basket on the phone: if the answer to a sent order is lost on a weak
 * connection and the guest taps again, the same order comes back instead of a second one.
 */
export async function placeOrderAction(
  table: string,
  cart: CartLine[],
  note: string,
  requestId?: string,
): Promise<OrderResult> {
  if (!validTable(table) || !Array.isArray(cart) || cart.length === 0 || cart.length > MAX_LINES) {
    return { ok: false, reason: "hata" };
  }
  try {
    const content = await readContentFresh();
    if (!callsEnabled() || content.tableOrders === false) return { ok: false, reason: "kapali" };
    if (!tableExists(table, content.tables)) return { ok: false, reason: "hata" };
    if (await tooMany()) return { ok: false, reason: "sik" };
    const items = new Map(availableMenu(content.menu).flatMap((c) => c.items).map((i) => [i.id, i]));

    const lines: OrderLine[] = [];
    const gone: string[] = [];
    const changed: string[] = [];
    let itemCount = 0;
    for (const line of cart) {
      const qty = Number(line?.qty);
      const option = Number(line?.option);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY || !Number.isInteger(option)) {
        return { ok: false, reason: "hata" };
      }
      const item = items.get(String(line.id));
      const price = item?.prices[option];
      if (!item || item.soldOutSince) {
        gone.push(String(line.id));
        continue;
      }
      if (!price || price.amount !== Number(line?.amount)) {
        changed.push(String(line.id));
        continue;
      }
      itemCount += qty;
      lines.push({
        name: item.name.tr,
        option: item.prices.length > 1 ? price.label?.tr || undefined : undefined,
        qty,
        amount: price.amount * qty,
      });
    }
    if (gone.length > 0) return { ok: false, reason: "bitti", ids: gone };
    if (changed.length > 0) return { ok: false, reason: "degisti", ids: changed };
    if (itemCount > MAX_ITEMS) return { ok: false, reason: "hata" };

    const cleanNote = String(note ?? "")
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .trim()
      .slice(0, MAX_NOTE);
    return await createOrder(
      String(Number(table)),
      { lines, note: cleanNote || undefined, total: lines.reduce((sum, l) => sum + l.amount, 0) },
      typeof requestId === "string" && /^[\w-]{12,40}$/.test(requestId) ? requestId : undefined,
    );
  } catch (error) {
    console.error("Sipariş kaydedilemedi", error);
    return { ok: false, reason: "hata" };
  }
}
