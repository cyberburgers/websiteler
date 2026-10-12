import "server-only";
import { randomBytes } from "node:crypto";

/**
 * Waiter calls and table orders.
 *
 * - A call ("Garson çağır", "Hesabı istiyorum") stays on the counter screen until a waiter taps "Tamam".
 * - An order goes new -> accepted ("Onayla": the guest sees "Hazırlanıyor") -> delivered ("Teslim edildi").
 *
 * - On Vercel: Upstash Redis (add it from the Vercel Marketplace; its REST address and token arrive
 *   as environment variables). Serverless copies of the site share nothing in memory, so a real store is needed.
 * - On a single server or this computer: kept in memory, which is enough there.
 */
export type CallKind = "garson" | "hesap";
/** One line of an order, priced on the server from the menu. Names are Turkish: the staff read them. */
export type OrderLine = { name: string; option?: string; qty: number; amount: number };
export type Call = {
  id: string;
  table: string;
  kind: CallKind | "siparis";
  at: number;
  /** A call: answered. An order: accepted, being made. */
  seenAt?: number;
  /** An order: brought to the table. */
  doneAt?: number;
  lines?: OrderLine[];
  note?: string;
  total?: number;
};

const PREFIX = "kunefeci:garson:";
const CALLS = `${PREFIX}cagrilar`;
/** One call per table this often, so a bored child can't keep the tablet ringing. */
const TABLE_COOLDOWN_SECONDS = 40;
/** Unanswered calls disappear after this; answered ones a little later, once the guest has seen it. */
const OPEN_FOR_MS = 30 * 60 * 1000;
const SEEN_KEPT_MS = 10 * 60 * 1000;
const MAX_OPEN = 60;
/** Orders: one per table this often (a double tap must not send it twice), and a few open at most. */
const ORDER_COOLDOWN_SECONDS = 20;
const ORDERS_PER_TABLE = 6;
const MAX_OPEN_ORDERS = 80;
/** An order nobody marks as delivered is cleared after this. */
const ORDER_OPEN_FOR_MS = 3 * 60 * 60 * 1000;

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

async function takeLock(name: string, seconds: number): Promise<boolean> {
  if (redisConfig()) {
    const ok = await redis<string | null>("SET", `${PREFIX}${name}`, "1", "NX", "EX", seconds);
    return ok === "OK";
  }
  const until = memory.locks.get(name) ?? 0;
  if (until > Date.now()) return false;
  memory.locks.set(name, Date.now() + seconds * 1000);
  return true;
}

async function releaseLock(name: string) {
  if (redisConfig()) await redis("DEL", `${PREFIX}${name}`);
  else memory.locks.delete(name);
}

const callLock = (table: string) => `kilit:${table}`;
const orderLock = (table: string) => `siparis-kilit:${table}`;

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

const isOrder = (call: Call) => call.kind === "siparis";

function isStale(call: Call, now: number): boolean {
  if (isOrder(call)) return call.doneAt ? now - call.doneAt > SEEN_KEPT_MS : now - call.at > ORDER_OPEN_FOR_MS;
  return call.seenAt ? now - call.seenAt > SEEN_KEPT_MS : now - call.at > OPEN_FOR_MS;
}

/** Still on the counter screen: a call nobody answered, or an order not yet delivered. */
const isOpen = (call: Call, now: number) => !isStale(call, now) && (isOrder(call) ? !call.doneAt : !call.seenAt);

export type CreateResult = { ok: true; id: string; at: number } | { ok: false; reason: "sik" | "dolu" };

export async function createCall(table: string, kind: CallKind): Promise<CreateResult> {
  if (!(await takeLock(callLock(table), TABLE_COOLDOWN_SECONDS))) return { ok: false, reason: "sik" };
  const now = Date.now();
  const open = (await readAll()).filter((c) => !isOrder(c) && isOpen(c, now));
  if (open.length >= MAX_OPEN) {
    await releaseLock(callLock(table));
    return { ok: false, reason: "dolu" };
  }
  const call: Call = { id: randomBytes(9).toString("base64url"), table, kind, at: now };
  await save(call);
  return { ok: true, id: call.id, at: call.at };
}

export async function createOrder(
  table: string,
  order: { lines: OrderLine[]; note?: string; total: number },
): Promise<CreateResult> {
  if (!(await takeLock(orderLock(table), ORDER_COOLDOWN_SECONDS))) return { ok: false, reason: "sik" };
  const now = Date.now();
  const open = (await readAll()).filter((c) => isOrder(c) && isOpen(c, now));
  if (open.length >= MAX_OPEN_ORDERS || open.filter((c) => c.table === table).length >= ORDERS_PER_TABLE) {
    return { ok: false, reason: "dolu" };
  }
  const call: Call = { id: randomBytes(9).toString("base64url"), table, kind: "siparis", at: now, ...order };
  await save(call);
  return { ok: true, id: call.id, at: call.at };
}

/** What the counter screen shows: open calls and orders, oldest first. Old ones are cleared out on the way. */
export async function openCalls(): Promise<Call[]> {
  const now = Date.now();
  const all = await readAll();
  await remove(all.filter((c) => isStale(c, now)).map((c) => c.id));
  return all.filter((c) => isOpen(c, now)).sort((a, b) => a.at - b.at);
}

async function readOne(id: string): Promise<Call | undefined> {
  return redisConfig()
    ? await redis<string | null>("HGET", CALLS, id).then((v) => (v ? (JSON.parse(v) as Call) : undefined))
    : memory.calls.get(id);
}

/** For the guest's phone. A call: waiting or seen. An order: waiting, being made or delivered. */
export async function callStatus(id: string): Promise<"bekliyor" | "goruldu" | "teslim" | "yok"> {
  const call = await readOne(id);
  if (!call || isStale(call, Date.now())) return "yok";
  if (call.doneAt) return "teslim";
  return call.seenAt ? "goruldu" : "bekliyor";
}

/** "Tamam" on a call (a waiter is on the way, the table may call again) or "Onayla" on an order. */
export async function markSeen(id: string): Promise<boolean> {
  const call = await readOne(id);
  if (!call) return false;
  if (!call.seenAt) {
    await save({ ...call, seenAt: Date.now() });
    if (!isOrder(call)) await releaseLock(callLock(call.table));
  }
  return true;
}

/** "Teslim edildi" on an order: it leaves the counter screen. */
export async function markDone(id: string): Promise<boolean> {
  const call = await readOne(id);
  if (!call || !isOrder(call)) return false;
  if (!call.doneAt) await save({ ...call, seenAt: call.seenAt ?? Date.now(), doneAt: Date.now() });
  return true;
}
