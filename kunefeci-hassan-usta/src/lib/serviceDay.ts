/** The shop's day turns over at 05:00 Istanbul time, so a dish marked "bugün yok" late at night stays off until morning. */
const ROLLOVER_HOURS = 5;

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's working day as YYYY-MM-DD. */
export function serviceDay(at: Date = new Date()): string {
  return dayFormat.format(new Date(at.getTime() - ROLLOVER_HOURS * 60 * 60 * 1000));
}
