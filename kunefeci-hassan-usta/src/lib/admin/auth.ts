import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

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
  (await cookies()).set(COOKIE, `${expires}.${sign(secret, String(expires))}`, {
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
  if (!expires || !signature || Number(expires) * 1000 < Date.now()) return false;
  return sameText(signature, sign(secret, expires));
}

/** Every panel action calls this first: the actions are public endpoints, the page around them is not a lock. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Oturum kapandı. Lütfen yeniden giriş yapın.");
}
