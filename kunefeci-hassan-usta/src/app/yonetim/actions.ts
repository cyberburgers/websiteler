"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import type { z } from "zod";
import { site } from "@/content/site";
import {
  MIN_PASSWORD_LENGTH,
  PANEL_IDLE_MINUTES,
  checkPassword,
  endSession,
  passwordState,
  requireAdmin,
  startSession,
} from "@/lib/admin/auth";
import { count, counted, visitorAddress } from "@/lib/limits";
import { CONTENT_TAG, readContentFresh, type SiteContent } from "@/lib/content";
import { mergeEdits } from "@/lib/content/merge";
import { contentSchema } from "@/lib/content/schema";
import { storeIsWritable, storePhoto, writeStoredContent } from "@/lib/content/store";

export type LoginState = { error?: string };

const MAX_WRONG = 10;
const WRONG_WINDOW_SECONDS = 15 * 60;

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const state = passwordState();
  if (state === "missing") {
    return { error: "Panel şifresi henüz ayarlanmamış. Barındırma ayarlarına ADMIN_PASSWORD ekleyin." };
  }
  if (state === "short") return { error: `Panel şifresi en az ${MIN_PASSWORD_LENGTH} karakter olmalı.` };
  // Ten wrong passwords from one address, then a quarter of an hour's wait: guessing it would take years.
  const tries = `giris:${await visitorAddress()}`;
  if ((await counted(tries)) >= MAX_WRONG) {
    return { error: "Çok fazla yanlış deneme. 15 dakika sonra tekrar deneyin." };
  }
  if (!checkPassword(String(formData.get("sifre") ?? ""))) {
    await count(tries, WRONG_WINDOW_SECONDS);
    // A short pause on every wrong guess as well.
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { error: "Şifre yanlış." };
  }
  if ((await startSession()) === "busy") {
    return {
      error: `Panel şu an başka bir cihazda açık. Önce oradan çıkış yapın; o cihaz kapalıysa ${PANEL_IDLE_MINUTES} dakika sonra buradan girebilirsiniz.`,
    };
  }
  redirect("/yonetim");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/yonetim/giris");
}

const NO_STORE =
  "Bu sunucuda kayıt yeri yok. Vercel'de projeye Blob depolaması bağlanmalı (README'deki adımlar).";

async function guard(): Promise<string | null> {
  try {
    await requireAdmin();
  } catch (error) {
    return (error as Error).message;
  }
  return storeIsWritable() ? null : NO_STORE;
}

/** The first problem, said in words, with the dish or category it belongs to. */
function firstProblem(error: z.ZodError, input: unknown): string {
  const issue = error.issues[0];
  if (!issue) return "Bilgilerde bir sorun var.";
  const [area, ci, part, ii] = issue.path;
  if (area === "menu" && typeof ci === "number") {
    const menu = (input as { menu?: { name?: { tr?: string }; items?: { name?: { tr?: string } }[] }[] }).menu;
    const category = menu?.[ci];
    const where =
      part === "items" && typeof ii === "number"
        ? category?.items?.[ii]?.name?.tr || "Adı yazılmamış bir ürün"
        : category?.name?.tr || "Adı yazılmamış bir kategori";
    return `${where}: ${issue.message}`;
  }
  return issue.message;
}

function shopDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: site.timeZone, dateStyle: "short" }).format(date);
}

export type SaveResult =
  | { ok: true; savedAt: string; menuUpdatedAt: string; merged?: SiteContent }
  | { ok: false; error: string };

/**
 * Stores the whole menu and shop details at once, then refreshes every page that shows them.
 * @param base What this panel last loaded or saved. If the store has been saved from somewhere else since,
 * both sides' changes are kept (see mergeEdits) and the result comes back as `merged`.
 */
export async function saveContentAction(input: unknown, base: unknown): Promise<SaveResult> {
  const blocked = await guard();
  if (blocked) return { ok: false, error: blocked };

  const parsed = contentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstProblem(parsed.error, input) };

  try {
    const current = await readContentFresh();
    const from = contentSchema.safeParse(base);
    const start = from.success ? (from.data as SiteContent) : null;
    let next = parsed.data as SiteContent;
    const elsewhere = (current.savedAt ?? null) !== (start?.savedAt ?? null);
    if (elsewhere) {
      const together = contentSchema.safeParse(mergeEdits(start ?? { ...current, menu: [] }, next, current));
      if (!together.success) {
        return { ok: false, error: "Başka yerden yapılan değişikliklerle birleştirilemedi. Sayfayı yenileyip tekrar deneyin." };
      }
      next = together.data as SiteContent;
    }
    const now = new Date();
    const content = { ...next, savedAt: now.toISOString(), menuUpdatedAt: shopDate(now) };
    await writeStoredContent(JSON.stringify(content));
    updateTag(CONTENT_TAG);
    return { ok: true, savedAt: content.savedAt, menuUpdatedAt: content.menuUpdatedAt, merged: elsewhere ? content : undefined };
  } catch (error) {
    console.error("Panel kaydı başarısız", error);
    return { ok: false, error: "Kaydedilemedi. İnternet bağlantısını kontrol edip tekrar deneyin." };
  }
}

const MAX_UPLOAD = 4 * 1024 * 1024;

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/** Turns a phone photo into a menu photo: upright, at most 1600 px, JPEG, without its location data. */
export async function uploadPhotoAction(formData: FormData): Promise<UploadResult> {
  const blocked = await guard();
  if (blocked) return { ok: false, error: blocked };

  const file = formData.get("foto");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Fotoğraf seçilmedi." };
  if (file.size > MAX_UPLOAD) return { ok: false, error: "Fotoğraf çok büyük (en fazla 4 MB)." };
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    return { ok: false, error: "Bu dosya türü desteklenmiyor. JPEG, PNG ya da WebP seçin." };
  }

  let jpeg: Buffer;
  try {
    jpeg = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch {
    return { ok: false, error: "Fotoğraf açılamadı. Başka bir fotoğraf deneyin." };
  }
  try {
    return { ok: true, url: await storePhoto(jpeg) };
  } catch (error) {
    console.error("Fotoğraf yüklenemedi", error);
    return { ok: false, error: "Fotoğraf kaydedilemedi. Tekrar deneyin." };
  }
}
