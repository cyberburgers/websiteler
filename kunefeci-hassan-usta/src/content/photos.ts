import type { StaticImageData } from "next/image";
import type { ArtKind } from "@/components/art/FoodArt";

/**
 * FOTOĞRAFLAR — dosyaları src/assets/photos/ klasörüne koyup aşağıda bağlayın:
 *
 *   import hero from "@/assets/photos/hero.jpg";
 *   import kunefe1 from "@/assets/photos/kunefe-1.jpg";
 *   export const photos: Partial<Record<PhotoKey, StaticImageData>> = { hero, kunefe1 };
 *
 * "hero" ana sayfanın büyük fotoğrafıdır. Menüde hangi ürünün hangi fotoğrafı
 * kullandığı src/content/menu.ts içindeki `image` alanında yazar.
 * Fotoğrafı olmayan yerlerde aşağıdaki `photoArt` listesindeki çizim gösterilir.
 */
export type PhotoKey =
  | "hero"
  | "kunefe1"
  | "kunefe2"
  | "kunefe3"
  | "kunefe4"
  | "tepsi"
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

/** Fotoğraf eklenene kadar her yerde gösterilen çizim. */
export const photoArt: Record<PhotoKey, ArtKind | undefined> = {
  hero: "kunefe-ozel",
  kunefe1: "kunefe",
  kunefe2: "kunefe-fistik",
  kunefe3: "kunefe-kaymak",
  kunefe4: "kunefe-dondurma",
  tepsi: "tepsi",
  yapim: "tepsi",
  tel: "tel",
  fistik: "fistik",
  baklava: "baklava",
  burma: "burma",
  sobiyet: "sobiyet",
  katmer: "katmer",
  sillik: "sillik",
  dondurma: "dondurma",
  sutlac: "sutlac",
  cay: "cay",
  kahve: "kahve",
  mirra: "mirra",
  urfa: undefined,
};
