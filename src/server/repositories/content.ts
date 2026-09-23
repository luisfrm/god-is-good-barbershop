import { getDb } from "@/server/db";
import type { ContentRow } from "@/server/models";
import type { CmsSectionKey } from "@/types/cms";

export async function findSection(
  section: CmsSectionKey
): Promise<ContentRow | null> {
  return (await getDb())
    .prepare("SELECT * FROM content WHERE section = ?1")
    .bind(section)
    .first<ContentRow>();
}

export async function upsertSection(
  section: CmsSectionKey,
  dataJson: string
): Promise<void> {
  await (await getDb())
    .prepare(
      `INSERT INTO content (section, data, updated_at)
       VALUES (?1, ?2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
       ON CONFLICT(section) DO UPDATE SET
         data = excluded.data,
         updated_at = excluded.updated_at`
    )
    .bind(section, dataJson)
    .run();
}
