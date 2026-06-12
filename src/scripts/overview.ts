// Booked-overview controller: hydrate the appointment card, drive the
// "Beheer je afspraak" fullscreen overlay (shared confirm editor + edit
// sheets), the action buttons, and delete → back to the landing.
import { confirmDate, firstAvailable } from "../lib/availability";
import { initConfirmEditor } from "./confirm-editor";
import { MOMENTS, config } from "../data/variables";
import { withBase } from "../lib/base";
import type { BookingState, MomentId } from "../lib/types";

function loadBooking(): BookingState {
  const fallback = firstAvailable();
  const base: BookingState = {
    mode: "first-available",
    date: fallback?.day.date ?? null,
    moment: fallback?.moment ?? null,
    extraInfo: "",
    contactName: config.customer.name,
    contactPhone: config.customer.phone,
  };
  try {
    const raw = sessionStorage.getItem("booking");
    if (raw) Object.assign(base, JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return base;
}

function momentLabel(id: MomentId | null): string {
  const m = MOMENTS.find((x) => x.id === id);
  return m ? `${m.label} (${m.range})` : "—";
}

function setText(sel: string, value: string) {
  document.querySelectorAll<HTMLElement>(sel).forEach((el) => (el.textContent = value));
}

export function initOverview() {
  const state = loadBooking();

  function persist() {
    sessionStorage.setItem("booking", JSON.stringify(state));
  }

  function updateAppointmentCard() {
    setText("[data-overview-date]", state.date ? confirmDate(state.date) : "—");
    setText("[data-overview-moment]", momentLabel(state.moment));
  }
  updateAppointmentCard();

  // Just booked → confirmation toast on arrival
  if (sessionStorage.getItem("booking-confirmed") === "true") {
    sessionStorage.removeItem("booking-confirmed");
    flashToast("Afspraak bevestigd");
  }

  // Shared confirm editor drives the manage overlay's cards + edit sheets
  const editor = initConfirmEditor({
    state,
    persist,
    onChange: updateAppointmentCard,
  });

  // ── Manage overlay open/close ─────────────────────────────────────
  const overlay = document.querySelector<HTMLElement>("[data-manage-overlay]");
  function openManage() {
    if (!overlay) return;
    editor.refresh();
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeManage() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  document.querySelector<HTMLButtonElement>("[data-open-manage]")?.addEventListener("click", openManage);
  document.querySelectorAll<HTMLElement>("[data-manage-close]").forEach((el) =>
    el.addEventListener("click", closeManage)
  );
  document.querySelector<HTMLButtonElement>("[data-manage-save]")?.addEventListener("click", () => {
    persist();
    updateAppointmentCard();
    closeManage();
    flashToast("Afspraak gewijzigd");
  });

  // ── Action rows ───────────────────────────────────────────────────
  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = btn.dataset.action;
      if (a === "calendar") flashToast("Toegevoegd aan je kalender");
      else if (a === "share") flashToast("Deellink gekopieerd");
      else if (a === "delete") {
        if (confirm("Ben je zeker dat je deze afspraak wil verwijderen?")) {
          sessionStorage.removeItem("booking");
          sessionStorage.removeItem("appointment-booked");
          window.location.href = withBase();
        }
      }
    });
  });

  function flashToast(message: string) {
    const t = document.querySelector<HTMLElement>("[data-toast]");
    if (!t) return;
    const msg = t.querySelector<HTMLElement>("[data-toast-msg]");
    if (msg) msg.textContent = message;
    t.hidden = false;
    t.querySelector<HTMLElement>("[data-toast-close]")?.addEventListener("click", () => (t.hidden = true));
    window.clearTimeout((t as any)._timer);
    (t as any)._timer = window.setTimeout(() => (t.hidden = true), 4000);
  }
}
