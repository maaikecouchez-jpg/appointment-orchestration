// Moments island: shows the 5 moment cards for a selected date,
// flags availability (incl. derived "Flexibel"), and handles selection.
import { getDay, isMomentAvailable, longDate } from "../lib/availability";
import type { MomentId } from "../lib/types";

export interface MomentsApi {
  showForDate(iso: string): void;
  select(id: MomentId | null): void;
  getSelected(): MomentId | null;
  reset(): void;
}

export function initMoments(
  root: HTMLElement,
  onSelect: (id: MomentId) => void,
): MomentsApi {
  const help = root.querySelector<HTMLElement>("[data-moments-help]")!;
  const duration = root.querySelector<HTMLElement>("[data-duration]")!;
  const buttons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-moment]"),
  );
  let selected: MomentId | null = null;

  function applySelection() {
    buttons.forEach((b) => {
      b.dataset.selected = b.dataset.moment === selected ? "true" : "false";
    });
  }

  function select(id: MomentId | null) {
    selected = id;
    applySelection();
  }

  function showForDate(iso: string) {
    const day = getDay(iso);
    root.hidden = false;
    duration.hidden = false;
    duration.textContent = "De installatie duurt maximaal 2u.";
    help.innerHTML = `Selecteer een tijdslot voor<br /><b>${longDate(iso)}</b>`;

    buttons.forEach((b) => {
      const id = b.dataset.moment as MomentId;
      const available = day ? isMomentAvailable(day, id) : false;
      b.dataset.available = available ? "true" : "false";
      b.disabled = !available;
    });

    // drop a selection that is no longer valid for this date
    if (selected) {
      const stillOk = buttons.find(
        (b) => b.dataset.moment === selected && b.dataset.available === "true",
      );
      if (!stillOk) selected = null;
    }
    applySelection();
  }

  function reset() {
    selected = null;
    root.hidden = true;
    duration.hidden = true;
    help.innerHTML =
      "Selecteer eerst een datum en kies dan een tijdslot voor je installatie";
  }

  buttons.forEach((b) => {
    b.addEventListener("click", () => {
      if (b.dataset.available !== "true") return;
      const id = b.dataset.moment as MomentId;
      select(id);
      onSelect(id);
    });
  });

  return { showForDate, select, getSelected: () => selected, reset };
}
