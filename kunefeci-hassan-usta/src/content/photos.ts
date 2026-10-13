import type { StaticImageData } from "next/image";
import dukkan from "@/assets/photos/dukkan.jpg";

/**
 * FOTOĞRAFLAR
 *
 * Siteyle gelen tek fotoğraf dükkânın kendisi (src/assets/photos/dukkan.jpg): ana sayfanın en üstünde durur.
 * Ürün fotoğrafları panelden yüklenir (Menü → ürün → Fotoğraf yükle); yüklenmeyen ürün fotoğrafsız görünür.
 */
export type PhotoKey = "dukkan";

export const photos: Record<PhotoKey, StaticImageData> = { dukkan };

export function isPhotoKey(value: string): value is PhotoKey {
  return value === "dukkan";
}

/**
 * Names of the stock photos the site used to come with. Menus saved back then still carry them: they are
 * read without complaint and dropped, so those dishes show no photo until one is uploaded.
 */
export const RETIRED_PHOTO =
  /^(hero|kunefe[1-4]|tepsi|baklava|burma|sobiyet|katmer|sillik|dondurma|sutlac|cay|kahve|mirra|kat(Kunefe|Serbetli|Sicak|Soguk))$/;

/** Photos uploaded from the panel: Vercel Blob in production, /medya/… when running on a single server. */
export function isUploadedPhoto(value: string): boolean {
  return /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/foto\/[\w.-]+$/i.test(value) || /^\/medya\/[\w-]+\.jpg$/.test(value);
}
