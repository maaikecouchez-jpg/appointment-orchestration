# Fiber – Make an Appointment (prototype)

Responsive, mobile-first Astro prototype of the Telenet fiber outdoor-installation
appointment flow. See [`PROJECT-SETUP.md`](./PROJECT-SETUP.md) for the full design rationale.

## Run

```bash
npm install
npm run dev        # → http://localhost:4321/appointment-orchestration/
```

> The site is configured with a `base` of `/appointment-orchestration` (for GitHub
> Pages), so locally it lives under that path too. Internal links/assets go through
> `withBase()` in `src/lib/base.ts`.

## Deployment

Pushed to GitHub and served via **GitHub Pages** at
`https://citizen-k-code.github.io/appointment-orchestration/`. The workflow in
`.github/workflows/deploy.yml` rebuilds and redeploys on **every push to `main`**.

### Versions (A/B test)

- `/` — **"Afspraak maken"** selector with two links: **versie 01** and **versie 02**.
- `/v1/` + `/v1/overzicht` — **version 01**: booking flow with the horizontal date strip.
- `/v2/` + `/v2/overzicht` — **version 02**: identical flow, but the date step uses a
  **month calendar** (greyed unavailable days, green dot = available, yellow stroke =
  selected, month arrows that only step through months containing availability).

Both versions share all code except the date picker (`BookingFlow` / `BookingDetail`
components take a `version` prop; `DatePickerSlot` renders `DatePicker` vs `CalendarPicker`;
`initPicker()` switches the matching island). Each version keeps **separate booking state**
(sessionStorage keys are namespaced per version via `src/scripts/version.ts`).

Inside a version: **"Maak je afspraak"** opens the wizard (intro → date → extra → confirm)
in a fullscreen overlay; confirming redirects to that version's `…/overzicht`.

On the confirm step, the three cards (datetime, contact, extra info) are fully clickable
and each opens a bottom sheet to edit that input. Selecting a date auto-scrolls the time
slots into view.

## Responsive

The breakpoint is **1024px** (`<1024` = mobile, `≥1024` = desktop).

- **Dashboard pages** (`/`, `/overzicht`): mobile uses the yellow header + bottom nav;
  desktop switches to a left yellow **sidebar** + white **top bar** + a left-aligned
  content column, with inline card buttons and a page footer.
- **Wizard / manage overlays**: mobile is the full-screen mobile card; desktop is a
  full-width layout (logo + "Sluiten" header, centered content, full-width footer). The
  **date grid** goes 5→7 columns, **moments** 2→3 columns (via CSS container queries, so
  the narrow edit dialog keeps 5/2), and the **confirm step** becomes a 2-column layout
  with the technician illustration (`public/img/installation.svg`).
- **Edit bottom sheets** become centered **dialogs** on desktop.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run gen:data` | Regenerate `src/data/availability.json` |

## Changing the dynamic bits

- **Address, customer, copy, moments, FAQ** → [`src/data/variables.ts`](./src/data/variables.ts)
- **Design tokens** (colours, spacing, type) → [`src/styles/tokens.css`](./src/styles/tokens.css)
- **Availability data** → regenerate with `npm run gen:data`
  (rules: weekends closed, ~50% of weekdays open, 80% of open days have ≥3 of 4 spots).
  Use `SEED=123 MONTHS=4 npm run gen:data` for a different but reproducible dataset.

## Moments

Four real spots are stored per day — **voormiddag** (8–12), **middag** (10–13.30),
**namiddag** (12.30–17), **avond** (17–19). The **Flexibel** (8–17) card is derived:
available whenever morning, noon **or** afternoon is open.

## Fonts

Google-font stand-ins for the licensed Telenet fonts: **Archivo** (display, ≈ PP Right
Telenet) and **Hanken Grotesk** (body, ≈ Telenet Albra Sans). To use the real fonts, add
the `.woff2` files to `public/fonts/`, declare `@font-face` in `global.css`, and update the
`--font-display` / `--font-body` variables in `tokens.css`.
