"use client";

import { BellRing, Check, Loader2, ReceiptText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { callWaiterAction } from "@/lib/calls/actions";

type Labels = {
  button: string;
  title: string;
  waiter: string;
  waiterHint: string;
  bill: string;
  billHint: string;
  close: string;
  sending: string;
  sentWaiter: string;
  sentBill: string;
  sentHint: string;
  waiting: string;
  seen: string;
  onTheWay: string;
  tooSoon: string;
  busy: string;
  error: string;
  done: string;
};

export type WaiterLabels = Labels;

type Kind = "garson" | "hesap";
type Phase = "choose" | "sending" | "sent" | "failed";
type Status = "bekliyor" | "goruldu";

/** How long the guest's phone keeps asking whether the call was seen, and how long "on the way" stays up. */
const WATCH_MS = 5 * 60 * 1000;
const SEEN_SHOWN_MS = 45 * 1000;

const phoneClock = () => Date.now();

/**
 * "Garson çağır" in the bar at the bottom of a table's menu (see TableDock), and the sheet it opens.
 * `compact`: just the bell, when the basket or an order needs the room next to it.
 */
export function WaiterCall({
  table,
  labels,
  tableLabel,
  compact,
}: {
  table: string;
  labels: Labels;
  tableLabel: string;
  compact: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [phase, setPhase] = useState<Phase>("choose");
  const [message, setMessage] = useState("");
  const [call, setCall] = useState<{ id: string; kind: Kind; at: number } | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

  // While a call is open, ask now and then whether a waiter has seen it.
  useEffect(() => {
    if (!call || status !== "bekliyor") return;
    const check = async () => {
      if (document.hidden) return;
      if (Date.now() - call.at > WATCH_MS) {
        setStatus(null);
        return;
      }
      try {
        const res = await fetch(`/api/garson/durum?id=${encodeURIComponent(call.id)}`, { cache: "no-store" });
        const data = (await res.json()) as { status?: string };
        if (data.status === "goruldu") {
          navigator.vibrate?.([60, 40, 60]);
          setStatus("goruldu");
        } else if (data.status === "yok") {
          setStatus(null);
        }
      } catch {
        // Offline for a moment; the next check will try again.
      }
    };
    const timer = window.setInterval(check, 4000);
    // Phone unlocked again: check at once.
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [call, status]);

  // "On the way" stays on the button for a while, then it goes back to normal.
  useEffect(() => {
    if (status !== "goruldu") return;
    const timer = window.setTimeout(() => setStatus(null), SEEN_SHOWN_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  const tableText = tableLabel.replace("{n}", table);

  const open = () => {
    if (call && status) setPhase("sent");
    else setPhase("choose");
    dialogRef.current?.showModal();
  };

  const send = async (kind: Kind) => {
    setPhase("sending");
    const result = await callWaiterAction(table, kind).catch(() => ({ ok: false as const, reason: "hata" as const }));
    if (result.ok) {
      navigator.vibrate?.(30);
      // Timed by this phone's own clock: a phone set wrong would otherwise stop watching at once.
      setCall({ id: result.id, kind, at: phoneClock() });
      setStatus("bekliyor");
      setPhase("sent");
      return;
    }
    setMessage(result.reason === "sik" ? labels.tooSoon : result.reason === "dolu" ? labels.busy : labels.error);
    setPhase("failed");
  };

  const pending = status === "bekliyor";
  const seen = status === "goruldu";
  const fabText = seen ? labels.onTheWay : pending ? labels.waiting : labels.button;

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label={compact ? `${fabText} · ${tableText}` : undefined}
        data-garson-cagir=""
        className={`flex items-center gap-3 rounded-full bg-zumrut-950/90 p-2 text-start shadow-[0_18px_44px_-14px_rgba(0,0,0,.85)] ring-1 ring-fistik-300/30 backdrop-blur-xl transition hover:ring-fistik-300/60 active:scale-[.97] ${compact ? "" : "pe-5"}`}
      >
        <span
          className={`relative grid size-11 shrink-0 place-items-center rounded-full text-zumrut-950 ${seen ? "bg-krem-50" : "bg-fistik-300"}`}
        >
          {pending && <span className="absolute inset-0 animate-halo rounded-full bg-fistik-300/60" />}
          {seen ? (
            <Check className="relative size-5" strokeWidth={3} aria-hidden="true" />
          ) : (
            <BellRing className="relative size-5" aria-hidden="true" />
          )}
        </span>
        {!compact && (
          <span>
            <span className="block text-[15px] font-extrabold leading-tight text-krem-50">{fabText}</span>
            <span className="block text-xs font-semibold text-fistik-200/80">{tableText}</span>
          </span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        aria-labelledby="garson-cagir-baslik"
        className="menu-sheet mx-auto mb-0 mt-auto w-full max-w-none rounded-t-[30px] bg-krem-100 p-0 text-zumrut-800 md:my-auto md:max-w-md md:rounded-[30px]"
      >
        <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 md:px-6 md:pt-5">
          <span aria-hidden="true" className="mx-auto block h-[5px] w-12 rounded-full bg-zumrut-800/15 md:hidden" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <h2 id="garson-cagir-baslik" className="font-display text-[26px] font-semibold leading-tight text-zumrut-900">
              {phase === "sent" && call
                ? seen
                  ? labels.seen
                  : call.kind === "hesap"
                    ? labels.sentBill
                    : labels.sentWaiter
                : labels.title}
            </h2>
            <span className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-zumrut-900 px-3 py-1 text-sm font-extrabold text-fistik-200">{tableText}</span>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label={labels.close}
                className="grid size-10 place-items-center rounded-full bg-krem-200 text-zumrut-900 transition hover:bg-krem-300"
              >
                <X className="size-5" />
              </button>
            </span>
          </div>

          {(phase === "choose" || phase === "sending") && (
            <div className="mt-5 grid gap-3">
              {(
                [
                  ["garson", labels.waiter, labels.waiterHint, BellRing, "bg-zumrut-900 text-krem-50", "bg-fistik-300 text-zumrut-950", "text-krem-100/70"],
                  ["hesap", labels.bill, labels.billHint, ReceiptText, "bg-white text-zumrut-900 ring-1 ring-zumrut-800/10", "bg-krem-200 text-zumrut-900", "text-zumrut-800/60"],
                ] as const
              ).map(([kind, title, hint, Icon, tone, iconTone, hintTone]) => (
                <button
                  key={kind}
                  type="button"
                  disabled={phase === "sending"}
                  onClick={() => send(kind)}
                  className={`flex items-center gap-4 rounded-[22px] p-4 text-start transition active:scale-[.98] disabled:opacity-60 ${tone}`}
                >
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${iconTone}`}>
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-lg font-extrabold leading-tight">{title}</span>
                    <span className={`mt-0.5 block text-sm ${hintTone}`}>{hint}</span>
                  </span>
                </button>
              ))}
              {phase === "sending" && (
                <p role="status" className="flex items-center justify-center gap-2 pt-1 text-sm font-bold text-zumrut-800/70">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {labels.sending}
                </p>
              )}
            </div>
          )}

          {phase === "sent" && call && (
            <div className="mt-5 text-center" role="status">
              <span
                className={`mx-auto grid size-20 place-items-center rounded-full ${seen ? "bg-fistik-300 text-zumrut-950" : "bg-zumrut-900 text-fistik-300"}`}
              >
                {seen ? (
                  <Check className="size-9" strokeWidth={3} aria-hidden="true" />
                ) : (
                  <BellRing className="size-9 animate-bell" aria-hidden="true" />
                )}
              </span>
              <p className="mt-4 text-[15px] leading-relaxed text-zumrut-800/75">
                {seen ? labels.onTheWay : labels.sentHint}
              </p>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="mt-5 h-12 w-full rounded-2xl bg-zumrut-900 text-[15px] font-extrabold text-krem-50 transition hover:bg-zumrut-800"
              >
                {labels.done}
              </button>
            </div>
          )}

          {phase === "failed" && (
            <div className="mt-5 text-center" role="alert">
              <p className="text-[15px] leading-relaxed text-zumrut-800/80">{message}</p>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="mt-5 h-12 w-full rounded-2xl bg-zumrut-900 text-[15px] font-extrabold text-krem-50"
              >
                {labels.done}
              </button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
