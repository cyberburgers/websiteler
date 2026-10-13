import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redis, redisConfig } from "@/lib/redis";

/**
 * One shared password for the panel, set as ADMIN_PASSWORD in the hosting settings.
 * Logging in leaves a signed cookie for 30 days. Changing the password signs everyone out.
 */
const COOKIE = "yonetim_oturum";
const MAX_AGE = 60 * 60 * 24 * 30;
export const MIN_PASSWORD_LENGTH = 8;

export type PasswordState = "ok" | "missing" | "short";

export function passwordState(): PasswordState {
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) return "missing";
  return password.length < MIN_PASSWORD_LENGTH ? "short" : "ok";
}

function key(): Buffer | null {
  if (passwordState() !== "ok") return null;
  return createHash("sha256")
    .update(`kunefeci-yonetim\u0000${process.env.ADMIN_SESSION_SECRET ?? ""}\u0000${process.env.ADMIN_PASSWORD}`)
    .digest();
}

const sign = (secret: Buffer, payload: string) => createHmac("sha256", secret).update(payload).digest("base64url");

function sameText(a: string, b: string): boolean {
  // Hash first so the comparison takes the same time whatever the lengths.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(attempt: string): boolean {
  return passwordState() === "ok" && sameText(attempt, process.env.ADMIN_PASSWORD ?? "");
}

export async function startSession(): Promise<void> {
  const secret = key();
  if (!secret) throw new Error("Panel şifresi ayarlanmamış");
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  (await cookies()).set(COOKIE, `${expires}.${sign(secret, `oturum:${expires}`)}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const secret = key();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!secret || !value) return false;
  const [expires, signature] = value.split(".");
  // The expiry check reads the clock, so it must run for the real request, never in a prerender.
  await connection();
  if (!/^\d{10}$/.test(expires ?? "") || !signature || Number(expires) * 1000 < Date.now()) return false;
  return sameText(signature, sign(secret, `oturum:${expires}`));
}

/** Every panel action calls this first: the actions are public endpoints, the page around them is not a lock. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Oturum kapandı. Lütfen yeniden giriş yapın.");
}

/**
 * The key the panel reads and answers the tables' calls and orders with (sent as a header). It only lets
 * someone see and answer calls, never change the menu. It is random, not worked out from the password,
 * so it can't be a way to guess it. Kept in Redis, or in the .data folder on a single server.
 * Null until a panel password is set, or on Vercel before Redis is connected (calls don't work there yet).
 */
const STAFF_KEY = "kunefeci:garson:anahtar";
const STAFF_KEY_FILE = path.join(process.cwd(), ".data", "garson-anahtari");
// Only for a disk that can't be written. Read from the file every time otherwise: the panel page and the
// calls API are separate copies of this module, and must agree on the key.
const memory = globalThis as { __garsonAnahtari?: string };

async function storedStaffKey(): Promise<string | null> {
  if (redisConfig()) return redis<string | null>("GET", STAFF_KEY);
  try {
    const value = (await readFile(STAFF_KEY_FILE, "utf8")).trim();
    if (/^[\w-]{24}$/.test(value)) return value;
  } catch {
    // Not made yet, or no disk to keep it on.
  }
  return memory.__garsonAnahtari ?? null;
}

async function storeStaffKey(value: string): Promise<string> {
  if (redisConfig()) {
    await redis("SET", STAFF_KEY, value, "NX");
    return (await redis<string | null>("GET", STAFF_KEY)) ?? value;
  }
  memory.__garsonAnahtari = value;
  try {
    await mkdir(path.dirname(STAFF_KEY_FILE), { recursive: true });
    await writeFile(STAFF_KEY_FILE, value);
  } catch {
    // A read-only disk: the key lasts until the server restarts.
  }
  return value;
}

const newKey = () => randomBytes(18).toString("base64url");
const canHaveStaffKey = () => passwordState() === "ok" && (redisConfig() !== null || !process.env.VERCEL);

export async function staffKey(): Promise<string | null> {
  if (!canHaveStaffKey()) return null;
  return (await storedStaffKey()) ?? (await storeStaffKey(newKey()));
}

export async function isStaffKey(value: string | null | undefined): Promise<boolean> {
  if (!value || !/^[\w-]{24}$/.test(value)) return false;
  const expected = await staffKey();
  return Boolean(expected && sameText(value, expected));
}
