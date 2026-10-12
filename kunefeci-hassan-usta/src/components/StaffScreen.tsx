"use client";

import { BellRing, Check, ReceiptText, Volume2, VolumeX, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Call = { id: string; table: string; kind: "garson" | "hesap"; at: number };

const POLL_MS = 3000;
/** An unanswered call rings again this often, in case nobody heard it the first time. */
const RING_AGAIN_MS = 60 * 1000;
/** After this a call card turns amber: someone has been waiting too long. */
const LATE_MS = 2 * 60 * 1000;

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

function since(at: number, now: number): string {
  const minutes = Math.floor((now - at) / 60000);
  if (minutes < 1) return "Az önce";
  return `${minutes} dk önce`;
}

/** The counter tablet: every open waiter call as a big card, with a chime when a new one arrives. */
export function StaffScreen({ staffKey }: { staffKey: string }) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [now, setNow] = useState(0);
  const [online, setOnline] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const known = useRef<Set<string> | null>(null);
  const lastRing = useRef(0);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  const ring = useCallback(() => {
    lastRing.current = Date.now();
    chime(audio.current);
    navigator.vibrate?.([120, 80, 120]);
  }, []);

  // Ask for the open calls every few seconds.
  useEffect(() => {
    let stopped = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/garson/cagrilar?k=${encodeURIComponent(staffKey)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { calls: Call[]; now: number };
        if (stopped) return;
        const ids = new Set(data.calls.map((c) => c.id));
        const fresh = known.current !== null && data.calls.some((c) => !known.current!.has(c.id));
        const stillWaiting = data.calls.length > 0 && Date.now() - lastRing.current > RING_AGAIN_MS;
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

  // The tab title shows how many tables are waiting, even when another app is in front.
  useEffect(() => {
    document.title = calls.length ? `(${calls.length}) Garson çağrısı` : "Garson ekranı";
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

  const start = async () => {
    // Browsers only let a page make sound after someone has tapped it.
    audio.current ??= new AudioContext();
    await audio.current.resume();
    chime(audio.current);
    setSoundOn(true);
  };

  const answer = async (id: string) => {
    setCalls((list) => list.filter((c) => c.id !== id));
    known.current?.delete(id);
    try {
      await fetch("/api/garson/cagrilar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ k: staffKey, id }),
      });
    } catch {
      // If it didn't reach the server, the call comes back on the next check and can be tapped again.
    }
  };

  return (
    <main className="min-h-dvh px-4 pb-10 pt-5 sm:px-8">
      <header className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-semibold">Garson çağrıları</h1>
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
            <p className="font-display mt-5 text-2xl">Bekleyen çağrı yok</p>
            <p className="mt-1 text-sm text-krem-100/55">Müşteri “Garson çağır”a basınca burada görünür.</p>
          </div>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {calls.map((call) => {
            const late = now - call.at > LATE_MS;
            const bill = call.kind === "hesap";
            return (
              <li
                key={call.id}
                className={`flex flex-col rounded-[28px] p-5 ring-2 ${late ? "bg-amber-400/15 ring-amber-300" : "bg-krem-50/[0.07] ring-fistik-300/40"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold ${
                      bill ? "bg-amber-300 text-zumrut-950" : "bg-fistik-300 text-zumrut-950"
                    }`}
                  >
                    {bill ? <ReceiptText className="size-4" aria-hidden="true" /> : <BellRing className="size-4" aria-hidden="true" />}
                    {bill ? "Hesap istiyor" : "Garson istiyor"}
                  </span>
                  <span className={`text-sm font-bold ${late ? "text-amber-200" : "text-krem-100/60"}`}>{since(call.at, now)}</span>
                </div>
                <p className="font-display mt-4 whitespace-nowrap text-6xl font-semibold leading-none">Masa {call.table}</p>
                <button
                  type="button"
                  onClick={() => answer(call.id)}
                  className="mt-5 h-14 rounded-2xl bg-krem-50 text-lg font-extrabold text-zumrut-950 transition active:scale-[.98]"
                >
                  Tamam, gidiyorum
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
