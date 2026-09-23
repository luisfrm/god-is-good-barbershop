import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * D1 binding handle. Throws when the Cloudflare context is unavailable
 * (misconfigured dev/build) — no silent fallbacks.
 *
 * Async mode is required: `getCloudflareContext()` (sync) only works inside a
 * request scope, while ISR/SSG prerendering at build time also needs the
 * binding. Always call it as `(await getDb())`.
 */
export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const db = env.DB;
  if (!db) {
    throw new Error(
      "Missing D1 binding DB. Run via `pnpm dev` (initOpenNextCloudflareForDev) or `pnpm preview`."
    );
  }
  return db;
}
