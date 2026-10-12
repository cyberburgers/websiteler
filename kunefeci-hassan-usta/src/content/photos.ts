import type { StaticImageData } from "next/image";
import type { ArtKind } from "@/components/art/FoodArt";
import baklava from "@/assets/photos/baklava.jpg";
import burma from "@/assets/photos/burma.jpg";
import cay from "@/assets/photos/cay.jpg";
import dondurma from "@/assets/photos/dondurma.jpg";
import fistik from "@/assets/photos/fistik.jpg";
import hero from "@/assets/photos/hero.jpg";
import kahve from "@/assets/photos/kahve.jpg";
import katmer from "@/assets/photos/katmer.jpg";
import kunefe1 from "@/assets/photos/kunefe1.jpg";
import kunefe2 from "@/assets/photos/kunefe2.jpg";
import kunefe3 from "@/assets/photos/kunefe3.jpg";
import kunefe4 from "@/assets/photos/kunefe4.jpg";
import mirra from "@/assets/photos/mirra.jpg";
import sillik from "@/assets/photos/sillik.jpg";
import sobiyet from "@/assets/photos/sobiyet.jpg";
import sutlac from "@/assets/photos/sutlac.jpg";
import tel from "@/assets/photos/tel.jpg";
import tepsi from "@/assets/photos/tepsi.jpg";
import urfa from "@/assets/photos/urfa.jpg";
import yapim from "@/assets/photos/yapim.jpg";

/**
 * FOTOĞRAFLAR — src/assets/photos/ klasöründeki dosyalar.
 *
 * Şimdilik Pexels ve Unsplash'tan alınmış, ücretsiz kullanılabilen temsili
 * fotoğraflar duruyor (kaynak listesi: src/assets/photos/KAYNAKLAR.md).
 * Dükkânın kendi fotoğrafları çekilince aynı adla dosyanın üstüne kaydetmek yeterli.
 *
 * "hero" ana sayfanın büyük, yuvarlak fotoğrafıdır; kare ve ortalı olmalı.
 * Menüde hangi ürünün hangi fotoğrafı kullandığı src/content/menu.ts içindeki
 * `image` alanında yazar.
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

export const photos: Partial<Record<PhotoKey, StaticImageData>> = {
  hero,
  kunefe1,
  kunefe2,
  kunefe3,
  kunefe4,
  tepsi,
  yapim,
  tel,
  fistik,
  baklava,
  burma,
  sobiyet,
  katmer,
  sillik,
  dondurma,
  sutlac,
  cay,
  kahve,
  mirra,
  urfa,
};

/** Çizimler: tatlı çarkının dilimlerinde ve fotoğrafı silinen yerlerde gösterilir. */
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
