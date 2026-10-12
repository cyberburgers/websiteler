"use client";

import { Minus, Plus } from "lucide-react";
import type { MenuViewItem } from "@/components/menu/types";
import { addOne, qtyOf, setQty, useCart } from "@/lib/order/cart";
import { useOrdering } from "./OrderProvider";

/**
 * "+ Ekle" on a dish, turning into − 2 + once it is in the basket. Dishes sold in several sizes open
 * their sheet instead, where the size is picked. Shows nothing unless the menu was opened at a table.
 *
 * `tone`: "light" on the cream cards, "dark" on the green drink lines.
 */
export function AddControl({
  item,
  onChoose,
  tone,
}: {
  item: MenuViewItem;
  onChoose: () => void;
  tone: "light" | "dark";
}) {
  const ordering = useOrdering();
  const cart = useCart();
  if (!ordering?.canOrder || item.soldOut || !ordering.catalog[item.id]) return null;
  const { labels } = ordering;
  const sizes = item.prices.length > 1;
  const qty = sizes ? 0 : qtyOf(cart, item.id);

  const filled =
    tone === "light" ? "bg-zumrut-800 text-krem-50 hover:bg-zumrut-700" : "bg-fistik-300 text-zumrut-950 hover:bg-fistik-200";

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => {
          if (sizes) return onChoose();
          addOne(item.id, 0);
          navigator.vibrate?.(15);
        }}
        aria-label={`${item.name}: ${sizes ? labels.choose : labels.add}`}
        data-ekle={item.id}
        className={`animate-pop-in inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full pe-4 ps-3 text-sm font-extrabold transition active:scale-95 ${filled}`}
      >
        <Plus className="size-4" strokeWidth={2.75} aria-hidden="true" />
        {sizes ? labels.choose : labels.add}
      </button>
    );
  }

  const step = "grid size-10 place-items-center rounded-full transition active:scale-90";
  return (
    <span
      data-adet={item.id}
      className={`animate-pop-in inline-flex h-10 shrink-0 items-center rounded-full ${tone === "light" ? "bg-zumrut-800 text-krem-50" : "bg-fistik-300 text-zumrut-950"}`}
    >
      <button type="button" onClick={() => setQty(item.id, 0, qty - 1)} aria-label={`${item.name}: ${labels.less}`} className={step}>
        <Minus className="size-4" strokeWidth={2.75} aria-hidden="true" />
      </button>
      <span aria-live="polite" className="min-w-5 text-center text-[15px] font-extrabold tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => {
          addOne(item.id, 0);
          navigator.vibrate?.(15);
        }}
        aria-label={`${item.name}: ${labels.more}`}
        className={step}
      >
        <Plus className="size-4" strokeWidth={2.75} aria-hidden="true" />
      </button>
    </span>
  );
}
