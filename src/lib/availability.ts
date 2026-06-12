import rawData from "../data/availability.json";
import type {
  AvailabilityData,
  AvailabilityDay,
  DaySpots,
  MomentId,
} from "./types";

export const data = rawData as AvailabilityData;
export const days: AvailabilityDay[] = data.days;

// ── Dutch date formatting ──────────────────────────────────────────────────
const WEEKDAYS_FULL = [
  "Zondag",
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
];
const WEEKDAYS_ABBR = ["ZO", "MA", "DI", "WO", "DO", "VR", "ZA"];
const MONTHS_FULL = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];
const MONTHS_ABBR = [
  "Jan",
  "Feb",
  "Mrt",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
];

/** Parse an ISO "YYYY-MM-DD" into a local Date (avoids UTC shifting). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dayAbbr(iso: string): string {
  return WEEKDAYS_ABBR[parseISO(iso).getDay()];
}
export function dayNum(iso: string): string {
  return String(parseISO(iso).getDate());
}
export function monthAbbr(iso: string): string {
  return MONTHS_ABBR[parseISO(iso).getMonth()];
}
export function isWeekend(iso: string): boolean {
  const d = parseISO(iso).getDay();
  return d === 0 || d === 6;
}

/** e.g. "Woensdag, 17 juni" */
export function longDate(iso: string): string {
  const d = parseISO(iso);
  return `${WEEKDAYS_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS_FULL[d.getMonth()]}`;
}

/** Full weekday name, e.g. "Woensdag" */
export function weekday(iso: string): string {
  return WEEKDAYS_FULL[parseISO(iso).getDay()];
}

/** e.g. "Woensdag, 17/06/2026" (used on the confirm screen) */
export function confirmDate(iso: string): string {
  return `${weekday(iso)}, ${numericDate(iso)}`;
}

/** e.g. "17/06/2026" */
export function numericDate(iso: string): string {
  const d = parseISO(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

// ── Availability logic ─────────────────────────────────────────────────────

/** "Flexibel" (8–17) is available when morning, noon OR afternoon is open. */
export function isFlexibelAvailable(spots: DaySpots): boolean {
  return spots.voormiddag || spots.middag || spots.namiddag;
}

export function isMomentAvailable(day: AvailabilityDay, moment: MomentId): boolean {
  if (moment === "flexibel") return isFlexibelAvailable(day.spots);
  return day.spots[moment];
}

export function getDay(iso: string): AvailabilityDay | undefined {
  return days.find((d) => d.date === iso);
}

// ── Bookable window ─────────────────────────────────────────────────────────
/** Reference "today" for the prototype's mock data. */
export const TODAY = "2026-06-12";
/** Minimum lead time (days) before the first bookable day. */
export const MIN_LEAD_DAYS = 3;

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Earliest bookable calendar date = today + lead time. */
const minBookableISO = (() => {
  const d = parseISO(TODAY);
  d.setDate(d.getDate() + MIN_LEAD_DAYS);
  return toISO(d);
})();

/** Index of the first AVAILABLE day on/after the earliest bookable date. */
const firstBookableIndex = days.findIndex(
  (d) => d.date >= minBookableISO && d.available
);

/** Days shown in the datepicker — starting at the first bookable day. */
export const visibleDays: AvailabilityDay[] =
  firstBookableIndex >= 0 ? days.slice(firstBookableIndex) : [];

/** First available day in the bookable window. */
export function firstAvailableDay(): AvailabilityDay | undefined {
  return visibleDays.find((d) => d.available);
}

/** Default moment for a day: prefer Flexibel, else the earliest open spot. */
export function defaultMoment(day: AvailabilityDay): MomentId {
  if (isFlexibelAvailable(day.spots)) return "flexibel";
  const order: MomentId[] = ["voormiddag", "middag", "namiddag", "avond"];
  return order.find((m) => day.spots[m as keyof DaySpots]) ?? "avond";
}

/** Convenience for the "Eerst beschikbaar" intro card. */
export function firstAvailable():
  | { day: AvailabilityDay; moment: MomentId }
  | null {
  const day = firstAvailableDay();
  if (!day) return null;
  return { day, moment: defaultMoment(day) };
}
