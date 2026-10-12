/**
 * İşletme bilgileri — sitenin her yerinde (başlık, alt bilgi, harita, Google
 * yapısal verisi) buradan okunur. "DOLDURULACAK" yazan alanlar örnek değerdir;
 * yayına almadan önce gerçek bilgilerle değiştirin.
 */
export const site = {
  name: "Künefeci Hassan Usta",
  /** Sitenin yayında olacağı adres. Vercel'de NEXT_PUBLIC_SITE_URL ile de verilebilir. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kunefecihassanusta.com", // DOLDURULACAK

  phone: "+904140000000", // DOLDURULACAK — uluslararası biçimde, boşluksuz
  phoneDisplay: "0 (414) 000 00 00", // DOLDURULACAK
  whatsapp: "905000000000", // DOLDURULACAK — başında + olmadan, 90 ile
  instagram: "kunefecihassanusta", // DOLDURULACAK — kullanıcı adı, @ olmadan

  address: {
    street: "Örnek Mah. Örnek Cad. No: 1", // DOLDURULACAK
    district: "Haliliye", // DOLDURULACAK
    city: "Şanlıurfa",
    postalCode: "63000", // DOLDURULACAK
    country: "TR",
  },
  /** Haritadaki iğnenin yeri. Google Haritalar'da dükkâna sağ tıklayıp koordinatı kopyalayın. */
  geo: { lat: 37.1591, lng: 38.7969 }, // DOLDURULACAK — şimdilik şehir merkezi

  /**
   * Çalışma saatleri. day: 1 = Pazartesi … 7 = Pazar.
   * Gece yarısından sonra kapanıyorsa close değeri open'dan küçük yazılır (ör. 10:00–01:00).
   */
  hours: [
    { day: 1, open: "10:00", close: "00:00" },
    { day: 2, open: "10:00", close: "00:00" },
    { day: 3, open: "10:00", close: "00:00" },
    { day: 4, open: "10:00", close: "00:00" },
    { day: 5, open: "10:00", close: "01:00" },
    { day: 6, open: "10:00", close: "01:00" },
    { day: 7, open: "10:00", close: "00:00" },
  ] as const, // DOLDURULACAK

  timeZone: "Europe/Istanbul",
  priceRange: "₺₺",
  foundingYear: null as number | null, // DOLDURULACAK — biliniyorsa ör. 1998
} as const;

export type DayHours = (typeof site.hours)[number];

export const links = {
  tel: `tel:${site.phone}`,
  whatsapp: (text?: string) => `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`,
  instagram: `https://www.instagram.com/${site.instagram}/`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${site.geo.lat},${site.geo.lng}`,
  mapsSearch: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name} ${site.address.city}`)}`,
};
