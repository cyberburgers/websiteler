"use client";

import type { DayHours } from "@/content/site";
import { openState } from "@/lib/hours";
import { useNow } from "@/lib/useShopClock";

type Labels = { open: string; closed: string; closes: string; opens: string; today: string; tomorrow: string };

export function OpenStatus({
  labels,
  days,
  hours,
  tone = "dark",
}: {
  labels: Labels;
  /** Day names, Monday first: "Açılış Pazartesi 10:00" when the next opening is days away. */
  days: string[];
  hours: DayHours[];
  tone?: "dark" | "light" | "glass";
}) {
  const now = useNow();
  if (!now) return <span className="inline-block h-8" aria-hidden="true" />;

  const state = openState(now, hours);
  const when = state.open || !state.inDays ? "" : state.inDays === 1 ? `${labels.tomorrow} ` : `${days[(state.day ?? 1) - 1]} `;
  const detail = state.open
    ? `${labels.closes} ${state.closes}`
    : state.opens
      ? `${labels.opens} ${when}${state.opens}`
      : "";
  const base = {
    dark: "bg-krem-50/10 text-krem-100 ring-krem-50/15",
    light: "bg-zumrut-800/[0.06] text-zumrut-800 ring-zumrut-800/10",
    glass: "bg-zumrut-925/65 font-bold text-krem-50 ring-krem-50/10 backdrop-blur-md",
  }[tone];

  return (
    <span
      className={`inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-sm font-medium ring-1 ${base}`}
      role="status"
    >
      <span className="relative flex size-2.5">
        {state.open && <span className="absolute inset-0 animate-halo rounded-full bg-fistik-400 opacity-60" />}
        <span className={`relative size-2.5 rounded-full ${state.open ? "bg-fistik-400" : "bg-karamel-400"}`} />
      </span>
      <span>{state.open ? labels.open : labels.closed}</span>
      {detail && <span className="opacity-60">· {detail}</span>}
    </span>
  );
}
