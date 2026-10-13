/**
 * Sitenin sabit bilgileri. Telefon, adres, saatler gibi işletme bilgileri
 * yönetici panelinden (/yonetim) değiştirilir; aşağıdaki `defaultInfo` yalnızca
 * panelden ilk kayıt yapılana kadar gösterilen başlangıç değeridir.
 */
export const site = {
  name: "Künefeci Hassan Usta",
  /**
   * Sitenin adresi (QR kartları, Google bağlantıları, site haritası). NEXT_PUBLIC_SITE_URL verilmişse o;
   * yoksa Vercel'in projeye verdiği yayın adresi (alan adı bağlıysa o, değilse ….vercel.app). Hiçbir zaman
   * sahibi olunmayan bir örnek adres değil: basılmış bir QR kartı yanlış siteye götürmesin.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  timeZone: "Europe/Istanbul",
  priceRange: "₺₺",
  foundingYear: null as number | null, // DOLDURULACAK — biliniyorsa ör. 1998
} as const;

/** day: 1 = Pazartesi … 7 = Pazar. Gece yarısından sonra kapanıyorsa close, open'dan küçüktür (10:00–01:00). */
export type DayHours = { day: number; open: string; close: string };

export type ShopInfo = {
  /** For tel: links, international form without spaces: +904140000000. */
  phone: string;
  phoneDisplay: string;
  /** No longer shown on the site; kept so details saved by older versions of the panel still read. */
  whatsapp?: string;
  /** Username without the @. */
  instagram: string;
  address: { street: string; district: string; city: string; postalCode: string; country: string };
  /** Where the map pin goes. */
  geo: { lat: number; lng: number };
  /** Days that are missing are closed. */
  hours: DayHours[];
};

export const defaultInfo: ShopInfo = {
  phone: "+904140000000",
  phoneDisplay: "0 (414) 000 00 00",
  instagram: "kunefecihassanusta",
  address: {
    street: "Örnek Mah. Örnek Cad. No: 1",
    district: "Haliliye",
    city: "Şanlıurfa",
    postalCode: "63000",
    country: "TR",
  },
  geo: { lat: 37.1591, lng: 38.7969 },
  hours: [
    { day: 1, open: "10:00", close: "00:00" },
    { day: 2, open: "10:00", close: "00:00" },
    { day: 3, open: "10:00", close: "00:00" },
    { day: 4, open: "10:00", close: "00:00" },
    { day: 5, open: "10:00", close: "01:00" },
    { day: 6, open: "10:00", close: "01:00" },
    { day: 7, open: "10:00", close: "00:00" },
  ],
};

export function linksFor(info: ShopInfo) {
  return { instagram: `https://www.instagram.com/${info.instagram}/` };
}
