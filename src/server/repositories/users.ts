import { getDb } from "@/server/db";
import type { PublicUser, UserRow } from "@/server/models";

function toPublic(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    created_at: row.created_at,
  };
}

export async function countUsers(): Promise<number> {
  const row = await getDb()
    .prepare("SELECT COUNT(*) AS count FROM users")
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  return getDb()
    .prepare("SELECT * FROM users WHERE email = ?1")
    .bind(email.toLowerCase().trim())
    .first<UserRow>();
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  const row = await getDb()
    .prepare(
      "SELECT id, email, name, phone, created_at FROM users WHERE id = ?1"
    )
    .bind(id)
    .first<PublicUser>();
  return row ?? null;
}

export async function insertUser(input: {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  passwordSalt: string;
  passwordIterations: number;
}): Promise<PublicUser> {
  const email = input.email.toLowerCase().trim();
  await getDb()
    .prepare(
      `INSERT INTO users (id, email, name, phone, password_hash, password_salt, password_iterations)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
    )
    .bind(
      input.id,
      email,
      input.name.trim(),
      input.phone.trim(),
      input.passwordHash,
      input.passwordSalt,
      input.passwordIterations
    )
    .run();

  const created = await findUserById(input.id);
  if (!created) throw new Error("Failed to create user");
  return created;
}
