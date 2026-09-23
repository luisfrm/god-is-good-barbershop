import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/server/db";
import type { PublicUser, UserRow } from "@/server/models";
import {
  countUsers,
  findUserByEmail,
  findUserById,
  insertUser,
} from "@/server/repositories/users";
import {
  deleteSession,
  findSession,
  insertSession,
} from "@/server/repositories/sessions";

export const SESSION_COOKIE = "gg_session";
const SESSION_TTL_DAYS = 30;
const PBKDF2_ITERATIONS = 100_000;

const encoder = new TextEncoder();

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function pbkdf2(
  password: string,
  saltHex: string,
  iterations: number
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(saltHex),
      iterations,
      hash: "SHA-256",
    },
    key,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

async function hashPassword(
  password: string
): Promise<{ hash: string; salt: string; iterations: number }> {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return { hash, salt, iterations: PBKDF2_ITERATIONS };
}

async function verifyPassword(
  user: UserRow,
  password: string
): Promise<boolean> {
  const hash = await pbkdf2(
    password,
    user.password_salt,
    user.password_iterations
  );
  return hash === user.password_hash;
}

export async function hasRegisteredUsers(): Promise<boolean> {
  return (await countUsers()) > 0;
}

export async function login(
  email: string,
  password: string
): Promise<{ user: PublicUser } | { error: string }> {
  const user = await findUserByEmail(email);
  if (!user) return { error: "Credenciales inválidas" };
  const ok = await verifyPassword(user, password);
  if (!ok) return { error: "Credenciales inválidas" };

  const token = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
  const expires = new Date(
    Date.now() + SESSION_TTL_DAYS * 86_400_000
  ).toISOString();
  await insertSession({ token, userId: user.id, expiresAt: expires });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 86_400,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      created_at: user.created_at,
    },
  };
}

export async function register(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): Promise<{ user: PublicUser } | { error: string }> {
  if (await hasRegisteredUsers()) {
    return {
      error: "El registro está cerrado: ya existe una cuenta de administrador.",
    };
  }
  if (
    !input.name.trim() ||
    !input.email.trim() ||
    !input.phone.trim() ||
    !input.password
  ) {
    return { error: "Todos los campos son obligatorios" };
  }
  if (input.password !== input.confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }
  if (input.password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  const { hash, salt, iterations } = await hashPassword(input.password);
  const user = await insertUser({
    id: crypto.randomUUID(),
    email: input.email,
    name: input.name,
    phone: input.phone,
    passwordHash: hash,
    passwordSalt: salt,
    passwordIterations: iterations,
  });

  const token = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
  const expires = new Date(
    Date.now() + SESSION_TTL_DAYS * 86_400_000
  ).toISOString();
  await insertSession({ token, userId: user.id, expiresAt: expires });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 86_400,
  });

  return { user };
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await findSession(token);
  if (!session) {
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }
  const user = await findUserById(session.user_id);
  if (!user) {
    await deleteSession(token);
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }
  return user;
}

export async function requireUser(): Promise<PublicUser> {
  const user = await getSessionUser();
  if (!user) redirect("/panel/login");
  return user;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  cookieStore.delete(SESSION_COOKIE);
}

/** Ensure the D1 binding is reachable (throws on misconfig — no silent fallback). */
export async function assertDb(): Promise<void> {
  await getDb()
    .prepare("SELECT 1")
    .first();
}
