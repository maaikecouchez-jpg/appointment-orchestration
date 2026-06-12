// Datepicker island: windowed paging (Vroeger/Later) + date selection.

export interface DatePickerApi {
  select(iso: string | null): void;
  getSelected(): string | null;
}

export function initDatePicker(
  root: HTMLElement,
  onSelect: (iso: string) => void
): DatePickerApi {
  // 14 cells (2 rows × 7) on the wide desktop step, 15 (3 rows × 5) on mobile.
  const isWide = typeof window !== "undefined"
    && window.matchMedia("(min-width: 1024px)").matches
    && root.closest("[data-edit-dt]") === null;
  const page = isWide ? 14 : Number(root.dataset.page ?? 15);
  const grid = root.querySelector<HTMLElement>("[data-grid]")!;
  const cells = Array.from(grid.querySelectorAll<HTMLButtonElement>("[data-cell]"));
  const prevBtn = root.querySelector<HTMLButtonElement>("[data-prev]")!;
  const nextBtn = root.querySelector<HTMLButtonElement>("[data-next-page]")!;

  let start = 0;
  let selected: string | null = null;

  function renderWindow() {
    cells.forEach((cell, i) => {
      cell.hidden = i < start || i >= start + page;
    });
    prevBtn.disabled = start === 0;
    nextBtn.disabled = start + page >= cells.length;
  }

  function applySelection() {
    cells.forEach((cell) => {
      cell.dataset.selected = cell.dataset.date === selected ? "true" : "false";
    });
  }

  function select(iso: string | null) {
    selected = iso;
    applySelection();
    if (iso) {
      // ensure the selected date is within the visible window
      const idx = cells.findIndex((c) => c.dataset.date === iso);
      if (idx >= 0 && (idx < start || idx >= start + page)) {
        start = Math.floor(idx / page) * page;
        renderWindow();
      }
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

  prevBtn.addEventListener("click", () => {
    start = Math.max(0, start - page);
    renderWindow();
  });
  nextBtn.addEventListener("click", () => {
    if (start + page < cells.length) start += page;
    renderWindow();
  });

  renderWindow();

  return {
    select,
    getSelected: () => selected,
  };
}
