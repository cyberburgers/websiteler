"use server";

import { getContent, getMenu } from "@/lib/content";
import { callsEnabled, createCall, createOrder, type CallKind, type OrderLine } from "./store";

export type CallResult =
  | { ok: true; id: string; at: number }
  | { ok: false; reason: "sik" | "dolu" | "kapali" | "hata" };

const KINDS: CallKind[] = ["garson", "hesap"];
const validTable = (table: string) => /^\d{1,3}$/.test(table) && Number(table) >= 1;

/** A guest at a table asks for the waiter (or the bill). */
export async function callWaiterAction(table: string, kind: string): Promise<CallResult> {
  if (!validTable(table)) return { ok: false, reason: "hata" };
  if (!KINDS.includes(kind as CallKind)) return { ok: false, reason: "hata" };
  if (!callsEnabled()) return { ok: false, reason: "kapali" };
  try {
    return await createCall(String(Number(table)), kind as CallKind);
  } catch (error) {
    console.error("Garson çağrısı kaydedilemedi", error);
    return { ok: false, reason: "hata" };
  }
}

export type CartLine = { id: string; option: number; qty: number };

export type OrderResult =
  | { ok: true; id: string; at: number }
  /** "bitti": these dishes ran out (or left the menu) since the guest added them. */
  | { ok: false; reason: "bitti"; ids: string[] }
  | { ok: false; reason: "sik" | "dolu" | "kapali" | "hata" };

const MAX_LINES = 20;
const MAX_QTY = 20;
const MAX_ITEMS = 40;
const MAX_NOTE = 140;

/**
 * A guest sends the basket. Names and prices come from the menu here, never from the phone,
 * and anything that has run out today is refused.
 */
export async function placeOrderAction(table: string, cart: CartLine[], note: string): Promise<OrderResult> {
  if (!validTable(table) || !Array.isArray(cart) || cart.length === 0 || cart.length > MAX_LINES) {
    return { ok: false, reason: "hata" };
  }
  try {
    const content = await getContent();
    if (!callsEnabled() || content.tableOrders === false) return { ok: false, reason: "kapali" };
    const items = new Map((await getMenu()).flatMap((c) => c.items).map((i) => [i.id, i]));

    const lines: OrderLine[] = [];
    const gone: string[] = [];
    let count = 0;
    for (const line of cart) {
      const qty = Number(line?.qty);
      const option = Number(line?.option);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY || !Number.isInteger(option)) {
        return { ok: false, reason: "hata" };
      }
      const item = items.get(String(line.id));
      const price = item?.prices[option];
      if (!item || !price || item.soldOutOn) {
        gone.push(String(line.id));
        continue;
      }
      count += qty;
      lines.push({
        name: item.name.tr,
        option: item.prices.length > 1 ? price.label?.tr || undefined : undefined,
        qty,
        amount: price.amount * qty,
      });
    }
    if (gone.length > 0) return { ok: false, reason: "bitti", ids: gone };
    if (count > MAX_ITEMS) return { ok: false, reason: "hata" };

    const cleanNote = String(note ?? "")
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .trim()
      .slice(0, MAX_NOTE);
    return await createOrder(String(Number(table)), {
      lines,
      note: cleanNote || undefined,
      total: lines.reduce((sum, l) => sum + l.amount, 0),
    });
  } catch (error) {
    console.error("Sipariş kaydedilemedi", error);
    return { ok: false, reason: "hata" };
  }
}
