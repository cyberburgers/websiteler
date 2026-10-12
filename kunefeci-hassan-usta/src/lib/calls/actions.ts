"use server";

import { callsEnabled, createCall, type CallKind } from "./store";

export type CallResult =
  | { ok: true; id: string; at: number }
  | { ok: false; reason: "sik" | "dolu" | "kapali" | "hata" };

const KINDS: CallKind[] = ["garson", "hesap"];

/** A guest at a table asks for the waiter (or the bill). */
export async function callWaiterAction(table: string, kind: string): Promise<CallResult> {
  if (!/^\d{1,3}$/.test(table) || Number(table) < 1) return { ok: false, reason: "hata" };
  if (!KINDS.includes(kind as CallKind)) return { ok: false, reason: "hata" };
  if (!callsEnabled()) return { ok: false, reason: "kapali" };
  try {
    return await createCall(String(Number(table)), kind as CallKind);
  } catch (error) {
    console.error("Garson çağrısı kaydedilemedi", error);
    return { ok: false, reason: "hata" };
  }
}
