"use client";

import { BellRing, Check, ChefHat, ReceiptText, ShoppingBag, Volume2, VolumeX, WifiOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { LATE_MS, byUrgency, since, useWaiterCalls } from "@/lib/calls/useWaiterCalls";
import { formatPrice } from "@/lib/format";

/** The counter tablet: every open call and order as a big card, with a chime when a new one arrives. */
export function StaffScreen({ staffKey }: { staffKey: string }) {
  const { calls, now, online, soundOn, setSound, ring, answer } = useWaiterCalls(staffKey);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  // The tab title shows how many tables are waiting, even when another app is in front.
  useEffect(() => {
    document.title = calls.length ? `(${calls.length}) Garson ekranı` : "Garson ekranı";
  }, [calls.length]);

  // Keep the tablet's screen awake while this page is open (where the browser allows it).
  useEffect(() => {
    if (!soundOn) return;
    const lock = async () => {
      try {
        wakeLock.current = (await navigator.wakeLock?.request("screen")) ?? null;
      } catch {
        // Not supported or not allowed; the screen may dim on its own.
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void lock();
    };
    void lock();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      void wakeLock.current?.release();
    };
  }, [soundOn]);

  const start = () => setSound(true);

  return (
    <main className="min-h-dvh px-4 pb-10 pt-5 sm:px-8">
      <header className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-semibold">Çağrılar ve siparişler</h1>
          <p className="mt-0.5 text-sm text-krem-100/60">Künefeci Hassan Usta · Bu ekran açık kalsın</p>
        </div>
        {!online && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-sm font-bold text-red-200">
            <WifiOff className="size-4" aria-hidden="true" /> Bağlantı yok
          </span>
        )}
        <button
          type="button"
          onClick={soundOn ? () => ring() : start}
          className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold ${
            soundOn ? "bg-krem-50/10 text-krem-50" : "bg-fistik-300 text-zumrut-950"
          }`}
        >
          {soundOn ? <Volume2 className="size-5" aria-hidden="true" /> : <VolumeX className="size-5" aria-hidden="true" />}
          {soundOn ? "Ses açık · dene" : "Sesi aç"}
        </button>
      </header>

      {!soundOn && (
        <button
          type="button"
          onClick={start}
          className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-fistik-300/15 p-4 text-start ring-1 ring-fistik-300/30"
        >
          <BellRing className="size-6 shrink-0 text-fistik-300" aria-hidden="true" />
          <span className="text-sm leading-relaxed text-krem-50">
            <b>Çağrı gelince ses çıksın diye bir kez dokunun.</b> Tarayıcılar, ekrana dokunulmadan ses çalmaya izin
            vermiyor. Dokununca ekran da kendiliğinden kararmaz.
          </span>
        </button>
      )}

      {calls.length === 0 ? (
        <div className="grid min-h-[55dvh] place-items-center text-center" role="status">
          <div>
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-krem-50/[0.06] text-fistik-300">
              <Check className="size-9" aria-hidden="true" />
            </span>
            <p className="font-display mt-5 text-2xl">Bekleyen çağrı ya da sipariş yok</p>
            <p className="mt-1 text-sm text-krem-100/55">Müşteri “Garson çağır”a basınca ya da sipariş verince burada görünür.</p>
          </div>
        </div>
      ) : (
        <ul className="mt-6 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {byUrgency(calls).map((call) => {
            const late = !call.seenAt && now - call.at > LATE_MS;
            const order = call.kind === "siparis";
            const making = order && Boolean(call.seenAt);
            const badge = order
              ? making
                ? { text: "Hazırlanıyor", Icon: ChefHat, tone: "bg-krem-50 text-zumrut-950" }
                : { text: "Sipariş", Icon: ShoppingBag, tone: "bg-fistik-300 text-zumrut-950" }
              : call.kind === "hesap"
                ? { text: "Hesap istiyor", Icon: ReceiptText, tone: "bg-amber-300 text-zumrut-950" }
                : { text: "Garson istiyor", Icon: BellRing, tone: "bg-fistik-300 text-zumrut-950" };
            return (
              <li
                key={call.id}
                data-kart={call.kind}
                className={`flex flex-col rounded-[28px] p-5 ring-2 ${
                  late
                    ? "bg-amber-400/15 ring-amber-300"
                    : making
                      ? "bg-krem-50/[0.04] ring-krem-50/15"
                      : "bg-krem-50/[0.07] ring-fistik-300/40"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold ${badge.tone}`}>
                    <badge.Icon className="size-4" aria-hidden="true" />
                    {badge.text}
                  </span>
                  <span className={`text-sm font-bold ${late ? "text-amber-200" : "text-krem-100/60"}`}>{since(call.at, now)}</span>
                </div>
                <p className="font-display mt-4 whitespace-nowrap text-6xl font-semibold leading-none">Masa {call.table}</p>
                {order && call.lines && (
                  <>
                    <ul className="mt-4 space-y-1.5 text-xl">
                      {call.lines.map((line, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="min-w-8 font-extrabold tabular-nums text-fistik-300">{line.qty}×</span>
                          <span className="font-semibold">
                            {line.name}
                            {line.option && <span className="text-krem-100/60"> · {line.option}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {call.note && (
                      <p className="mt-3 rounded-2xl bg-amber-300/15 px-4 py-2.5 text-[17px] font-semibold text-amber-100 ring-1 ring-amber-300/30">
                        Not: {call.note}
                      </p>
                    )}
                    <p className="mt-3 text-end text-lg font-extrabold tabular-nums text-krem-100/80">
                      {formatPrice(call.total ?? 0, "tr")}
                    </p>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => answer(call.id, making ? "teslim" : "gor")}
                  className={`mt-5 h-14 rounded-2xl text-lg font-extrabold transition active:scale-[.98] ${
                    making ? "bg-fistik-300 text-zumrut-950" : "bg-krem-50 text-zumrut-950"
                  }`}
                >
                  {order ? (making ? "Teslim edildi" : "Onayla") : "Tamam, gidiyorum"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
