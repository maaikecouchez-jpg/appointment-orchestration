// Build a URL relative to the site's base path (works under GitHub Pages'
// /appointment-orchestration/ subpath as well as at the root in dev).
const raw = import.meta.env.BASE_URL;
const base = raw.endsWith("/") ? raw : `${raw}/`;

export function withBase(path = ""): string {
  return base + path.replace(/^\//, "");
}
