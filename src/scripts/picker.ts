// Chooses the date-picker implementation based on the rendered markup:
// the calendar (v2) sets data-picker="calendar"; otherwise the date strip (v1).
import { initDatePicker, type DatePickerApi } from "./datepicker";
import { initCalendar } from "./calendar";

export function initPicker(
  root: HTMLElement,
  onSelect: (iso: string) => void
): DatePickerApi {
  if (root.dataset.picker === "calendar") return initCalendar(root, onSelect);
  return initDatePicker(root, onSelect);
}
