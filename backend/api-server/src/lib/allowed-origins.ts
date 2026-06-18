/**
 * Returns the list of allowed CORS/CSRF origins, derived purely from environment variables.
 *
 * Configure origins via one of these env vars (comma-separated list supported):
 *   FRONTEND_URLS   — primary multi-origin allowlist
 *   FRONTEND_URL    — single origin shorthand
 *   CORS_ORIGIN     — legacy alias
 *
 * In development, falls back to http://localhost:5173 when none are set.
 * Production domains must be explicitly listed in the environment — they are NOT
 * hardcoded here so that white-label and multi-tenant deployments work without
 * code changes.
 */
export function getAllowedOrigins(): string[] {
  const raw =
    process.env.FRONTEND_URLS ||
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN ||
    "http://localhost:5173";

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
