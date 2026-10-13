"use client";

import { Check, ChefHat, Heart, Loader2, Minus, Plus, X } from "lucide-react";
import { useState, type RefObject } from "react";
import { placeOrderAction } from "@/lib/calls/actions";
import { formatPrice } from "@/lib/format";
import {
  addOne,
  basketRequestId,
  clearCart,
  missingLines,
  pricedCart,
  removeItems,
  removeLines,
  saveSentOrder,
  setNote,
  setQty,
  useCart,
  useSentOrder,
  type SentOrder,
} from "@/lib/order/cart";
import type { OrderLabels } from "@/lib/order/types";
import { useOrdering } from "./OrderProvider";

const STEPS: SentOrder["status"][] = ["bekliyor", "goruldu", "teslim"];

export function statusText(labels: OrderLabels, status: SentOrder["status"]) {
  if (status === "teslim") return { title: labels.delivered, hint: labels.deliveredHint, Icon: Heart };
  if (status === "goruldu") return { title: labels.preparing, hint: labels.preparingHint, Icon: ChefHat };
  return { title: labels.sentTitle, hint: labels.sentHint, Icon: Check };
}

/**
 * The basket at a table: what was added, how many, a short note, the total and "Siparişi gönder".
 * Once sent, the same sheet follows the order: received -> being made -> at the table.
 */
