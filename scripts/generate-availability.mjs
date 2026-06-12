// Generates a mocked "API" response: daily availability for the next 4 months.
//
// Rules:
//  - Weekends (Sat/Sun) are always unavailable.
//  - ~50% of weekdays have availability; the rest are fully unavailable.
//  - When a weekday is available, 80% of the time at least 3 of the 4 spots are open.
//  - A day is "available" when at least one of its 4 spots is open.
//
// The four real spots are: voormiddag, middag, namiddag, avond.
// ("Flexibel" is derived at render time and is NOT stored here.)
//
// Run with:  npm run gen:data   (optionally: SEED=123 MONTHS=4 npm run gen:data)

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MONTHS = Number(process.env.MONTHS ?? 4);
const SEED = Number(process.env.SEED ?? 20260611);
const SPOTS = ["voormiddag", "middag", "namiddag", "avond"];

// Deterministic PRNG (mulberry32) so the same seed reproduces the same data.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(SEED);

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

/** Pick `count` distinct spot indices to mark available. */
function openSpots(count) {
  const idx = [0, 1, 2, 3];
  // Fisher–Yates with our seeded PRNG
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const chosen = new Set(idx.slice(0, count));
  return SPOTS.reduce((acc, name, i) => {
    acc[name] = chosen.has(i);
    return acc;
  }, {});
}

function emptySpots() {
  return SPOTS.reduce((acc, name) => ((acc[name] = false), acc), {});
}

function buildDay(date) {
  const dow = date.getDay(); // 0 Sun … 6 Sat
  const isWeekend = dow === 0 || dow === 6;

  if (isWeekend) {
    return { date: isoDate(date), available: false, spots: emptySpots() };
  }

  // ~50% of weekdays have availability
  const hasAvailability = rand() < 0.5;
  if (!hasAvailability) {
    return { date: isoDate(date), available: false, spots: emptySpots() };
  }

  // 80% → at least 3 spots open (3 or 4); else 1–2 spots open
  let count;
  if (rand() < 0.8) {
    count = rand() < 0.5 ? 3 : 4;
  } else {
    count = rand() < 0.5 ? 1 : 2;
  }

  const spots = openSpots(count);
  return { date: isoDate(date), available: true, spots };
}

function generate() {
  // "Today" — fixed to the prototype's reference date for reproducibility.
  const start = new Date("2026-06-11T00:00:00Z");
  const end = new Date(start);
  end.setMonth(end.getMonth() + MONTHS);

  const days = [];
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    days.push(buildDay(new Date(d)));
  }

  return { generatedAt: isoDate(start), days };
}

const data = generate();
const outPath = resolve(__dirname, "../src/data/availability.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n");

const availableCount = data.days.filter((d) => d.available).length;
const weekdayCount = data.days.filter((d) => {
  const dow = new Date(d.date).getUTCDay();
  return dow !== 0 && dow !== 6;
}).length;
console.log(
  `Generated ${data.days.length} days → ${outPath}\n` +
    `  available days: ${availableCount} (${Math.round(
      (availableCount / weekdayCount) * 100
    )}% of ${weekdayCount} weekdays)`
);
