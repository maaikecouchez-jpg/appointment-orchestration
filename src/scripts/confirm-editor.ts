// Shared editor for the "appointment summary" cards + their edit bottom sheets.
// Used by the wizard's confirm step and the "Beheer je afspraak" overlay.
import { initDatePicker, type DatePickerApi } from "./datepicker";
import { initMoments, type MomentsApi } from "./moments";
import { confirmDate } from "../lib/availability";
import { MOMENTS } from "../data/variables";
import type { BookingState, MomentId } from "../lib/types";

function momentLabel(id: MomentId | null): string {
  const m = MOMENTS.find((x) => x.id === id);
  return m ? `${m.label} (${m.range})` : "—";
}

function closeSheet(id: string) {
  document.querySelector<HTMLElement>(`[data-modal="${id}"] [data-modal-close]`)?.click();
}

export interface ConfirmEditor {
  refresh(): void;
}

export interface ConfirmEditorOptions {
  /** Mutated in place (never reassigned, so callers can keep their reference). */
  state: BookingState;
  persist: () => void;
  /** Called after any field is saved. */
  onChange?: () => void;
  /** Keep an external datepicker (e.g. the wizard's step 1) in sync. */
  syncExternal?: (date: string, moment: MomentId) => void;
  /** Sync the standalone extra-info field (e.g. the wizard's step 2 textarea). */
  syncExtra?: (value: string) => void;
}

export function initConfirmEditor(opts: ConfirmEditorOptions): ConfirmEditor {
  const { state, persist } = opts;
  const onChange = opts.onChange ?? (() => {});

  function set(sel: string, value: string) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) el.textContent = value;
  }

  function refresh() {
    set("[data-confirm-date]", state.date ? confirmDate(state.date) : "—");
    set("[data-confirm-moment]", momentLabel(state.moment));
    set("[data-confirm-name]", state.contactName);
    set("[data-confirm-phone]", state.contactPhone);
    const extraEl = document.querySelector<HTMLElement>("[data-confirm-extra]");
    if (extraEl) {
      const has = state.extraInfo.trim().length > 0;
      extraEl.textContent = has ? state.extraInfo.trim() : "Voeg extra informatie toe";
      extraEl.classList.toggle("t-subtle", !has);
    }
  }

  // ── Datetime sheet ────────────────────────────────────────────────
  const dtRoot = document.querySelector<HTMLElement>("[data-edit-dt]");
  const saveDt = document.querySelector<HTMLButtonElement>("[data-save-datetime]");
  let editDp: DatePickerApi | null = null;
  let editMo: MomentsApi | null = null;
  let editMomentsEl: HTMLElement | null = null;

  if (dtRoot && saveDt) {
    editMomentsEl = dtRoot.querySelector<HTMLElement>("[data-moments]")!;
    editDp = initDatePicker(dtRoot.querySelector<HTMLElement>("[data-datepicker]")!, (iso) => {
      // New date → clear the spot selection and reveal the slots
      editMo!.select(null);
      editMo!.showForDate(iso);
      saveDt.disabled = true;
      requestAnimationFrame(() =>
        editMomentsEl!.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    });
    editMo = initMoments(editMomentsEl, () => {
      saveDt.disabled = !(editDp!.getSelected() && editMo!.getSelected());
    });

    saveDt.addEventListener("click", () => {
      const d = editDp!.getSelected();
      const m = editMo!.getSelected();
      if (!d || !m) return;
      state.date = d;
      state.moment = m;
      persist();
      opts.syncExternal?.(d, m);
      refresh();
      onChange();
      closeSheet("edit-datetime");
    });
  }

  // ── Contact sheet ─────────────────────────────────────────────────
  const nameInput = document.querySelector<HTMLInputElement>("[data-contact-name]");
  const phoneInput = document.querySelector<HTMLInputElement>("[data-contact-phone]");
  document.querySelector<HTMLButtonElement>("[data-save-contact]")?.addEventListener("click", () => {
    if (nameInput) state.contactName = nameInput.value.trim() || state.contactName;
    if (phoneInput) state.contactPhone = phoneInput.value.trim() || state.contactPhone;
    persist();
    refresh();
    onChange();
    closeSheet("edit-contact");
  });

  // ── Extra sheet ───────────────────────────────────────────────────
  const extraSheetInput = document.querySelector<HTMLTextAreaElement>("[data-extra-sheet-input]");
  document.querySelector<HTMLButtonElement>("[data-save-extra]")?.addEventListener("click", () => {
    if (extraSheetInput) {
      state.extraInfo = extraSheetInput.value;
      opts.syncExtra?.(state.extraInfo);
    }
    persist();
    refresh();
    onChange();
    closeSheet("edit-extra");
  });

  // ── Hydrate each sheet from current state when its card is clicked ──
  bindHydrate("edit-datetime", () => {
    if (editDp && editMo) {
      if (state.date) {
        editDp.select(state.date);
        editMo.showForDate(state.date);
        editMo.select(state.moment ?? null);
      } else {
        editDp.select(null);
        editMo.reset();
      }
      if (saveDt) saveDt.disabled = !(state.date && state.moment);
    }
  });
  bindHydrate("edit-contact", () => {
    if (nameInput) nameInput.value = state.contactName;
    if (phoneInput) phoneInput.value = state.contactPhone;
  });
  bindHydrate("edit-extra", () => {
    if (extraSheetInput) extraSheetInput.value = state.extraInfo;
  });

  function bindHydrate(sheet: string, fn: () => void) {
    document
      .querySelectorAll<HTMLElement>(`[data-open-sheet="${sheet}"]`)
      .forEach((el) => el.addEventListener("click", fn));
  }

  refresh();
  return { refresh };
}
