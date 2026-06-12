// Generic modal/sheet controller. Opens on `open-modal`/`open-sheet`
// CustomEvents whose detail matches the modal's data-modal id.
export function initModals() {
  const modals = Array.from(document.querySelectorAll<HTMLElement>("[data-modal]"));
  if (!modals.length) return;

  let lastFocus: HTMLElement | null = null;

  function open(id: string) {
    const modal = modals.find((m) => m.dataset.modal === id);
    if (!modal) return;
    lastFocus = document.activeElement as HTMLElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector<HTMLElement>("[data-modal-close]")?.focus();
  }

  function close(modal: HTMLElement) {
    modal.hidden = true;
    document.body.style.overflow = "";
    lastFocus?.focus();
  }

  function closeAll() {
    modals.forEach((m) => {
      if (!m.hidden) close(m);
    });
  }

  modals.forEach((modal) => {
    modal.querySelectorAll<HTMLElement>("[data-modal-close]").forEach((el) =>
      el.addEventListener("click", () => close(modal))
    );
  });

  // Trigger elements declared inline in markup
  document.querySelectorAll<HTMLElement>("[data-open-modal], [data-open-sheet]").forEach((trigger) => {
    const id = trigger.dataset.openModal ?? trigger.dataset.openSheet;
    if (id) trigger.addEventListener("click", () => open(id));
  });

  document.addEventListener("open-modal", (e) => open((e as CustomEvent).detail));
  document.addEventListener("open-sheet", (e) => open((e as CustomEvent).detail));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
}
