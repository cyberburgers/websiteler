import type { StaticImageData } from "next/image";

/**
 * FOTOĞRAFLAR — dosyalar src/assets/photos/ klasöründedir.
 * Kendi fotoğrafınızı koymak için aynı adla dosyanın üzerine yazmanız yeterli.
 * Fotoğrafı olmayan ürünlerde markaya uygun bir desen gösterilir.
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
