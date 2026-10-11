"use client";

import { site } from "@/content/site";
import { openState, shopClock } from "@/lib/hours";
import { useNow } from "@/lib/useShopClock";

type Labels = { open: string; closed: string; closes: string; opens: string; today: string };

export function OpenStatus({ labels, tone = "dark" }: { labels: Labels; tone?: "dark" | "light" }) {
  const now = useNow();
  if (!now) return <span className="inline-block h-8" aria-hidden="true" />;

  const state = openState(now);
  const detail = state.open ? `${labels.closes} ${state.closes}` : state.opens ? `${labels.opens} ${state.opens}` : "";
  const base =
    tone === "dark"
      ? "bg-krem-50/10 text-krem-100 ring-krem-50/15"
      : "bg-lacivert-800/[0.06] text-lacivert-800 ring-lacivert-800/10";

  return (
    <span
      className={`inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-sm font-medium ring-1 ${base}`}
      role="status"
    >
      <span className="relative flex size-2.5">
        {state.open && <span className="absolute inset-0 animate-ping rounded-full bg-fistik-400 opacity-60" />}
        <span className={`relative size-2.5 rounded-full ${state.open ? "bg-fistik-400" : "bg-karamel-400"}`} />
      </span>
      <span>{state.open ? labels.open : labels.closed}</span>
      {detail && <span className="opacity-60">· {detail}</span>}
    </span>
  );
}

export function HoursList({ days, labels }: { days: string[]; labels: Labels }) {
  const now = useNow();
  const today = now ? shopClock(now).day : null;

  return (
    <ul className="divide-y divide-krem-50/10">
      {days.map((dayName, index) => {
        const day = index + 1;
        const hours = site.hours.find((h) => h.day === day);
        const isToday = day === today;
        return (
          <li
            key={day}
            className={`flex items-center justify-between gap-4 py-2.5 text-[15px] ${isToday ? "text-sari-300" : "text-krem-100/80"}`}
          >
            <span className="flex items-center gap-2">
              {dayName}
              {isToday && (
                <span className="rounded-full bg-sari-300/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-sari-300">
                  {labels.today}
                </span>
              )}
            </span>
            <span className="tabular-nums">{hours ? `${hours.open} – ${hours.close}` : "—"}</span>
          </li>
        );
      })}
    </ul>
  );
}
