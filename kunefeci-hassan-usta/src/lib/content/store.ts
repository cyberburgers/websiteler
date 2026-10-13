import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, list, put } from "@vercel/blob";
import { redis, redisConfig } from "@/lib/redis";

/**
 * Where the panel keeps the menu and the photos it uploads.
 *
 * - On Vercel: Vercel Blob (connect a Blob store to the project; its token arrives as an environment variable).
 *   Every save is a new file; the newest one is the live menu and the last few stay as a backup.
 * - Anywhere else (a single server, or this computer): the `.data/` folder next to the project.
 */
export type StoreKind = "blob" | "local";

const KEEP_VERSIONS = 20;
const DATA_DIR = path.join(process.cwd(), ".data");

export function storeKind(): StoreKind {
  return process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID ? "blob" : "local";
}

/** Saving to the local folder can't work on Vercel: its file system is read-only and forgets between requests. */
export function storeIsWritable(): boolean {
  return storeKind() === "blob" || !process.env.VERCEL;
}

/**
 * The address of the newest saved menu, kept in Redis when it is set up. Finding it with list() instead is a
 * Blob "advanced operation", of which the free plan has 2,000 a month: every page refresh would spend one.
 */
const LATEST = "kunefeci:icerik:son";

/** Only an address of this project's own menu files is ever fetched. */
const isMenuFile = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com") && u.pathname.startsWith("/icerik/");
  } catch {
    return false;
  }
};


export async function readStoredContent(): Promise<unknown | null> {
  if (storeKind() === "blob") {
    const known = redisConfig() ? await redis<string | null>("GET", LATEST).catch(() => null) : null;
    if (known && isMenuFile(known)) {
      const res = await fetch(known, { cache: "no-store" }).catch(() => null);
      if (res?.ok) return res.json();
    }
    // Not noted yet (or Redis is unreachable): look it up the slow way, and note it for next time.
    const { blobs } = await list({ prefix: "icerik/" });
    const latest = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
    if (!latest) return null;
    const res = await fetch(latest.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Menü okunamadı (${res.status})`);
    if (redisConfig()) await redis("SET", LATEST, latest.url).catch(() => {});
    return res.json();
  }
  try {
    return JSON.parse(await readFile(path.join(DATA_DIR, "icerik.json"), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function writeStoredContent(json: string): Promise<void> {
  if (storeKind() === "blob") {
    // Each save gets its own address, so a copy may be kept at the edge for good: reading it costs nothing.
    const saved = await put("icerik/icerik.json", json, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    if (redisConfig()) {
      try {
        await redis("SET", LATEST, saved.url);
      } catch (error) {
        // Pages go by the noted address: without it this save would show up only now and then. Undo it, so
        // the panel says "Kaydedilemedi" and a second try saves it properly.
        await del(saved.url).catch(() => {});
        throw error;
      }
    }
    const { blobs } = await list({ prefix: "icerik/" });
    const old = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt)).slice(KEEP_VERSIONS);
    if (old.length) await del(old.map((b) => b.url));
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, "icerik.json");
  // Write next to it and swap, so a crash mid-write never leaves half a menu.
  await writeFile(`${file}.tmp`, json);
  await rename(`${file}.tmp`, file);
}

/** Stores a JPEG and returns the address to use in the menu. */
export async function storePhoto(jpeg: Buffer): Promise<string> {
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}`;
  if (storeKind() === "blob") {
    const blob = await put(`foto/${name}.jpg`, jpeg, {
      access: "public",
      contentType: "image/jpeg",
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return blob.url;
  }
  const dir = path.join(DATA_DIR, "medya");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${name}.jpg`), jpeg);
  return `/medya/${name}.jpg`;
}

export async function readLocalPhoto(name: string): Promise<Buffer | null> {
  if (!/^[\w-]+\.jpg$/.test(name)) return null;
  try {
    return await readFile(path.join(DATA_DIR, "medya", name));
  } catch {
    return null;
  }
}
