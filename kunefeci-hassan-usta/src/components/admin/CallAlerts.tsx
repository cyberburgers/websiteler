"use client";

import { BellOff, BellRing } from "lucide-react";
import { useEffect, useRef } from "react";
import { useWaiterCalls } from "@/lib/calls/useWaiterCalls";

/**
 * Waiter calls in the panel: while the panel is open on this phone or computer, calls and orders come in and
 * chime. Returns the sound switch for the header and the open calls for the "Siparişler" tab.
 */
export function usePanelCalls(staffKey: string | null) {
  const { calls, now, online, soundOn, setSound, answer, signedOut } = useWaiterCalls(staffKey);
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
    document.title = waiting ? `(${waiting}) ${title.current}` : title.current;
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
      aria-label={soundOn ? "Ses açık" : "Sesi aç"}
      className={`inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg px-2.5 transition-colors sm:px-3 ${
        soundOn ? "bg-white/10 hover:bg-white/15" : "bg-amber-300 text-zumrut-950"
      }`}
    >
      {soundOn ? <BellRing className="size-4" aria-hidden="true" /> : <BellOff className="size-4" aria-hidden="true" />}
      {/* Off is worth the words even on a phone; on, the bell says it. */}
      <span className={soundOn ? "hidden sm:inline" : "hidden min-[380px]:inline"}>{soundOn ? "Ses açık" : "Sesi aç"}</span>
    </button>
  ) : null;

  return { toggle, list: calls, now, online, answer, signedOut };
}
