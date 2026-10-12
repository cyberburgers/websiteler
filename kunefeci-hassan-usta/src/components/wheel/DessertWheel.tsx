"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ArtGroup, type ArtKind } from "@/components/art/FoodArt";

export type WheelSlice = {
  id: string;
  name: string;
  lines: string[];
  description: string;
  price: string;
  art?: ArtKind;
  href: string;
};

export type WheelLabels = {
  trigger: string;
  title: string;
  hint: string;
  faster: string;
  spin: string;
  again: string;
  picked: string;
  seeMenu: string;
  close: string;
};

const COLORS = [
  { fill: "#23264a", text: "#f1e6a0" },
  { fill: "#cb9452", text: "#181a3a" },
  { fill: "#fbf6e7", text: "#23264a" },
  { fill: "#7e9838", text: "#fffdf6" },
];

const R = 182;
const mod = (n: number, m: number) => ((n % m) + m) % m;
const toXY = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(200 + r * Math.sin(a)).toFixed(2)} ${(200 - r * Math.cos(a)).toFixed(2)}`;
};

function WheelFace({ slices }: { slices: WheelSlice[] }) {
  const seg = 360 / slices.length;
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" className="size-full">
      {slices.map((slice, i) => {
        const c = COLORS[i % COLORS.length];
        return (
          <g key={slice.id}>
            <path
              d={`M200 200L${toXY(i * seg - seg / 2, R)}A${R} ${R} 0 0 1 ${toXY(i * seg + seg / 2, R)}Z`}
              fill={c.fill}
              stroke="#10112a"
              strokeOpacity=".3"
              strokeWidth="1.5"
            />
            <g transform={`rotate(${i * seg} 200 200)`}>
              {slice.art && (
                <svg x={177} y={200 - R + 10} width="46" height="46" viewBox="18 18 364 364" overflow="visible">
                  <ArtGroup kind={slice.art} />
                </svg>
              )}
              <text
                transform="translate(200 108) rotate(-90)"
                fill={c.text}
                fontSize="12.5"
                fontWeight="800"
                textAnchor="middle"
                style={{ fontFamily: "var(--font-manrope), sans-serif" }}
              >
                {slice.lines.map((line, k) => (
                  <tspan
                    key={line}
                    x="0"
                    y={slice.lines.length === 1 ? 4.5 : k === 0 ? -2.5 : 11.5}
                    {...(line.length > 10 ? { textLength: 68, lengthAdjust: "spacingAndGlyphs" } : {})}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/** The rim with its carnival bulbs, fixed while the face turns inside it. */
function Rim() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
      <circle cx="200" cy="200" r="194" fill="none" stroke="#a8692d" strokeWidth="14" />
      <circle cx="200" cy="200" r="187" fill="none" stroke="#7a4a1e" strokeWidth="2" />
      {Array.from({ length: 24 }, (_, i) => {
        const [x, y] = toXY(i * 15, 194).split(" ");
        return <circle key={i} cx={x} cy={y} r="3.4" fill={i % 2 ? "#fffdf6" : "#f1e6a0"} />;
      })}
    </svg>
  );
}

function MiniWheel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      {Array.from({ length: 8 }, (_, i) => {
        const a0 = (i * 45 * Math.PI) / 180;
        const a1 = ((i + 1) * 45 * Math.PI) / 180;
        return (
          <path
            key={i}
            d={`M20 20L${20 + 17 * Math.sin(a0)} ${20 - 17 * Math.cos(a0)}A17 17 0 0 1 ${20 + 17 * Math.sin(a1)} ${20 - 17 * Math.cos(a1)}Z`}
            fill={COLORS[i % COLORS.length].fill}
          />
        );
      })}
      <circle cx="20" cy="20" r="18" fill="none" stroke="#cb9452" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="4" fill="#f1e6a0" stroke="#23264a" strokeWidth="1.5" />
    </svg>
  );
}

/** Fired by any trigger on the page; the one wheel dialog in the layout listens for it. */
const OPEN_EVENT = "tatli-carki:ac";

/** The last tile on the home page: a slowly turning wheel that opens the game. */
export function WheelTile({ title, action, className = "" }: { title: string; action: string; className?: string }) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      data-wheel-trigger=""
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className={`group flex flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_50%_35%,#2a2d5a,#1b1d3f)] text-sari-300 ring-1 ring-inset ring-sari-300/25 transition hover:ring-sari-300/50 active:scale-[.98] ${className}`}
    >
      <MiniWheel className="size-[84px] animate-[spin_14s_linear_infinite] group-hover:animate-[spin_1.6s_linear_infinite] motion-reduce:animate-none md:size-24" />
      <span className="text-center">
        <span className="font-display block text-[19px] font-semibold leading-[1.05] md:text-[22px]">{title}</span>
        <span className="mt-1 block text-xs text-krem-100/70">{action}</span>
      </span>
    </button>
  );
}

