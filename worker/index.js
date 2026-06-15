// Password gate (HTTP Basic Auth) in front of the static Astro site.
//
// Credentials are read from two encrypted Worker secrets — set them once in the
// Cloudflare dashboard (Worker → Settings → Variables and Secrets), or via:
//   npx wrangler secret put AUTH_USER
//   npx wrangler secret put AUTH_PASS
//
// `run_worker_first: true` in wrangler.jsonc guarantees this runs before any
// static asset is served, so every page is gated. Authenticated requests are
// served from the ASSETS binding (the built ./dist directory).

export default {
  async fetch(request, env) {
    if (!env.AUTH_USER || !env.AUTH_PASS) {
      // Misconfiguration: fail closed rather than serving the site unprotected.
      return new Response(
        "Site auth is not configured (missing AUTH_USER / AUTH_PASS secrets).",
        { status: 503 }
      );
    }

    const header = request.headers.get("Authorization") || "";
    if (header.startsWith("Basic ")) {
      let decoded = "";
      try {
        decoded = atob(header.slice(6));
      } catch {
        decoded = "";
      }
      const sep = decoded.indexOf(":");
      const user = sep === -1 ? decoded : decoded.slice(0, sep);
      const pass = sep === -1 ? "" : decoded.slice(sep + 1);

      if (safeEqual(user, env.AUTH_USER) && safeEqual(pass, env.AUTH_PASS)) {
        return env.ASSETS.fetch(request);
      }
    }

    return new Response("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Telenet prototype", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  },
};

// Length-aware comparison that avoids early-exit on the first differing byte.
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
