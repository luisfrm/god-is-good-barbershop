import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * D1 binding handle. Throws when the Cloudflare context is unavailable
 * (misconfigured dev/build) — no silent fallbacks.
 */
export function getDb(): D1Database {
  const { env } = getCloudflareContext();
  const db = env.DB;
  if (!db) {
    throw new Error(
      "Missing D1 binding DB. Run via `pnpm dev` (initOpenNextCloudflareForDev) or `pnpm preview`."
    );
  }
  return db;
}
