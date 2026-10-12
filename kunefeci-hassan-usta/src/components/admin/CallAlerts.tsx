"use client";

import { BellOff, BellRing, ChefHat, ReceiptText, ShoppingBag } from "lucide-react";
import { useEffect, useRef } from "react";
import { LATE_MS, byUrgency, since, useWaiterCalls } from "@/lib/calls/useWaiterCalls";
import { formatPrice } from "@/lib/format";

const SHOWN = 4;

/**
 * Waiter calls in the panel: while the panel is open on this phone or computer, a table's call drops in under
 * the header, stays at the top while scrolling, and chimes. Returns the sound switch for the header and the cards.
 */
export function usePanelCalls(staffKey: string | null) {
  const { calls, now, soundOn, setSound, answer } = useWaiterCalls(staffKey);
  const tried = useRef(false);

  // Browsers keep a page silent until it is tapped. The owner taps around the panel anyway,
  // so the first tap anywhere turns the sound on; no need to hunt for a button.
  useEffect(() => {
    if (!staffKey) return;
    const unlock = (e: Event) => {
      if (tried.current || (e.target instanceof Element && e.target.closest("[data-cagri-sesi]"))) return;
      tried.current = true;
      void setSound(true, { test: false });
    };
    window.addEventListener("click", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.removeEventListener("click", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, [staffKey, setSound]);

  const waiting = calls.filter((c) => !c.seenAt).length;

  // The tab title shows the waiting tables, so a call is noticed even from another tab.
  const title = useRef<string | null>(null);
  useEffect(() => {
    if (!staffKey) return;
    title.current ??= document.title;
    document.title = waiting ? `(${waiting}) Garson ekranı · ${title.current}` : title.current;
  }, [staffKey, waiting]);

  const toggle = staffKey ? (
    <button
      type="button"
      data-cagri-sesi
      aria-pressed={soundOn}
      onClick={() => {
        tried.current = true;
        void setSound(!soundOn);
      }}
      title={soundOn ? "Garson çağrısı gelince bu cihaz öter" : "Garson çağrısı gelince ses çıksın diye dokunun"}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 ${soundOn ? "bg-white/10" : "bg-amber-300 text-zumrut-950"}`}
    >
      {soundOn ? <BellRing className="size-4" aria-hidden="true" /> : <BellOff className="size-4" aria-hidden="true" />}
      {soundOn ? "Ses açık" : "Sesi aç"}
    </button>
  ) : null;

  const sorted = byUrgency(calls);
  const alerts =
    calls.length > 0 ? (
      <div
        aria-live="assertive"
        className="pointer-events-none sticky top-0 z-50 flex flex-col items-center gap-2 px-3 pt-3"
      >
        {sorted.slice(0, SHOWN).map((call) => {
          const order = call.kind === "siparis";
          const making = order && Boolean(call.seenAt);
          const bill = call.kind === "hesap";
          const late = !call.seenAt && now - call.at > LATE_MS;
          const Icon = order ? (making ? ChefHat : ShoppingBag) : bill ? ReceiptText : BellRing;
          const what = order ? (making ? "Hazırlanıyor" : "Sipariş") : bill ? "Hesap istiyor" : "Garson istiyor";
          return (
            <div
              key={call.id}
              data-cagri={call.table}
              data-tur={call.kind}
              className={`animate-drop-in pointer-events-auto w-full max-w-md rounded-[22px] bg-zumrut-950 p-2.5 pe-3 text-krem-50 shadow-[0_18px_44px_-14px_rgba(0,0,0,.7)] ring-2 ${
                late ? "ring-amber-300" : making ? "ring-krem-50/20" : "ring-fistik-300/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid shrink-0 place-items-center rounded-full text-zumrut-950 ${making ? "size-10 bg-krem-50" : "size-12"} ${
                    bill ? "bg-amber-300" : making ? "" : "bg-fistik-300"
                  }`}
                >
                  <Icon
                    className={`${making ? "size-5" : "size-6"} ${!order && !bill ? "animate-bell" : ""}`}
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`font-display block font-semibold leading-none ${making ? "text-xl" : "text-2xl"}`}>
                    Masa {call.table}
                  </span>
                  <span className={`mt-1 block text-[13px] font-bold ${late ? "text-amber-200" : "text-krem-100/70"}`}>
                    {what} · {order ? formatPrice(call.total ?? 0, "tr") : since(call.at, now)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => answer(call.id, making ? "teslim" : "gor")}
                  className={`h-11 shrink-0 rounded-xl px-4 text-sm font-extrabold transition active:scale-[.97] ${
                    making ? "bg-fistik-300 text-zumrut-950" : "bg-krem-50 text-zumrut-950"
                  }`}
                >
                  {order ? (making ? "Teslim edildi" : "Onayla") : "Tamam"}
                </button>
              </div>
              {order && call.lines && (
                <p className={`mt-2 px-1.5 text-[14px] leading-snug ${making ? "text-krem-100/60" : "text-krem-50"}`}>
                  {call.lines.map((l) => `${l.qty}× ${l.name}${l.option ? ` (${l.option})` : ""}`).join(", ")}
                  {call.note && !making && <span className="mt-1 block font-semibold text-amber-200">Not: {call.note}</span>}
                </p>
              )}
            </div>
          );
        })}
        {calls.length > SHOWN && (
          <p className="pointer-events-auto rounded-full bg-zumrut-950 px-3 py-1.5 text-xs font-bold text-krem-50">
            +{calls.length - SHOWN} daha
          </p>
        )}
      </div>
    ) : null;

  return { toggle, alerts };
}
