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
  const loadingOverlay = root.querySelector<HTMLElement>("[data-loading-overlay]");
  const loadingState = root.querySelector<HTMLElement>("[data-loading-state]");
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

  function setLoading(isLoading: boolean) {
    if (loadingOverlay) loadingOverlay.hidden = !isLoading;
    if (loadingState) loadingState.hidden = !isLoading;
    const globalBackdrop = document.querySelector<HTMLElement>('[data-global-backdrop]');
    if (globalBackdrop) globalBackdrop.hidden = !isLoading;
    const weekdays = root.querySelector<HTMLElement>(".cal-weekdays");
    if (weekdays) weekdays.hidden = isLoading;
    if (isLoading) {
      months.forEach((m) => {
        if (m) m.hidden = true;
      });
    } else {
      showMonth(index);
    }
    prevBtn.disabled = isLoading || index === 0;
    nextBtn.disabled = isLoading || index === months.length - 1;
  }

  prevBtn.addEventListener("click", () => {
    if (index === 0) return;
    setLoading(true);
    setTimeout(() => {
      showMonth(index - 1);
      setLoading(false);
    }, window.__ASTRO_APP_CONFIG?.loading?.calendarMs ?? 16000);
  });
  nextBtn.addEventListener("click", () => {
    if (index === months.length - 1) return;
    setLoading(true);
    setTimeout(() => {
      showMonth(index + 1);
      setLoading(false);
    }, window.__ASTRO_APP_CONFIG?.loading?.calendarMs ?? 16000);
  });

  showMonth(0);

  return { select, getSelected: () => selected };
}
