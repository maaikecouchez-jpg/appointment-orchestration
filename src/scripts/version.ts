// Per-version helpers. The active version is derived from the URL path
// (/v1/… or /v2/…) so storage keys and navigation stay isolated per test.
import { withBase } from "../lib/base";

export function getVersion(): string {
  const m = location.pathname.match(/\/v(\d+)(\/|$)/);
  return m ? m[1] : "1";
}

/** Namespaced sessionStorage key, e.g. "booking" → "booking:v2". */
export function vKey(name: string): string {
  return `${name}:v${getVersion()}`;
}

/** URL of this version's "Mijn afspraken" landing. */
export function vHome(): string {
  return withBase(`v${getVersion()}/`);
}

/** URL of this version's appointment detail page. */
export function vOverzicht(): string {
  return withBase(`v${getVersion()}/overzicht`);
}
