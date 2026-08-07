/**
 * Reads an environment variable, treating empty or whitespace-only values as
 * "not set".
 *
 * `process.env.X ?? "default"` is a trap: hosting dashboards (and some shells)
 * frequently define a variable as an EMPTY STRING, which `??` happily returns.
 * That silently produced an admin account with a blank email — making login
 * impossible. Always use this helper for optional configuration.
 */
export function envOr(key: string, fallback: string): string {
  const raw = process.env[key];
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export const ADMIN_DEFAULTS = {
  get name() {
    return envOr("ADMIN_NAME", "Abuzar Ahmed");
  },
  get email() {
    return envOr("ADMIN_EMAIL", "admin@abuzarsoftware.com").toLowerCase();
  },
  get password() {
    return envOr("ADMIN_PASSWORD", "admin123");
  },
};
