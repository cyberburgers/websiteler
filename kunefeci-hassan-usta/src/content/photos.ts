import type { StaticImageData } from "next/image";

/**
 * FOTOĞRAFLAR — dosyaları src/assets/photos/ klasörüne koyup aşağıda bağlayın:
 *
 *   import hero from "@/assets/photos/hero.jpg";
 *   import kunefe1 from "@/assets/photos/kunefe-1.jpg";
 *   export const photos: Partial<Record<PhotoKey, StaticImageData>> = { hero, kunefe1 };
 *
 * "hero" ana sayfanın büyük fotoğrafıdır. Menüde hangi ürünün hangi fotoğrafı
 * kullandığı src/content/menu.ts içindeki `image` alanında yazar.
 * Fotoğrafı olmayan yerlerde markaya uygun bir desen gösterilir.
 */
export type PhotoKey =
  | "hero"
  | "kunefe1"
  | "kunefe2"
  | "kunefe3"
  | "yapim"
  | "tel"
  | "fistik"
  | "baklava"
  | "burma"
  | "sobiyet"
  | "katmer"
  | "sillik"
  | "dondurma"
  | "sutlac"
  | "cay"
  | "kahve"
  | "mirra"
  | "urfa";

export const photos: Partial<Record<PhotoKey, StaticImageData>> = {};
