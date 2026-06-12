// Calendar island (version 02). Exposes the same DatePickerApi as the
// date-strip picker so the wizard + confirm-editor logic is unchanged.
import type { DatePickerApi } from "./datepicker";

export function initCalendar(
  root: HTMLElement,
  onSelect: (iso: string) => void
): DatePickerApi {
  const label = root.querySelector<HTMLElement>("[data-cal-label]")!;
  const prevBtn = root.querySelector<HTMLButtonElement>("[data-cal-prev]")!;
  const nextBtn = root.querySelector<HTMLButtonElement>("[data-cal-next]")!;
  const months = Array.from(root.querySelectorAll<HTMLElement>("[data-month]"));
  const cells = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-cell]"));

  let index = 0;
  let selected: string | null = null;

  function showMonth(i: number) {
    if (!months.length) return;
    index = Math.max(0, Math.min(months.length - 1, i));
    months.forEach((m, mi) => (m.hidden = mi !== index));
    label.textContent = months[index].dataset.label ?? "";
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === months.length - 1;
  }

  function applySelection() {
    cells.forEach((c) => {
      c.dataset.selected = c.dataset.date === selected ? "true" : "false";
    });
  }

  function select(iso: string | null) {
    selected = iso;
    applySelection();
    if (iso) {
      const cell = cells.find((c) => c.dataset.date === iso);
      const monthEl = cell?.closest<HTMLElement>("[data-month]");
      if (monthEl) showMonth(Number(monthEl.dataset.index));
    } else {
      showMonth(0);
    }
  }

  cells.forEach((cell) => {
    if (cell.dataset.available !== "true") return;
    cell.addEventListener("click", () => {
      const iso = cell.dataset.date!;
      select(iso);
      onSelect(iso);
    });
  });

  prevBtn.addEventListener("click", () => showMonth(index - 1));
  nextBtn.addEventListener("click", () => showMonth(index + 1));

  showMonth(0);

  return { select, getSelected: () => selected };
}
