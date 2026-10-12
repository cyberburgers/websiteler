import { site, type DayHours } from "@/content/site";

const weekdayIndex: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function hoursFor(hours: DayHours[], day: number): DayHours | undefined {
  return hours.find((h) => h.day === day);
}

/** Day of week (1 = Monday) and minutes since midnight in the shop's time zone. */
export function shopClock(date: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: site.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: weekdayIndex[get("weekday")] ?? 1, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export type OpenState = { open: true; closes: string } | { open: false; opens: string | null };

export function openState(date: Date, hours: DayHours[]): OpenState {
  const { day, minutes } = shopClock(date);

  // Still open from yesterday's late shift (e.g. 10:00–01:00 and it's 00:30)?
  const yesterday = hoursFor(hours, day === 1 ? 7 : day - 1);
  if (yesterday && toMinutes(yesterday.close) <= toMinutes(yesterday.open) && minutes < toMinutes(yesterday.close)) {
    return { open: true, closes: yesterday.close };
  }

  const today = hoursFor(hours, day);
  if (today) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    const crossesMidnight = close <= open;
    if (minutes >= open && (crossesMidnight || minutes < close)) return { open: true, closes: today.close };
    if (minutes < open) return { open: false, opens: today.open };
  }

  for (let i = 1; i <= 7; i++) {
    const next = hoursFor(hours, ((day - 1 + i) % 7) + 1);
    if (next) return { open: false, opens: next.open };
  }
  return { open: false, opens: null };
}

/** Consecutive days with the same hours folded into one line: "Pazartesi – Perşembe  10:00 – 00:00". */
export function groupedHours(
  hoursList: DayHours[],
  dayNames: string[],
  closedLabel: string,
): { days: string; hours: string }[] {
  const groups: { start: number; end: number; hours: string }[] = [];
  for (let day = 1; day <= 7; day++) {
    const h = hoursFor(hoursList, day);
    const hours = h ? `${h.open} – ${h.close}` : closedLabel;
    const last = groups.at(-1);
    if (last && last.hours === hours && last.end === day - 1) last.end = day;
    else groups.push({ start: day, end: day, hours });
  }
  return groups.map((g) => ({
    days: g.start === g.end ? dayNames[g.start - 1] : `${dayNames[g.start - 1]} – ${dayNames[g.end - 1]}`,
    hours: g.hours,
  }));
}
