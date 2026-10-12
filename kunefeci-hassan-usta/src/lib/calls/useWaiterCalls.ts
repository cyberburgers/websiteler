"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type OpenCall = {
  id: string;
  table: string;
  kind: "garson" | "hesap" | "siparis";
  at: number;
  /** An order that has been accepted and is being made. */
  seenAt?: number;
  lines?: { name: string; option?: string; qty: number; amount: number }[];
  note?: string;
  total?: number;
};

/** Waiting for someone first (calls and new orders, oldest first), then orders being made. */
export function byUrgency(calls: OpenCall[]): OpenCall[] {
  return [...calls].sort((a, b) => Number(Boolean(a.seenAt)) - Number(Boolean(b.seenAt)) || a.at - b.at);
}

const POLL_MS = 3000;
/** An unanswered call rings again this often, in case nobody heard it the first time. */
const RING_AGAIN_MS = 60 * 1000;
/** After this a call is shown as late: someone has been waiting too long. */
export const LATE_MS = 2 * 60 * 1000;

/** A short two-note chime made in the browser, so no sound file is needed. */
function chime(context: AudioContext | null) {
  if (!context) return;
  const start = context.currentTime;
  for (const [i, freq] of [988, 740].entries()) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = start + i * 0.28;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    osc.connect(gain).connect(context.destination);
    osc.start(t);
    osc.stop(t + 0.65);
  }
}

export function since(at: number, now: number): string {
  const minutes = Math.floor((now - at) / 60000);
  if (minutes < 1) return "Az önce";
  return `${minutes} dk önce`;
}

/**
 * The open waiter calls, checked every few seconds, with a chime when a new one comes in.
 * Used by the counter screen and by the panel. Pass null to stay quiet (calls not set up).
 */
export function useWaiterCalls(staffKey: string | null) {
  const [calls, setCalls] = useState<OpenCall[]>([]);
  const [now, setNow] = useState(0);
  const [online, setOnline] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const sound = useRef(false);
  const known = useRef<Set<string> | null>(null);
  const lastRing = useRef(0);

  const ring = useCallback(() => {
    lastRing.current = Date.now();
    if (!sound.current) return;
    chime(audio.current);
    navigator.vibrate?.([120, 80, 120]);
  }, []);

  useEffect(() => {
    if (!staffKey) return;
    let stopped = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/garson/cagrilar?k=${encodeURIComponent(staffKey)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { calls: OpenCall[]; now: number };
        if (stopped) return;
        const ids = new Set(data.calls.map((c) => c.id));
        const fresh = known.current !== null && data.calls.some((c) => !known.current!.has(c.id));
        const stillWaiting = data.calls.some((c) => !c.seenAt) && Date.now() - lastRing.current > RING_AGAIN_MS;
        if (fresh || (known.current !== null && stillWaiting)) ring();
        known.current = ids;
        setCalls(data.calls);
        setNow(data.now);
        setOnline(true);
      } catch {
        if (!stopped) setOnline(false);
      }
    };
    void poll();
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [staffKey, ring]);

  /** Browsers only let a page make sound after someone has tapped it, so call this from a tap. */
  const setSound = useCallback(async (on: boolean, { test = true } = {}) => {
    if (!on) {
      sound.current = false;
      setSoundOn(false);
      return;
    }
    try {
      audio.current ??= new AudioContext();
      await audio.current.resume();
    } catch {
      return;
    }
    if (audio.current.state !== "running") return;
    sound.current = true;
    setSoundOn(true);
    if (test) chime(audio.current);
  }, []);

  /**
   * "Tamam" on a call, "Onayla" on a new order (it stays, as being made) or "Teslim edildi" on an order.
   * The screen changes at once; the server is told in the background.
   */
  const answer = useCallback(
    async (id: string, action: "gor" | "teslim" = "gor") => {
      setCalls((list) =>
        list.flatMap((c) => {
          if (c.id !== id) return [c];
          return c.kind === "siparis" && action === "gor" ? [{ ...c, seenAt: Date.now() }] : [];
        }),
      );
      try {
        await fetch("/api/garson/cagrilar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ k: staffKey, id, action }),
        });
      } catch {
        // If it didn't reach the server, the call comes back on the next check and can be tapped again.
      }
    },
    [staffKey],
  );

  return { calls, now, online, soundOn, setSound, ring, answer };
}
