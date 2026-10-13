import "server-only";
import { headers } from "next/headers";
import { redis, redisConfig } from "./redis";

/**
 * Counters that run out after a while: wrong panel passwords per visitor, and how often one visitor
 * calls the waiter or orders. In Redis when it is connected, otherwise in this server's memory.
 */
type Entry = { count: number; until: number };
const memory: Map<string, Entry> = ((globalThis as { __sinirlar?: Map<string, Entry> }).__sinirlar ??= new Map());
const PREFIX = "kunefeci:sinir:";

/** How many times `name` has been counted in its current window. */
export async function counted(name: string): Promise<number> {
  if (redisConfig()) return Number((await redis<string | null>("GET", PREFIX + name)) ?? 0);
  const entry = memory.get(name);
  return entry && entry.until > Date.now() ? entry.count : 0;
}

/** Counts once more for `name`; the window of `seconds` starts with the first count. Returns the new count. */
export async function count(name: string, seconds: number): Promise<number> {
  if (redisConfig()) {
    // Created with its expiry in one step, so a counter can never be left without one.
    await redis("SET", PREFIX + name, 0, "EX", seconds, "NX");
    return Number(await redis<number>("INCR", PREFIX + name));
  }
  const now = Date.now();
  if (memory.size > 5000) for (const [key, entry] of memory) if (entry.until <= now) memory.delete(key);
  const entry = memory.get(name);
  if (!entry || entry.until <= now) {
    memory.set(name, { count: 1, until: now + seconds * 1000 });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

/** The visitor's address, as Vercel (or the proxy in front of the site) reports it. */
export async function visitorAddress(): Promise<string> {
  const h = await headers();
  return (h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0] ?? "yerel").trim().slice(0, 64);
}
