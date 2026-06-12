// Domain types for the appointment prototype.

/** The four real spots stored per day (the "Flexibel" moment is derived, never stored). */
export type SpotId = "voormiddag" | "middag" | "namiddag" | "avond";

/** All moments shown in the UI, including the derived "flexibel". */
export type MomentId = "flexibel" | SpotId;

export interface DaySpots {
  voormiddag: boolean;
  middag: boolean;
  namiddag: boolean;
  avond: boolean;
}

export interface AvailabilityDay {
  /** ISO date, e.g. "2026-06-17" */
  date: string;
  /** true when at least one of the four spots is available */
  available: boolean;
  spots: DaySpots;
}

export interface AvailabilityData {
  generatedAt: string;
  days: AvailabilityDay[];
}

export interface MomentMeta {
  id: MomentId;
  /** Dutch label shown on the card */
  label: string;
  /** Human time range, e.g. "8 u. – 12 u." */
  range: string;
  /** True for the derived all-day moment */
  derived: boolean;
}

/** Wizard state persisted to sessionStorage. */
export interface BookingState {
  mode: "first-available" | "custom" | null;
  date: string | null;
  moment: MomentId | null;
  extraInfo: string;
  contactName: string;
  contactPhone: string;
}
