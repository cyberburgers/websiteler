"use client";

import { useEffect, useRef } from "react";
import { WaiterCall, type WaiterLabels } from "@/components/WaiterCall";
import { formatPrice } from "@/lib/format";
import { pricedCart, saveSentOrder, useCart, useSentOrder } from "@/lib/order/cart";
import { useTable } from "@/lib/table";
import { CartSheet, statusText } from "./CartSheet";
import { useOrdering } from "./OrderProvider";

/** How long the phone follows a sent order, and how long "Afiyet olsun" stays once it is at the table. */
const FOLLOW_MS = 3 * 60 * 60 * 1000;
const DELIVERED_SHOWN_MS = 60 * 1000;

/**
 * The bar at the bottom of a table's menu, where the thumb rests: "Garson çağır" and, once something
 * is in the basket, the basket next to it (or how the last order is getting on). Only with a table's QR card.
 */
export function TableDock({
  callsOn,
  callLabels,
  tableLabel,
}: {
  callsOn: boolean;
  callLabels: WaiterLabels;
  tableLabel: string;
}) {
  const table = useTable();
  const ordering = useOrdering();
  const cart = useCart();
  const sent = useSentOrder();
  const cartRef = useRef<HTMLDialogElement>(null);
  const visible = callsOn && Boolean(table);

  // Room at the bottom of the page so the bar never hides the last lines.
  useEffect(() => {
    if (!visible) return;
    const root = document.documentElement;
    root.dataset.garson = "";
    return () => {
      delete root.dataset.garson;
    };
  }, [visible]);

  // Follow the last order: received -> being made -> at the table.
  useEffect(() => {
    if (!sent || sent.status === "teslim") return;
    const check = async () => {
      if (Date.now() - sent.at > FOLLOW_MS) return saveSentOrder(null);
      try {
        const res = await fetch(`/api/garson/durum?id=${encodeURIComponent(sent.id)}`, { cache: "no-store" });
        const data = (await res.json()) as { status?: string };
        if (data.status === "yok") saveSentOrder(null);
        else if ((data.status === "goruldu" || data.status === "teslim") && data.status !== sent.status) {
          navigator.vibrate?.([60, 40, 60]);
          saveSentOrder({ ...sent, status: data.status });
        }
      } catch {
        // Offline for a moment; the next check will try again.
      }
    };
    const timer = window.setInterval(check, 5000);
    return () => window.clearInterval(timer);
  }, [sent]);

  // "Afiyet olsun" stays a minute, then the bar is back to normal.
  useEffect(() => {
    if (sent?.status !== "teslim") return;
    const timer = window.setTimeout(() => saveSentOrder(null), DELIVERED_SHOWN_MS);
    return () => window.clearTimeout(timer);
  }, [sent]);

  if (!visible || !table) return null;

  const tableText = tableLabel.replace("{n}", table);
  const canOrder = Boolean(ordering?.canOrder);
  const { count, total } = ordering ? pricedCart(cart, ordering.catalog) : { count: 0, total: 0 };
  const showCart = canOrder && count > 0;
  const status = canOrder && !showCart && sent && ordering ? statusText(ordering.labels, sent.status) : null;

  return (
    <>
      <div className="print-hidden pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] md:justify-end md:px-8 md:pb-8">
        <div className="animate-bar-in pointer-events-auto flex items-center gap-2">
          <WaiterCall table={table} labels={callLabels} tableLabel={tableLabel} compact={showCart || Boolean(status)} />

          {showCart && ordering && (
            <button
              type="button"
              onClick={() => cartRef.current?.showModal()}
              aria-haspopup="dialog"
              data-sepet=""
              className="flex h-[60px] items-center gap-3 rounded-full bg-fistik-300 pe-5 ps-2 text-start text-zumrut-950 shadow-[0_18px_44px_-14px_rgba(0,0,0,.85)] ring-1 ring-zumrut-950/10 transition hover:bg-fistik-200 active:scale-[.97]"
            >
              <span
                key={count}
                className="grid size-11 shrink-0 animate-[bump_.45s_var(--ease-out-quint)] place-items-center rounded-full bg-zumrut-950 text-base font-extrabold tabular-nums text-fistik-300"
              >
                {count}
              </span>
              <span>
                <span className="block text-[15px] font-extrabold leading-tight">{ordering.labels.viewBasket}</span>
                <span className="block text-xs font-bold tabular-nums text-zumrut-950/70">
                  {tableText} · {formatPrice(total, ordering.locale)}
                </span>
              </span>
            </button>
          )}

          {status && (
            <button
              type="button"
              onClick={() => cartRef.current?.showModal()}
              aria-haspopup="dialog"
              data-siparis-durum={sent?.status}
              className="flex h-[60px] items-center gap-3 rounded-full bg-zumrut-950/90 pe-5 ps-2 text-start shadow-[0_18px_44px_-14px_rgba(0,0,0,.85)] ring-1 ring-fistik-300/30 backdrop-blur-xl transition hover:ring-fistik-300/60 active:scale-[.97]"
            >
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-krem-50 text-zumrut-950">
                {sent?.status === "bekliyor" && (
                  <span className="absolute inset-0 animate-halo rounded-full bg-krem-50/50" />
                )}
                <status.Icon className="relative size-5" strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[15px] font-extrabold leading-tight text-krem-50">{status.title}</span>
                <span className="block text-xs font-semibold text-fistik-200/80">{tableText}</span>
              </span>
            </button>
          )}
        </div>
      </div>
      {canOrder && <CartSheet dialogRef={cartRef} table={table} tableText={tableText} />}
    </>
  );
}
