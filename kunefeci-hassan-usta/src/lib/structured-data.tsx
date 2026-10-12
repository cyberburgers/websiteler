import type { MenuCategory } from "@/content/menu";
import { site, type ShopInfo } from "@/content/site";
import { localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { tx } from "./format";

const schemaDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function absolute(path: string) {
  return new URL(path, site.url).toString();
}

/** Google'ın işletmeyi (adres, saat, menü bağlantısı) tanıması için Restaurant şeması. */
export function restaurantJsonLd(locale: Locale, info: ShopInfo) {
  const dict = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": absolute("/#restaurant"),
    name: site.name,
    description: dict.meta.description,
    url: absolute(localePath(locale)),
    logo: absolute("/brand/logo.png"),
    image: absolute("/og.jpg"),
    telephone: info.phone,
    priceRange: site.priceRange,
    servesCuisine: ["Turkish", "Künefe", "Turkish desserts"],
    hasMenu: absolute(localePath(locale)),
    acceptsReservations: false,
    ...(site.foundingYear ? { foundingDate: String(site.foundingYear) } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: info.address.street,
      addressLocality: info.address.district,
      addressRegion: info.address.city,
      postalCode: info.address.postalCode,
      addressCountry: info.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: info.geo.lat, longitude: info.geo.lng },
    openingHoursSpecification: info.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${schemaDays[h.day - 1]}`,
      opens: h.open,
      closes: h.close,
    })),
    sameAs: [`https://www.instagram.com/${info.instagram}/`],
  };
}

/** Menüdeki her ürünü fiyatıyla birlikte arama motorlarına anlatır. */
export function menuJsonLd(locale: Locale, menu: MenuCategory[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${site.name} — ${getDictionary(locale).menu.title}`,
    inLanguage: locale,
    url: absolute(localePath(locale)),
    hasMenuSection: menu.map((category) => ({
      "@type": "MenuSection",
      name: tx(category.name, locale),
      ...(tx(category.description, locale) ? { description: tx(category.description, locale) } : {}),
      hasMenuItem: category.items.map((item) => ({
        "@type": "MenuItem",
        name: tx(item.name, locale),
        description: tx(item.description, locale),
        offers: item.prices.map((price) => ({
          "@type": "Offer",
          price: price.amount,
          priceCurrency: "TRY",
          ...(tx(price.label, locale) ? { name: tx(price.label, locale) } : {}),
        })),
      })),
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
