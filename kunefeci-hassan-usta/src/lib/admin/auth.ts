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

/**
 * One device at a time in the panel. Every sign-in gets its own id, kept in its cookie; the store keeps
 * which id holds the panel and when that device was last heard from (its panel checks in every few
 * minutes while open, see keepPanel). A sign-in from another device, even with the right password, is
 * turned away while the panel is in use there. Once that device signs out, or hasn't been heard from for
 * PANEL_IDLE_MINUTES (closed, switched off, lost), the next sign-in takes over and the old one is out.
 */
export const PANEL_IDLE_MINUTES = 15;
const HOLDER = "kunefeci:panel:acik";
type Holder = { sid: string; seen: number };
const holderMemory = globalThis as { __panelSahibi?: Holder | null };

async function readHolder(): Promise<Holder | null> {
  if (!redisConfig()) return holderMemory.__panelSahibi ?? null;
  const m = /^([\w-]{16})\|(\d{10,})$/.exec((await redis<string | null>("GET", HOLDER)) ?? "");
  return m ? { sid: m[1], seen: Number(m[2]) } : null;
}

async function writeHolder(holder: Holder | null): Promise<void> {
  if (!redisConfig()) {
    holderMemory.__panelSahibi = holder;
    return;
  }
  if (holder) await redis("SET", HOLDER, `${holder.sid}|${holder.seen}`, "EX", MAX_AGE);
  else await redis("DEL", HOLDER);
}

/** This browser's sign-in, if its cookie is genuine and not expired (whether or not it still holds the panel). */
async function cookieSession(): Promise<{ sid: string } | null> {
  const secret = key();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!secret || !value) return null;
  const [expires, sid, signature] = value.split(".");
  // The expiry check reads the clock, so it must run for the real request, never in a prerender.
  await connection();
  if (!/^\d{10}$/.test(expires ?? "") || !/^[\w-]{16}$/.test(sid ?? "") || !signature) return null;
  if (Number(expires) * 1000 < Date.now()) return null;
  return sameText(signature, sign(secret, `oturum:${expires}:${sid}`)) ? { sid: sid! } : null;
}

/** Signs this browser in, unless the panel is open on another device. */
export async function startSession(): Promise<"ok" | "busy"> {
  const secret = key();
  if (!secret) throw new Error("Panel şifresi ayarlanmamış");
  const mine = await cookieSession();
  const holder = await readHolder();
  const now = Date.now();
  if (holder && holder.sid !== mine?.sid && now - holder.seen < PANEL_IDLE_MINUTES * 60 * 1000) return "busy";
  const sid = mine && holder?.sid === mine.sid ? mine.sid : randomBytes(12).toString("base64url");
  await writeHolder({ sid, seen: now });
  const expires = Math.floor(now / 1000) + MAX_AGE;
  (await cookies()).set(COOKIE, `${expires}.${sid}.${sign(secret, `oturum:${expires}:${sid}`)}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return "ok";
}

export async function endSession(): Promise<void> {
  const mine = await cookieSession();
  if (mine && (await readHolder())?.sid === mine.sid) await writeHolder(null);
  (await cookies()).delete(COOKIE);
}

/**
 * Signed in and holding the panel. With nobody holding it (the last one signed out), a still-valid
 * sign-in picks it up again.
 */
export async function isAdmin(): Promise<boolean> {
  const mine = await cookieSession();
  if (!mine) return false;
  const holder = await readHolder();
  if (holder && holder.sid !== mine.sid) return false;
  if (!holder) await writeHolder({ sid: mine.sid, seen: Date.now() });
  return true;
}

/**
 * The panel is still open here: keeps its hold. "taken" once another device has taken the panel over,
 * "out" when this browser isn't signed in (any more).
 */
export async function keepPanel(): Promise<"ok" | "taken" | "out"> {
  const mine = await cookieSession();
  if (!mine) return "out";
  const holder = await readHolder();
  if (holder && holder.sid !== mine.sid) return "taken";
  await writeHolder({ sid: mine.sid, seen: Date.now() });
  return "ok";
}

export const TAKEN_OVER = "Panel başka bir cihazda açıldı. Buradan yeniden girmek için önce oradan çıkış yapılmalı.";

/** Every panel action calls this first: the actions are public endpoints, the page around them is not a lock. */
export async function requireAdmin(): Promise<void> {
  const state = await keepPanel();
  if (state === "ok") return;
  throw new Error(state === "taken" ? TAKEN_OVER : "Oturum kapandı. Lütfen yeniden giriş yapın.");
}

/**
 * The key the panel reads and answers the tables' calls and orders with (sent as a header). It only lets
 * someone see and answer calls, never change the menu. It is random, not worked out from the password,
 * so it can't be a way to guess it. Kept in Redis, or in the .data folder on a single server.
 * Null until a panel password is set, or on Vercel before Redis is connected (calls don't work there yet).
 */
const STAFF_KEY = "kunefeci:garson:anahtar";
const STAFF_KEY_FILE = path.join(process.cwd(), ".data", "garson-anahtari");
// Only for a disk that can't be written.
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

// The key never changes once made, so each server copy reads it once instead of on every check of the
// panel (every few seconds, each one a command of the free Redis plan).
let knownStaffKey: string | null = null;

export async function staffKey(): Promise<string | null> {
  if (!canHaveStaffKey()) return null;
  knownStaffKey ??= (await storedStaffKey()) ?? (await storeStaffKey(newKey()));
  return knownStaffKey;
}

export async function isStaffKey(value: string | null | undefined): Promise<boolean> {
  if (!value || !/^[\w-]{24}$/.test(value)) return false;
  if (sameText(value, (await staffKey()) ?? "")) return true;
  // The panel page and the calls API are separate copies of this module: if the store was emptied and a new
  // key made since this copy read it, look once more before saying no.
  knownStaffKey = null;
  return sameText(value, (await staffKey()) ?? "");
}
