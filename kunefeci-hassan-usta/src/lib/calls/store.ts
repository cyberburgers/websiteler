import "server-only";
import { randomBytes } from "node:crypto";

/**
 * Waiter calls: a guest taps "Garson çağır", the tablet at the counter shows it until a waiter taps "Tamam".
 *
 * - On Vercel: Upstash Redis (add it from the Vercel Marketplace; its REST address and token arrive
 *   as environment variables). Serverless copies of the site share nothing in memory, so a real store is needed.
 * - On a single server or this computer: kept in memory, which is enough there.
 */
export type CallKind = "garson" | "hesap";
export type Call = { id: string; table: string; kind: CallKind; at: number; seenAt?: number };

const PREFIX = "kunefeci:garson:";
const CALLS = `${PREFIX}cagrilar`;
/** One call per table this often, so a bored child can't keep the tablet ringing. */
const TABLE_COOLDOWN_SECONDS = 40;
/** Unanswered calls disappear after this; answered ones a little later, once the guest has seen it. */
const OPEN_FOR_MS = 30 * 60 * 1000;
const SEEN_KEPT_MS = 10 * 60 * 1000;
const MAX_OPEN = 60;

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

/** False on Vercel before Redis is connected: calls would get lost there, so the button stays hidden. */
export function callsEnabled(): boolean {
  return redisConfig() !== null || !process.env.VERCEL;
}

async function redis<T>(...command: (string | number)[]): Promise<T> {
  const config = redisConfig();
  if (!config) throw new Error("Redis ayarlı değil");
  const res = await fetch(config.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command.map(String)),
    cache: "no-store",
  });
  const data = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || data.error) throw new Error(`Redis: ${data.error ?? res.status}`);
  return data.result as T;
}

// --- in memory, for a single server -----------------------------------------------------------
type Memory = { calls: Map<string, Call>; locks: Map<string, number> };
const memory: Memory = ((globalThis as { __garson?: Memory }).__garson ??= { calls: new Map(), locks: new Map() });

async function takeTableLock(table: string): Promise<boolean> {
  if (redisConfig()) {
    const ok = await redis<string | null>("SET", `${PREFIX}kilit:${table}`, "1", "NX", "EX", TABLE_COOLDOWN_SECONDS);
    return ok === "OK";
  }
  const until = memory.locks.get(table) ?? 0;
  if (until > Date.now()) return false;
  memory.locks.set(table, Date.now() + TABLE_COOLDOWN_SECONDS * 1000);
  return true;
}

async function releaseTableLock(table: string) {
  if (redisConfig()) await redis("DEL", `${PREFIX}kilit:${table}`);
  else memory.locks.delete(table);
}

async function readAll(): Promise<Call[]> {
  if (redisConfig()) {
    const flat = (await redis<string[] | null>("HGETALL", CALLS)) ?? [];
    const calls: Call[] = [];
    for (let i = 1; i < flat.length; i += 2) {
      try {
        calls.push(JSON.parse(flat[i]) as Call);
      } catch {
        // A damaged entry is skipped; the cleanup below removes it.
      }
    }
    return calls;
  }
  return [...memory.calls.values()];
}

async function save(call: Call) {
  if (redisConfig()) await redis("HSET", CALLS, call.id, JSON.stringify(call));
  else memory.calls.set(call.id, call);
}

async function remove(ids: string[]) {
  if (ids.length === 0) return;
  if (redisConfig()) await redis("HDEL", CALLS, ...ids);
  else ids.forEach((id) => memory.calls.delete(id));
}

const isStale = (call: Call, now: number) =>
  call.seenAt ? now - call.seenAt > SEEN_KEPT_MS : now - call.at > OPEN_FOR_MS;

export type CreateResult = { ok: true; id: string; at: number } | { ok: false; reason: "sik" | "dolu" };

export async function createCall(table: string, kind: CallKind): Promise<CreateResult> {
  if (!(await takeTableLock(table))) return { ok: false, reason: "sik" };
  const open = (await readAll()).filter((c) => !c.seenAt && !isStale(c, Date.now()));
  if (open.length >= MAX_OPEN) {
    await releaseTableLock(table);
    return { ok: false, reason: "dolu" };
  }
  const call: Call = { id: randomBytes(9).toString("base64url"), table, kind, at: Date.now() };
  await save(call);
  return { ok: true, id: call.id, at: call.at };
}

/** Calls nobody has answered yet, oldest first. Old ones are cleared out on the way. */
export async function openCalls(): Promise<Call[]> {
  const now = Date.now();
  const all = await readAll();
  await remove(all.filter((c) => isStale(c, now)).map((c) => c.id));
  return all.filter((c) => !c.seenAt && !isStale(c, now)).sort((a, b) => a.at - b.at);
}

export async function callStatus(id: string): Promise<"bekliyor" | "goruldu" | "yok"> {
  const call = redisConfig()
    ? await redis<string | null>("HGET", CALLS, id).then((v) => (v ? (JSON.parse(v) as Call) : undefined))
    : memory.calls.get(id);
  if (!call || isStale(call, Date.now())) return "yok";
  return call.seenAt ? "goruldu" : "bekliyor";
}

/** A waiter is on the way: the call leaves the tablet and the table may call again. */
export async function markSeen(id: string): Promise<boolean> {
  const call = redisConfig()
    ? await redis<string | null>("HGET", CALLS, id).then((v) => (v ? (JSON.parse(v) as Call) : undefined))
    : memory.calls.get(id);
  if (!call) return false;
  if (!call.seenAt) {
    await save({ ...call, seenAt: Date.now() });
    await releaseTableLock(call.table);
  }
  return true;
}
