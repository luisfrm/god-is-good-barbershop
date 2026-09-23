import { findSection, upsertSection } from "@/server/repositories/content";
import type { CmsSectionData, CmsSectionKey } from "@/types/cms";

/**
 * Read a CMS section. Throws when the row is missing or JSON is invalid —
 * the site must never render silent fallback content.
 */
export async function getContentOrThrow<K extends CmsSectionKey>(
  section: K
): Promise<CmsSectionData[K]> {
  const row = await findSection(section);
  if (!row) {
    throw new Error(
      `CMS section "${section}" is missing. Run \`pnpm db:migrate:local\` to apply migrations/seeds.`
    );
  }
  try {
    return JSON.parse(row.data) as CmsSectionData[K];
  } catch {
    throw new Error(`CMS section "${section}" contains invalid JSON.`);
  }
}

export async function saveContent<K extends CmsSectionKey>(
  section: K,
  data: CmsSectionData[K]
): Promise<void> {
  await upsertSection(section, JSON.stringify(data));
}
