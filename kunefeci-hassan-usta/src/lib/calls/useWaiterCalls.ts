"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { shopClock } from "@/lib/hours";

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

/**
 * How often the panel asks for new calls. Each ask is a read of the free Redis plan (500,000 a month):
 * every 5 seconds while it is on screen and something is going on (open calls, a tap or a new call in the
 * last few minutes), every 15 seconds otherwise, also behind another tab, so it still chimes there; at night
 * (01:00–11:00, shop time) every minute, but only while nothing is going on: a late shift with open orders
 * keeps the day pace. A panel open day and night stays well inside the free plan.
 */
const BUSY_POLL_MS = 5000;
const QUIET_POLL_MS = 15 * 1000;
const NIGHT_POLL_MS = 60 * 1000;
/** A tap or a new call keeps the panel on the quick pace this long. */
const BUSY_FOR_MS = 5 * 60 * 1000;
/** 01:00 to 11:00 in the shop's time zone. */
const isNight = () => {
  const { minutes } = shopClock(new Date());
  return minutes >= 60 && minutes < 11 * 60;
};

/** An unanswered call rings again this often, in case nobody heard it the first time. */
const RING_AGAIN_MS = 60 * 1000;
/** After this a call is shown as late: someone has been waiting too long. */
export const LATE_MS = 2 * 60 * 1000;

/**
 * A soft two-note bell (G5, then D5), made in the browser so no sound file is needed. Each note is a pure
 * tone with a quieter overtone that fades first, a gentle start and a long tail: it carries across a busy
 * shop without the shrill beep of an alarm.
 */
function chime(context: AudioContext | null) {
  if (!context) return;
  const start = context.currentTime;
  for (const [i, freq] of [784, 587].entries()) {
    const t = start + i * 0.32;
    for (const [mult, level, length] of [
      [1, 0.32, 1.4],
      [2.01, 0.07, 0.5],
    ]) {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(level, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
      osc.connect(gain).connect(context.destination);
      osc.start(t);
      osc.stop(t + length + 0.05);
    }
  }
}

export function since(at: number, now: number): string {
  const minutes = Math.floor((now - at) / 60000);
  if (minutes < 1) return "Az önce";
  return `${minutes} dk önce`;
}

/** A second tap on the same card this soon is the same tap: "Onayla" must not turn into "Teslim edildi". */
const DOUBLE_TAP_MS = 1500;
/** For this long after a tap the screen trusts the tap over a check that may have left before it. */
const ANSWER_SETTLES_MS = 8000;
const clock = () => Date.now();

type Answer = { action: "gor" | "teslim"; at: number };

/** What the screen shows after taps the server may not have caught up with yet. */
function withAnswers(calls: OpenCall[], answers: Map<string, Answer>, now: number): OpenCall[] {
  return calls.flatMap((c) => {
    const answer = answers.get(c.id);
    if (!answer || now - answer.at > ANSWER_SETTLES_MS) return [c];
    if (answer.action === "teslim" || c.kind !== "siparis") return [];
    return [{ ...c, seenAt: c.seenAt ?? answer.at }];
  });
}

/**
 * Used by the panel. Pass null to stay quiet (calls not set up).
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
  const answers = useRef(new Map<string, Answer>());

  const ring = useCallback(() => {
    lastRing.current = Date.now();
    if (!sound.current) return;
    chime(audio.current);
    navigator.vibrate?.([120, 80, 120]);
  }, []);

  useEffect(() => {
    if (!staffKey) return;
    let stopped = false;
    let busy = false;
    let openNow = 0;
    let lastActivity = Date.now();
    const poll = async () => {
      // One check at a time: a slow answer must not land after a newer one and bring back old cards.
      if (busy) return;
      busy = true;
      try {
        const res = await fetch("/api/garson/cagrilar", { cache: "no-store", headers: { "x-garson-anahtari": staffKey } });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { calls: OpenCall[]; now: number };
        if (stopped) return;
        data.calls = withAnswers(data.calls, answers.current, clock());
        const ids = new Set(data.calls.map((c) => c.id));
        const fresh = known.current !== null && data.calls.some((c) => !known.current!.has(c.id));
        const stillWaiting = data.calls.some((c) => !c.seenAt) && Date.now() - lastRing.current > RING_AGAIN_MS;
        if (fresh || (known.current !== null && stillWaiting)) ring();
        if (fresh) lastActivity = Date.now();
        openNow = data.calls.length;
        known.current = ids;
        setCalls(data.calls);
        setNow(data.now);
        setOnline(true);
      } catch {
        if (!stopped) setOnline(false);
      } finally {
        busy = false;
      }
    };
    let timer = 0;
    let dueAt = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      // Work going on (open calls, a tap or a new call lately): quick on screen, never the night pace.
      const working = openNow > 0 || Date.now() - lastActivity < BUSY_FOR_MS;
      const delay = working && !document.hidden ? BUSY_POLL_MS : !working && isNight() ? NIGHT_POLL_MS : QUIET_POLL_MS;
      dueAt = Date.now() + delay;
      timer = window.setTimeout(tick, delay);
    };
    const tick = async () => {
      await poll();
      if (!stopped) schedule();
    };
    // Back on screen: someone is looking, so ask at once.
    const onShow = () => {
      if (document.hidden) return;
      lastActivity = Date.now();
      void tick();
    };
    // A tap or a key on the panel: back to the quick pace.
    const onUse = () => {
      lastActivity = Date.now();
      if (dueAt - Date.now() > BUSY_POLL_MS) schedule();
    };
    void tick();
    document.addEventListener("visibilitychange", onShow);
    window.addEventListener("pointerdown", onUse, true);
    window.addEventListener("keydown", onUse, true);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onShow);
      window.removeEventListener("pointerdown", onUse, true);
      window.removeEventListener("keydown", onUse, true);
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
      const at = clock();
      const last = answers.current.get(id);
      if (last && at - last.at < DOUBLE_TAP_MS) return;
      answers.current.set(id, { action, at });
      for (const [key, answer] of answers.current) if (at - answer.at > ANSWER_SETTLES_MS) answers.current.delete(key);
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
