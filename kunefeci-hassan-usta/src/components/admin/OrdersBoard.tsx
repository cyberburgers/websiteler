"use client";

import { BellRing, ChefHat, ReceiptText, ShoppingBag, WifiOff } from "lucide-react";
import { LATE_MS, byUrgency, since, type OpenCall } from "@/lib/calls/useWaiterCalls";
import { formatPrice } from "@/lib/format";
import { noteClass } from "./fields";

/**
 * The "Siparişler" tab: everything waiting at the tables, newest need first.
 * An order: "Onayla" (the guest sees "Hazırlanıyor"), then "Teslim edildi". A call: "Tamam, gidiyorum".
 */
export function OrdersBoard({
  calls,
  now,
  online,
  answer,
}: {
  calls: OpenCall[];
  now: number;
  online: boolean;
  answer: (id: string, action?: "gor" | "teslim") => void;
}) {
  return (
    <div className="space-y-3">
      {!online && (
        <p className={`${noteClass} flex items-center gap-2 px-4 py-3 text-sm font-bold`}>
          <WifiOff className="size-4 shrink-0" aria-hidden="true" /> Bağlantı koptu, yeniden deneniyor…
        </p>
      )}
      {calls.length === 0 ? (
        <div className="rounded-3xl bg-zumrut-900/60 px-6 py-10 text-center ring-1 ring-karamel-300/15">
          <ShoppingBag className="mx-auto size-8 text-karamel-300" aria-hidden="true" />
          <p className="font-display mt-3 text-xl font-semibold text-krem-50">Şu an bekleyen yok</p>
          <p className="mt-1 text-sm text-krem-100/65">Masadan gelen siparişler ve garson çağrıları burada belirir.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {byUrgency(calls).map((call) => {
            const order = call.kind === "siparis";
            const making = order && Boolean(call.seenAt);
            const bill = call.kind === "hesap";
            const late = !call.seenAt && now - call.at > LATE_MS;
            const Icon = order ? (making ? ChefHat : ShoppingBag) : bill ? ReceiptText : BellRing;
            const what = order ? (making ? "Hazırlanıyor" : "Yeni sipariş") : bill ? "Hesap istiyor" : "Garson istiyor";
            return (
              <li
                key={call.id}
                data-pano-cagri={call.table}
                className={`animate-pop-in flex flex-col rounded-3xl bg-zumrut-900 p-4 text-krem-50 shadow-[0_18px_40px_-28px_rgba(0,0,0,.9)] ${
                  late ? "ring-2 ring-amber-400" : making ? "ring-1 ring-white/10" : "ring-2 ring-karamel-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold ${
                      making ? "bg-white/10 text-krem-100" : "bg-karamel-300 text-zumrut-950"
                    }`}
                  >
                    <Icon className="size-3.5" aria-hidden="true" /> {what}
                  </span>
                  <span className={`text-xs font-bold ${late ? "text-amber-300" : "text-krem-100/55"}`}>
                    {since(call.at, now)}
                  </span>
                </div>
                <p className="font-display mt-2 text-3xl font-semibold">Masa {call.table}</p>
                {order && call.lines && (
                  <ul className="mt-2 space-y-1 text-[15px]">
                    {call.lines.map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="min-w-7 font-extrabold tabular-nums text-karamel-300">{line.qty}×</span>
                        <span className="font-semibold">
                          {line.name}
                          {line.option && <span className="text-krem-100/55"> · {line.option}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {order && call.note && (
                  <p className="mt-2 rounded-xl bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100 ring-1 ring-amber-300/25">
                    Not: {call.note}
                  </p>
                )}
                {order && (
                  <p className="mt-2 text-end text-lg font-extrabold tabular-nums">{formatPrice(call.total ?? 0, "tr")}</p>
                )}
                <button
                  type="button"
                  onClick={() => answer(call.id, making ? "teslim" : "gor")}
                  className={`mt-3 h-12 rounded-2xl text-base font-extrabold transition active:scale-[.98] ${
                    making ? "bg-fistik-300 text-zumrut-950 hover:bg-fistik-200" : "bg-karamel-300 text-zumrut-950 hover:bg-krem-300"
                  }`}
                >
                  {order ? (making ? "Teslim edildi" : "Onayla") : "Tamam, gidiyorum"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
