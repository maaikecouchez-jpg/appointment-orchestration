// Wizard orchestrator: panel state machine, footer, persistence, the
// step-1 datepicker + moments islands, and the shared confirm editor.
import { initDatePicker, type DatePickerApi } from "./datepicker";
import { initMoments, type MomentsApi } from "./moments";
import { initConfirmEditor } from "./confirm-editor";
import { firstAvailable } from "../lib/availability";
import { withBase } from "../lib/base";
import { config } from "../data/variables";
import type { BookingState } from "../lib/types";

type PanelId = "intro" | "date" | "extra" | "confirm";

const STORAGE_KEY = "booking";
const STEP: Record<PanelId, number> = { intro: 1, date: 1, extra: 2, confirm: 3 };

function defaultState(): BookingState {
  return {
    mode: null,
    date: null,
    moment: null,
    extraInfo: "",
    contactName: config.customer.name,
    contactPhone: config.customer.phone,
  };
}

function loadState(): BookingState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return defaultState();
}

export function initWizard() {
  const root = document.querySelector<HTMLElement>("[data-wizard]");
  if (!root) return;
  const wizardRoot: HTMLElement = root;

  // Mutated in place (never reassigned) so the confirm editor keeps its reference.
  const state: BookingState = loadState();

  // On a hard refresh, clear the in-progress selection so the flow starts fresh
  // (but keep a confirmed appointment so /overzicht + the booked card still work).
  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (nav?.type === "reload" && sessionStorage.getItem("appointment-booked") !== "true") {
    state.mode = null;
    state.date = null;
    state.moment = null;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const panels = new Map<PanelId, HTMLElement>();
  wizardRoot.querySelectorAll<HTMLElement>("[data-panel]").forEach((p) => {
    panels.set(p.dataset.panel as PanelId, p);
  });

  // Footer
  const backBtn = document.querySelector<HTMLButtonElement>("[data-back]")!;
  const nextBtn = document.querySelector<HTMLButtonElement>("[data-next]")!;
  const nextLabel = document.querySelector<HTMLElement>("[data-next-label]")!;
  const stepLabel = document.querySelector<HTMLElement>("[data-step-label]")!;
  const segs = Array.from(document.querySelectorAll<HTMLElement>("[data-seg]"));

  const momentsEl = wizardRoot.querySelector<HTMLElement>("[data-moments]")!;

  // ── Step-1 islands ────────────────────────────────────────────────
  const dp: DatePickerApi = initDatePicker(
    wizardRoot.querySelector<HTMLElement>("[data-datepicker]")!,
    (iso) => {
      state.date = iso;
      state.moment = null;
      moments.showForDate(iso);
      persist();
      refreshFooter();
      requestAnimationFrame(() =>
        momentsEl.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  );
  const moments: MomentsApi = initMoments(momentsEl, (id) => {
    state.moment = id;
    persist();
    refreshFooter();
  });

  // Extra info field (step 2)
  const extraInput = wizardRoot.querySelector<HTMLTextAreaElement>("[data-extra-input]")!;
  extraInput.value = state.extraInfo;
  extraInput.addEventListener("input", () => {
    state.extraInfo = extraInput.value;
    persist();
  });

  // Intro radios
  const radios = Array.from(
    wizardRoot.querySelectorAll<HTMLInputElement>('input[name="intro-mode"]')
  );
  radios.forEach((r) => {
    r.addEventListener("change", () => {
      if (r.checked) {
        state.mode = r.value as BookingState["mode"];
        persist();
        refreshFooter();
      }
    });
  });

  // ── Confirm cards + edit bottom sheets (shared) ───────────────────
  const editor = initConfirmEditor({
    state,
    persist,
    syncExternal: (d, m) => {
      dp.select(d);
      moments.showForDate(d);
      moments.select(m);
      refreshFooter();
    },
    syncExtra: (v) => (extraInput.value = v),
  });

  let current: PanelId = "intro";

  function persist() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function isValid(panel: PanelId): boolean {
    if (panel === "intro") return state.mode !== null;
    if (panel === "date") return !!state.date && !!state.moment;
    return true;
  }

  function refreshFooter() {
    const step = STEP[current];
    stepLabel.textContent = `${step}/3`;
    segs.forEach((s) => {
      const n = Number(s.dataset.seg);
      if (n <= step) s.dataset.active = "true";
      else delete s.dataset.active;
    });
    backBtn.hidden = current === "intro";
    nextLabel.textContent = current === "confirm" ? "Bevestigen" : "Verder";
    nextBtn.disabled = !isValid(current);
  }

  function show(panel: PanelId) {
    current = panel;
    panels.forEach((el, id) => (el.hidden = id !== panel));
    if (panel === "confirm") editor.refresh();
    if (panel === "extra") extraInput.value = state.extraInfo;
    refreshFooter();
    const main = wizardRoot.closest(".app-main") ?? window;
    (main as HTMLElement).scrollTo?.({ top: 0 });
  }

  function goNext() {
    if (!isValid(current)) return;
    switch (current) {
      case "intro":
        if (state.mode === "first-available") {
          const fa = firstAvailable();
          if (fa && !state.date) {
            state.date = fa.day.date;
            state.moment = fa.moment;
            persist();
          }
          show("extra");
        } else {
          if (state.date) {
            dp.select(state.date);
            moments.showForDate(state.date);
            if (state.moment) moments.select(state.moment);
          }
          show("date");
        }
        break;
      case "date":
        show("extra");
        break;
      case "extra":
        show("confirm");
        break;
      case "confirm":
        finish();
        break;
    }
  }

  function goBack() {
    switch (current) {
      case "date":
        show("intro");
        break;
      case "extra":
        show(state.mode === "custom" ? "date" : "intro");
        break;
      case "confirm":
        show("extra");
        break;
    }
  }

  function finish() {
    persist();
    sessionStorage.setItem("appointment-booked", "true");
    sessionStorage.setItem("booking-confirmed", "true");
    // Always land on the booked appointment's detail page.
    window.location.href = withBase("overzicht");
  }

  function resetWizard() {
    Object.assign(state, defaultState());
    persist();
    radios.forEach((r) => (r.checked = false));
    dp.select(null);
    moments.reset();
    extraInput.value = "";
    show("intro");
  }

  nextBtn.addEventListener("click", goNext);
  backBtn.addEventListener("click", goBack);

  // Close (X) → ask the landing to close the overlay
  document
    .querySelector<HTMLButtonElement>("[data-wizard-close]")
    ?.addEventListener("click", () =>
      document.dispatchEvent(new CustomEvent("wizard-close"))
    );

  // Open → start fresh at intro
  document.addEventListener("wizard-open", resetWizard);

  show("intro");
}
