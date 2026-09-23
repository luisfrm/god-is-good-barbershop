import { getDb } from "@/server/db";
import type { SessionRow } from "@/server/models";

export async function insertSession(input: {
  token: string;
  userId: string;
  expiresAt: string;
}): Promise<void> {
  await getDb()
    .prepare(
      "INSERT INTO sessions (token, user_id, expires_at) VALUES (?1, ?2, ?3)"
    )
    .bind(input.token, input.userId, input.expiresAt)
    .run();
}

export async function findSession(token: string): Promise<SessionRow | null> {
  const row = await getDb()
    .prepare("SELECT * FROM sessions WHERE token = ?1")
    .bind(token)
    .first<SessionRow>();
  if (!row) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await deleteSession(token);
    return null;
  }
  return row;
}

export async function deleteSession(token: string): Promise<void> {
  await getDb().prepare("DELETE FROM sessions WHERE token = ?1").bind(token).run();
}

export async function deleteSessionsForUser(userId: string): Promise<void> {
  await getDb()
    .prepare("DELETE FROM sessions WHERE user_id = ?1")
    .bind(userId)
    .run();
}
