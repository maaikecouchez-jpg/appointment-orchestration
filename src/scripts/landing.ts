// "Mijn afspraken" landing controller: opens/closes the wizard overlay,
// flips between empty and booked states, and shows the confirmation toast.
import { weekday, numericDate, firstAvailable } from "../lib/availability";
import { MOMENTS } from "../data/variables";
import { vKey } from "./version";
import type { BookingState, MomentId } from "../lib/types";

function readBooking(): BookingState | null {
  try {
    const raw = sessionStorage.getItem(vKey("booking"));
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function momentLabel(id: MomentId | null): string {
  const m = MOMENTS.find((x) => x.id === id);
  return m ? `${m.label} (${m.range})` : "";
}

/** e.g. "Do 02/07/2026 - Namiddag (12.30 u. - 17 u.)" */
function landingSummary(b: BookingState): string {
  const fa = firstAvailable();
  const date = b.date ?? fa?.day.date ?? null;
  const moment = b.moment ?? fa?.moment ?? null;
  if (!date) return "";
  const wd = weekday(date).slice(0, 2);
  return `${wd} ${numericDate(date)} - ${momentLabel(moment)}`;
}

export function initLanding() {
  const overlay = document.querySelector<HTMLElement>("[data-wizard-overlay]");
  const startBtn = document.querySelector<HTMLButtonElement>("[data-start-wizard]");
  const emptyState = document.querySelector<HTMLElement>("[data-empty-state]");
  const bookedState = document.querySelector<HTMLElement>("[data-booked-state]");
  const summaryEl = document.querySelector<HTMLElement>("[data-landing-summary]");
  const toast = document.querySelector<HTMLElement>("[data-toast]");

  function openOverlay() {
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    document.dispatchEvent(new CustomEvent("wizard-open"));
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function renderBooked() {
    const booking = readBooking();
    if (!booking) return;
    if (emptyState) emptyState.hidden = true;
    if (bookedState) bookedState.hidden = false;
    if (summaryEl) summaryEl.textContent = landingSummary(booking);
  }

  function flashToast(message: string) {
    if (!toast) return;
    const msg = toast.querySelector<HTMLElement>("[data-toast-msg]");
    if (msg) msg.textContent = message;
    toast.hidden = false;
    toast
      .querySelector<HTMLElement>("[data-toast-close]")
      ?.addEventListener("click", () => (toast.hidden = true));
    window.clearTimeout((toast as any)._timer);
    (toast as any)._timer = window.setTimeout(() => (toast.hidden = true), 5000);
  }

  startBtn?.addEventListener("click", openOverlay);
  document.addEventListener("wizard-close", closeOverlay);
  document.addEventListener("wizard-complete", () => {
    closeOverlay();
    renderBooked();
    flashToast("Afspraak bevestigd");
  });

  // On load: if an appointment is already booked, show that state.
  if (sessionStorage.getItem(vKey("appointment-booked")) === "true") {
    renderBooked();
  }
}
