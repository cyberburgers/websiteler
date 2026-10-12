"use client";

import { Check, Plus, Share, Smartphone, X } from "lucide-react";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { useOrdering } from "@/components/order/OrderProvider";
import { Photo } from "@/components/ui";
import { addOne, qtyOf, useCart } from "@/lib/order/cart";
import { useTable } from "@/lib/table";
import { TagBadge, allergenIcons } from "./icons";
import { MenuLink } from "./MenuLink";
import type { MenuViewItem } from "./types";

export type SheetLabels = {
  close: string;
  price: string;
  contains: string;
  noAllergens: string;
  pairing: string;
  showWaiter: string;
  share: string;
  copied: string;
  soldOut: string;
  soldOutHint: string;
};

/** Always Turkish: this screen is read by the waiter, not the guest. */
export type WaiterLabels = { title: string; table: string };

type Props = {
  item: MenuViewItem | null;
  pairing: { item: MenuViewItem; href: string }[];
  labels: SheetLabels;
  waiter: WaiterLabels;
  /** Called when the guest closes the sheet (button, backdrop, swipe or Esc). */
  onDismiss: () => void;
};

export function ItemSheet({ item, pairing, labels, waiter, onDismiss }: Props) {
  const sheetRef = useRef<HTMLDialogElement>(null);
  const waiterRef = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);
  const openFor = useRef<string | null>(null);
  const [copied, setCopied] = useState(false);
  const table = useTable();
  const ordering = useOrdering();
  const cart = useCart();
  // The size picked for ordering (Porsiyon / 1 kg), remembered for the dish it was picked on.
  const [choice, setChoice] = useState<{ id: string; option: number } | null>(null);
  const [addedFor, setAddedFor] = useState<string | null>(null);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    openFor.current = item?.id ?? null;
    if (item && !sheet.open) {
      sheet.showModal();
      sheet.scrollTop = 0;
    } else if (!item && sheet.open) {
      waiterRef.current?.close();
      sheet.close();
    }
  }, [item]);

  // Leaving the page (a pairing link, Back) keeps it alive but hidden for a quick return. A modal left
  // open in there would still lock scrolling and block the new page, so close it quietly.
  useEffect(() => {
    const sheet = sheetRef.current;
    const waiterSheet = waiterRef.current;
    return () => {
      openFor.current = null;
      waiterSheet?.close();
      sheet?.close();
    };
  }, []);

  const touch = {
    onTouchStart: (e: TouchEvent<HTMLDialogElement>) => {
      if (e.currentTarget.scrollTop > 0) return;
      drag.current = { startY: e.touches[0].clientY, dy: 0 };
    },
    onTouchMove: (e: TouchEvent<HTMLDialogElement>) => {
      if (!drag.current) return;
      const dy = Math.max(0, e.touches[0].clientY - drag.current.startY);
      drag.current.dy = dy;
      e.currentTarget.style.transition = "none";
      e.currentTarget.style.translate = `0 ${dy}px`;
    },
    onTouchEnd: (e: TouchEvent<HTMLDialogElement>) => {
      const dragged = drag.current?.dy ?? 0;
      drag.current = null;
      e.currentTarget.style.transition = "";
      e.currentTarget.style.translate = "";
      if (dragged > 110) e.currentTarget.close();
    },
  };

  const share = async () => {
    if (!item) return;
    const url = `${window.location.origin}${window.location.pathname}#${item.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.name, url });
      } catch {
        // The guest closed the share menu.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // No clipboard access; nothing more we can do.
    }
  };

  const others = pairing.filter((p) => p.item.id !== item?.id && !p.item.soldOut);
  const out = item?.soldOut ?? false;
  const orderable = Boolean(item && ordering?.canOrder && !out && ordering.catalog[item.id]);
  const option = item && choice?.id === item.id ? choice.option : 0;
  const pickable = orderable && (item?.prices.length ?? 0) > 1;

  const add = () => {
    if (!item) return;
    addOne(item.id, option);
    navigator.vibrate?.(15);
    setAddedFor(item.id);
    window.setTimeout(() => setAddedFor((current) => (current === item.id ? null : current)), 1600);
  };

  return (
    <>
      <dialog
        ref={sheetRef}
        onClose={() => {
          // Closed by the guest rather than by the parent clearing `item`.
          if (openFor.current) {
            openFor.current = null;
            onDismiss();
          }
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        aria-labelledby="urun-baslik"
        {...touch}
        className="menu-sheet mx-auto mb-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-[30px] bg-krem-100 p-0 text-zumrut-800 md:my-auto md:max-w-lg md:rounded-[30px]"
      >
        {item && (
          <article className="flex min-h-full flex-col">
            <div
              className={`relative shrink-0 overflow-hidden ${item.photo ? "h-[min(18rem,38dvh)] bg-krem-200" : "h-16 border-b border-zumrut-800/10"}`}
            >
              {item.photo && (
                <Photo photo={item.photo} alt={item.name} sizes="(min-width: 768px) 32rem, 100vw" />
              )}
              <span
                aria-hidden="true"
                className={`absolute left-1/2 top-2.5 h-[5px] w-12 -translate-x-1/2 rounded-full md:hidden ${item.photo ? "bg-krem-50/85" : "bg-zumrut-800/15"}`}
              />
              <button
                type="button"
                onClick={() => sheetRef.current?.close()}
                aria-label={labels.close}
                className="absolute end-3 top-3.5 grid size-11 place-items-center rounded-full bg-krem-50/90 text-zumrut-900 shadow-lg backdrop-blur transition hover:bg-krem-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 px-5 pb-6 pt-5 md:px-7">
              {item.tags.length > 0 && (
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <TagBadge key={t.id} id={t.id} label={t.label} />
                  ))}
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <h2 id="urun-baslik" className="font-display text-[30px] font-semibold leading-[1.05]">
                  {item.name}
                </h2>
                {item.prices.length === 1 && (
                  <span
                    className="shrink-0 rounded-full bg-zumrut-800 px-3.5 py-1.5 text-lg font-extrabold tabular-nums text-fistik-300"
                  >
                    {item.prices[0].formatted}
                  </span>
                )}
              </div>
              {out && (
                <p className="mt-3 flex items-center gap-2.5 rounded-[16px] bg-zumrut-800 py-2.5 pe-4 ps-2.5 text-sm font-semibold text-krem-50">
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-krem-50 px-2.5 py-1 text-[12.5px] font-extrabold text-zumrut-900">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-karamel-500" />
                    {labels.soldOut}
                  </span>
                  {labels.soldOutHint}
                </p>
              )}
              <p className="mt-2 text-[15px] leading-relaxed text-zumrut-800/75">{item.description}</p>

              {item.prices.length > 1 && (
                <div className="mt-4 grid grid-cols-2 gap-2" role={pickable ? "radiogroup" : undefined}>
                  {item.prices.map((p, i) =>
                    pickable ? (
                      <button
                        key={p.label}
                        type="button"
                        role="radio"
                        aria-checked={option === i}
                        onClick={() => setChoice({ id: item.id, option: i })}
                        className={`flex h-14 flex-col items-center justify-center rounded-2xl transition ${
                          option === i
                            ? "bg-zumrut-800 text-krem-50 ring-2 ring-zumrut-800"
                            : "bg-krem-50 ring-1 ring-zumrut-800/10 hover:ring-zumrut-800/30"
                        }`}
                      >
                        <span className={`text-xs font-semibold ${option === i ? "text-krem-100/80" : "text-zumrut-800/65"}`}>
                          {p.label}
                        </span>
                        <span
                          className={`text-[17px] font-extrabold tabular-nums ${option === i ? "text-fistik-300" : "text-karamel-600"}`}
                        >
                          {p.formatted}
                        </span>
                      </button>
                    ) : (
                      <div
                        key={p.label}
                        className="flex h-14 flex-col items-center justify-center rounded-2xl bg-krem-50 ring-1 ring-zumrut-800/10"
                      >
                        <span className="text-xs font-semibold text-zumrut-800/65">{p.label}</span>
                        <span className="text-[17px] font-extrabold tabular-nums text-karamel-600">{p.formatted}</span>
                      </div>
                    ),
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[18px] bg-krem-200/70 px-4 py-3">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-zumrut-800/55">
                  {labels.contains}
                </span>
                {item.allergens.length > 0 ? (
                  <span className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] font-bold text-karamel-700">
                    {item.allergens.map((a) => {
                      const Icon = allergenIcons[a.id];
                      return (
                        <span key={a.id} className="inline-flex items-center gap-1">
                          <Icon className="size-[15px]" strokeWidth={1.8} aria-hidden="true" />
                          {a.label}
                        </span>
                      );
                    })}
                  </span>
                ) : (
                  <span className="text-[13px] text-zumrut-800/65">{labels.noAllergens}</span>
                )}
              </div>

              {others.length > 0 && (
                <>
                  <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-zumrut-800/55">
                    {labels.pairing}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {others.map(({ item: drink, href }) => (
                      <MenuLink
                        key={drink.id}
                        href={href}
                        className="flex items-center gap-2.5 rounded-2xl bg-krem-50 p-[7px] shadow-[0_1px_0_rgba(44,68,54,.06)] ring-1 ring-zumrut-800/[0.06] transition hover:ring-karamel-300"
                      >
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-krem-200">
                          <Photo photo={drink.photo} alt="" sizes="44px" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-extrabold">{drink.name}</span>
                          <span className="block text-[12.5px] font-bold text-karamel-600">
                            {drink.prices[0].formatted}
                          </span>
                        </span>
                      </MenuLink>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="sticky bottom-0 flex gap-2 bg-gradient-to-b from-krem-100/0 via-krem-100 via-30% to-krem-100 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 md:px-6">
              {out ? (
                <p className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[18px] bg-krem-200 text-[15px] font-extrabold text-zumrut-900">
                  <span aria-hidden="true" className="size-2 rounded-full bg-karamel-500" />
                  {labels.soldOut}
                </p>
              ) : orderable && ordering ? (
                <button
                  type="button"
                  onClick={add}
                  data-siparise-ekle=""
                  className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[18px] bg-zumrut-800 text-[15px] font-extrabold text-krem-50 transition hover:bg-zumrut-700 active:scale-[.98]"
                >
                  {addedFor === item.id ? (
                    <>
                      <Check className="size-[18px] text-fistik-300" strokeWidth={3} aria-hidden="true" />
                      {ordering.labels.added} · {qtyOf(cart, item.id, option)}
                    </>
                  ) : (
                    <>
                      <Plus className="size-[18px] text-fistik-300" strokeWidth={2.75} aria-hidden="true" />
                      {ordering.labels.addToOrder} · {item.prices[option]?.formatted}
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => waiterRef.current?.showModal()}
                  className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[18px] bg-zumrut-800 text-[15px] font-extrabold text-krem-50 transition hover:bg-zumrut-700 active:scale-[.98]"
                >
                  <Smartphone className="size-[18px] text-fistik-300" aria-hidden="true" />
                  {labels.showWaiter}
                </button>
              )}
              <button
                type="button"
                onClick={share}
                aria-label={labels.share}
                className="relative grid size-[54px] shrink-0 place-items-center rounded-[18px] bg-krem-200 text-zumrut-800 transition hover:bg-krem-300 active:scale-[.96]"
              >
                {copied ? <Check className="size-5 text-fistik-600" /> : <Share className="size-5" />}
              </button>
              <p
                role="status"
                className={`pointer-events-none absolute -top-8 right-4 rounded-full bg-zumrut-800 px-3 py-1.5 text-xs font-bold text-krem-50 transition-opacity ${copied ? "opacity-100" : "opacity-0"}`}
              >
                {copied ? labels.copied : ""}
              </p>
            </div>
          </article>
        )}
      </dialog>

      {/* Full screen, big type: the guest turns the phone round and the waiter reads the order. */}
      <dialog
        ref={waiterRef}
        onClick={() => waiterRef.current?.close()}
        aria-labelledby="garson-baslik"
        className="waiter-sheet pattern-star m-0 h-dvh max-h-none w-full max-w-none bg-zumrut-900 p-0 text-krem-50"
      >
        {item && (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-fistik-300">{waiter.title}</p>
            <h2 id="garson-baslik" className="font-display text-[clamp(2.75rem,12vw,5rem)] font-semibold leading-[1]">
              {item.waiter.name}
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {item.waiter.prices.map((p) => (
                <span
                  key={p.label ?? "tek"}
                  className="rounded-full bg-krem-50/10 px-4 py-2 text-lg font-extrabold tabular-nums text-fistik-300"
                >
                  {p.label ? `${p.label} · ` : ""}
                  {p.formatted}
                </span>
              ))}
            </div>
            {table && (
              <span className="mt-2 rounded-full bg-fistik-300 px-6 py-2.5 text-2xl font-extrabold text-zumrut-900">
                {waiter.table.replace("{n}", table)}
              </span>
            )}
            <button
              type="button"
              aria-label={labels.close}
              className="absolute end-4 top-[max(1rem,env(safe-area-inset-top))] grid size-12 place-items-center rounded-full bg-krem-50/10 text-krem-50"
            >
              <X className="size-6" />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