type Confetto = { id: number; dx: number; dy: number; r: number; color: string; delay: number };

export function DessertWheel({ slices, labels }: { slices: WheelSlice[]; labels: WheelLabels }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<WheelSlice | null>(null);
  const [hint, setHint] = useState(labels.hint);
  const [confetti, setConfetti] = useState<Confetto[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const frame = useRef(0);
  const lastSlice = useRef(-1);
  const lastBuzz = useRef(0);
  const drag = useRef<{ last: number; samples: { t: number; a: number }[] } | null>(null);

  const seg = 360 / slices.length;
  const sliceAtPointer = () => Math.floor(mod(-angle.current + seg / 2, 360) / seg) % slices.length;

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
    // The face mounts fresh on every open; put it back where the last spin left it.
    if (faceRef.current) faceRef.current.style.transform = `rotate(${angle.current}deg)`;
  }, [open]);

  // Also close the dialog if the page is left (or kept hidden for Back) while it is open.
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      cancelAnimationFrame(frame.current);
      dialog?.close();
    };
  }, []);

  const render = () => {
    if (faceRef.current) faceRef.current.style.transform = `rotate(${angle.current}deg)`;
    const now = sliceAtPointer();
    if (now !== lastSlice.current) {
      lastSlice.current = now;
      pointerRef.current?.animate([{ rotate: "-16deg" }, { rotate: "0deg" }], { duration: 140, easing: "ease-out" });
      const t = performance.now();
      if (t - lastBuzz.current > 70) {
        lastBuzz.current = t;
        navigator.vibrate?.(6);
      }
    }
  };

  const finish = () => {
    const picked = slices[sliceAtPointer()];
    setResult(picked);
    setConfetti(
      Array.from({ length: 22 }, (_, i) => {
        const a = Math.random() * Math.PI * 2;
        const d = 90 + Math.random() * 110;
        return {
          id: Date.now() + i,
          dx: Math.cos(a) * d,
          dy: Math.sin(a) * d - 40,
          r: Math.random() * 540 - 270,
          color: ["#f1e6a0", "#a2ba57", "#cb9452", "#fffdf6", "#dd9530"][i % 5],
          delay: Math.random() * 120,
        };
      }),
    );
  };

  /** Lets the wheel coast to a stop; every spin gets a slightly different friction, so no two land alike. */
  const coast = (velocity: number) => {
    cancelAnimationFrame(frame.current);
    setResult(null);
    setConfetti([]);
    let v = Math.max(-3.2, Math.min(3.2, velocity));
    // Low friction: a spin runs for roughly five to six and a half seconds before it settles.
    const friction = 0.0009 + Math.random() * 0.0003;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(now - last, 40);
      last = now;
      angle.current += v * dt;
      v *= Math.exp(-friction * dt);
      render();
      if (Math.abs(v) > 0.009) frame.current = requestAnimationFrame(step);
      else finish();
    };
    frame.current = requestAnimationFrame(step);
  };

  const pointerAngle = (e: ReactPointerEvent) => {
    const box = e.currentTarget.getBoundingClientRect();
    return (
      (Math.atan2(e.clientX - (box.left + box.width / 2), -(e.clientY - (box.top + box.height / 2))) * 180) / Math.PI
    );
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(frame.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    const a = pointerAngle(e);
    drag.current = { last: a, samples: [{ t: performance.now(), a: angle.current }] };
    setHint(labels.hint);
    setResult(null);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const a = pointerAngle(e);
    let delta = a - d.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.last = a;
    angle.current += delta;
    const t = performance.now();
    d.samples.push({ t, a: angle.current });
    while (d.samples.length > 2 && t - d.samples[0].t > 90) d.samples.shift();
    render();
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.samples.length < 2) return;
    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const v = (last.a - first.a) / Math.max(1, last.t - first.t);
    if (Math.abs(v) < 0.2) {
      setHint(labels.faster);
      return;
    }
    // Even a lazy flick should give a satisfying couple of turns.
    coast(Math.sign(v) * Math.min(3.2, Math.max(1.4, Math.abs(v) * 2.2)));
  };

  const spinButton = () => coast((2 + Math.random()) * (Math.random() < 0.15 ? -1 : 1));

  const close = () => dialogRef.current?.close();

  return (
    <>
      <dialog
        ref={dialogRef}
        onClose={() => {
          cancelAnimationFrame(frame.current);
          setOpen(false);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        aria-labelledby="cark-baslik"
        className="wheel-sheet pattern-star m-auto max-h-[94dvh] w-[min(94vw,30rem)] overflow-y-auto overflow-x-hidden rounded-[2rem] bg-lacivert-900 p-0 text-krem-50 shadow-[0_40px_90px_-30px_rgba(0,0,0,.8)] ring-1 ring-sari-300/20"
      >
        {open && (
          <div className="relative px-5 pb-6 pt-6 sm:px-8 sm:pb-8">
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="absolute end-3 top-3 z-10 grid size-11 place-items-center rounded-full text-krem-100/80 transition hover:bg-krem-50/10 hover:text-krem-50"
            >
              <X className="size-5" />
            </button>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sari-300">{labels.trigger}</p>
            <h2 id="cark-baslik" className="font-display mt-2 pe-10 text-[1.75rem] font-medium leading-tight">
              {labels.title}
            </h2>

            <div className="relative mx-auto mt-5 aspect-square w-full max-w-[22rem]">
              <div className="absolute inset-[3%] rounded-full shadow-[0_24px_60px_-20px_rgba(0,0,0,.8)]" />
              <div
                ref={faceRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="absolute inset-[3%] cursor-grab touch-none select-none rounded-full will-change-transform active:cursor-grabbing"
              >
                <WheelFace slices={slices} />
              </div>
              <Rim />
              <div
                ref={pointerRef}
                aria-hidden="true"
                className="absolute left-1/2 top-[-3%] z-10 -ml-4 w-8 origin-[50%_20%] drop-shadow-[0_6px_8px_rgba(0,0,0,.45)]"
              >
                <svg viewBox="0 0 32 44">
                  <path d="M16 42 3 16a13 13 0 1 1 26 0Z" fill="#f1e6a0" stroke="#23264a" strokeWidth="2.5" />
                  <circle cx="16" cy="14" r="5" fill="#23264a" />
                </svg>
              </div>
              <button
                type="button"
                onClick={spinButton}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute left-1/2 top-1/2 z-10 grid size-[24%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-sari-300 text-sm font-extrabold uppercase tracking-wider text-lacivert-900 shadow-[0_10px_24px_-8px_rgba(0,0,0,.6)] ring-4 ring-lacivert-900 transition hover:bg-sari-200 active:scale-95"
              >
                {labels.spin}
              </button>
              <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-20">
                {confetti.map((c) => (
                  <span
                    key={c.id}
                    className="confetto absolute block h-2.5 w-1.5 rounded-sm"
                    style={
                      {
                        background: c.color,
                        "--dx": `${c.dx}px`,
                        "--dy": `${c.dy}px`,
                        "--r": `${c.r}deg`,
                        animationDelay: `${c.delay}ms`,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
            </div>

            <div aria-live="polite" className="mt-6 min-h-[8.5rem]">
              {result ? (
                <div className="animate-rise rounded-[1.5rem] bg-krem-50 p-4 text-lacivert-800 shadow-xl">
                  <div className="flex items-center gap-4">
                    {result.art && (
                      <svg viewBox="18 18 364 364" aria-hidden="true" className="size-16 shrink-0">
                        <ArtGroup kind={result.art} />
                      </svg>
                    )}
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-karamel-600">
                        {labels.picked}
                      </p>
                      <p className="font-display text-2xl font-medium leading-tight">{result.name}</p>
                      <p className="mt-0.5 font-extrabold text-karamel-700">{result.price}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-lacivert-800/70">{result.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href={result.href}
                      onClick={close}
                      className="inline-flex items-center justify-center rounded-full bg-lacivert-800 px-4 py-3 text-sm font-bold text-krem-50 transition hover:bg-lacivert-700"
                    >
                      {labels.seeMenu}
                    </Link>
                    <button
                      type="button"
                      onClick={spinButton}
                      className="inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-bold text-lacivert-800 ring-1 ring-lacivert-800/20 transition hover:bg-lacivert-800/[0.05]"
                    >
                      {labels.again}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mx-auto max-w-xs pt-4 text-center text-[15px] leading-relaxed text-krem-100/75">{hint}</p>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