export function CartSheet({
  dialogRef,
  table,
  tableText,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  table: string;
  tableText: string;
}) {
  const ordering = useOrdering();
  const cart = useCart();
  const sent = useSentOrder();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  if (!ordering) return null;
  const { catalog, labels, locale, canOrder } = ordering;
  const { lines, total } = pricedCart(cart, catalog);
  const missing = missingLines(cart, catalog);
  const money = (amount: number) => formatPrice(amount, locale);
  const close = () => dialogRef.current?.close();

  const send = async () => {
    if (lines.length === 0 || sending) return;
    setSending(true);
    setMessage("");
    // Lines no longer on the menu go now, as the note above the button said they would.
    if (missing.length > 0) removeLines(missing);
    const result = await placeOrderAction(
      table,
      lines.map(({ id, option, qty, price }) => ({ id, option, qty, amount: price.amount })),
      cart.note,
      basketRequestId(),
    ).catch(() => ({ ok: false as const, reason: "hata" as const }));
    setSending(false);
    if (result.ok) {
      navigator.vibrate?.(30);
      saveSentOrder({
        id: result.id,
        at: result.at,
        status: "bekliyor",
        total: money(total),
        lines: lines.map((l) => ({
          name: l.price.label ? `${l.item.name} · ${l.price.label}` : l.item.name,
          qty: l.qty,
          total: money(l.amount),
        })),
      });
      clearCart();
      return;
    }
    if (result.reason === "bitti") {
      const names = result.ids.map((id) => catalog[id]?.name).filter(Boolean);
      removeItems(result.ids);
      setMessage(labels.soldOut.replace("{names}", names.join(", ")));
      return;
    }
    if (result.reason === "degisti") {
      setMessage(labels.changed);
      return;
    }
    const reason = result.reason;
    setMessage(
      reason === "sik" ? labels.tooSoon : reason === "dolu" ? labels.busy : reason === "saat" ? labels.closedNow : labels.error,
    );
  };

  const status = sent ? statusText(labels, sent.status) : null;
  const showStatus = lines.length === 0 && sent && status;

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      onClose={() => setMessage("")}
      aria-labelledby="sepet-baslik"
      className="menu-sheet mx-auto mb-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-[30px] bg-krem-100 p-0 text-zumrut-800 md:my-auto md:max-w-md md:rounded-[30px]"
    >
      <div className="px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 md:px-6 md:pt-5">
        <span aria-hidden="true" className="mx-auto block h-[5px] w-12 rounded-full bg-zumrut-800/15 md:hidden" />
        <div className="mt-3 flex items-center justify-between gap-3">
          <h2 id="sepet-baslik" className="font-display text-[26px] font-semibold leading-tight text-zumrut-900">
            {showStatus ? status.title : labels.title}
          </h2>
          <span className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-zumrut-900 px-3 py-1 text-sm font-extrabold text-fistik-200">{tableText}</span>
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="grid size-10 place-items-center rounded-full bg-krem-200 text-zumrut-900 transition hover:bg-krem-300"
            >
              <X className="size-5" />
            </button>
          </span>
        </div>

        {lines.length > 0 && (
          <>
            {sent && status && sent.status !== "teslim" && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-fistik-300/40 px-3 py-1 text-[13px] font-bold text-zumrut-900">
                <status.Icon className="size-3.5" aria-hidden="true" />
                {labels.lastOrder}: {status.title}
              </p>
            )}
            <ul className="mt-3 divide-y divide-zumrut-800/10">
              {lines.map((l) => (
                <li key={`${l.id}-${l.option}`} data-sepet-satir={l.id} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold leading-snug text-zumrut-900">{l.item.name}</span>
                    {l.price.label && <span className="block text-[13px] text-zumrut-800/60">{l.price.label}</span>}
                    <span className="block text-sm font-extrabold tabular-nums text-karamel-600">{money(l.amount)}</span>
                  </span>
                  <span className="inline-flex h-10 shrink-0 items-center rounded-full bg-white ring-1 ring-zumrut-800/15">
                    <button
                      type="button"
                      onClick={() => setQty(l.id, l.option, l.qty - 1)}
                      aria-label={`${l.item.name}: ${labels.less}`}
                      className="grid size-10 place-items-center rounded-full transition active:scale-90"
                    >
                      <Minus className="size-4" strokeWidth={2.75} aria-hidden="true" />
                    </button>
                    <span className="min-w-5 text-center text-[15px] font-extrabold tabular-nums">{l.qty}</span>
                    <button
                      type="button"
                      onClick={() => addOne(l.id, l.option)}
                      aria-label={`${l.item.name}: ${labels.more}`}
                      className="grid size-10 place-items-center rounded-full transition active:scale-90"
                    >
                      <Plus className="size-4" strokeWidth={2.75} aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>

            <label className="mt-2 block">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zumrut-800/55">{labels.note}</span>
              <textarea
                value={cart.note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={140}
                rows={2}
                placeholder={labels.notePlaceholder}
                className="mt-1.5 block w-full resize-none rounded-2xl bg-white px-4 py-3 text-[15px] text-zumrut-900 ring-1 ring-zumrut-800/15 placeholder:text-zumrut-800/40 focus:outline-none focus:ring-2 focus:ring-zumrut-700"
              />
            </label>

            <div className="mt-4 flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-bold text-zumrut-800/70">{labels.total}</span>
              <span className="text-2xl font-extrabold tabular-nums text-zumrut-900">{money(total)}</span>
            </div>
            <p className="mt-0.5 text-[13px] text-zumrut-800/60">{labels.payHint}</p>

            {(message || missing.length > 0 || !canOrder) && (
              <p role="alert" className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 ring-1 ring-amber-200">
                {!canOrder ? labels.closedNow : message || labels.cartMissing}
              </p>
            )}

            <button
              type="button"
              onClick={send}
              disabled={sending || !canOrder}
              data-siparis-gonder=""
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-zumrut-900 text-[16px] font-extrabold text-krem-50 transition hover:bg-zumrut-800 active:scale-[.98] disabled:opacity-70"
            >
              {sending ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  {labels.sending}
                </>
              ) : (
                `${labels.send.replace("{table}", tableText)} · ${money(total)}`
              )}
            </button>
          </>
        )}

        {showStatus && (
          <div className="mt-4" role="status">
            <ol className="flex items-center gap-1.5" aria-hidden="true">
              {STEPS.map((step, i) => (
                <li
                  key={step}
                  className={`h-1.5 flex-1 rounded-full ${i <= STEPS.indexOf(sent.status) ? "bg-zumrut-800" : "bg-zumrut-800/15"}`}
                />
              ))}
            </ol>
            <div className="mt-5 flex items-center gap-4">
              <span
                className={`grid size-14 shrink-0 place-items-center rounded-full ${sent.status === "bekliyor" ? "bg-zumrut-900 text-fistik-300" : "bg-fistik-300 text-zumrut-950"}`}
              >
                <status.Icon className="size-7" strokeWidth={2.5} aria-hidden="true" />
              </span>
              <p className="text-[15px] leading-relaxed text-zumrut-800/80">{status.hint}</p>
            </div>
            <ul className="mt-5 space-y-1.5 rounded-2xl bg-white p-4 ring-1 ring-zumrut-800/10">
              {sent.lines.map((l, i) => (
                <li key={i} className="flex items-baseline gap-2 text-[15px]">
                  <span className="font-extrabold tabular-nums">{l.qty}×</span>
                  <span className="min-w-0 flex-1">{l.name}</span>
                  <span className="font-bold tabular-nums text-zumrut-800/70">{l.total}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-zumrut-800/10 pt-2 text-[15px] font-extrabold">
                <span>{labels.total}</span>
                <span className="tabular-nums">{sent.total}</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={close}
              className="mt-4 h-12 w-full rounded-2xl bg-zumrut-900 text-[15px] font-extrabold text-krem-50 transition hover:bg-zumrut-800"
            >
              {labels.done}
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
