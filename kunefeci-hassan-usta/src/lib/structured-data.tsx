import { availableMenu } from "@/content/menu";
import { site } from "@/content/site";
import { localePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const schemaDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function absolute(path: string) {
  return new URL(path, site.url).toString();
}

/** Google'ın işletmeyi (adres, saat, menü bağlantısı) tanıması için Restaurant şeması. */
export function restaurantJsonLd(locale: Locale) {
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
    telephone: site.phone,
    priceRange: site.priceRange,
    servesCuisine: ["Turkish", "Künefe", "Turkish desserts"],
    hasMenu: absolute(localePath(locale)),
    acceptsReservations: false,
    ...(site.foundingYear ? { foundingDate: String(site.foundingYear) } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.district,
      addressRegion: site.address.city,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${schemaDays[h.day - 1]}`,
      opens: h.open,
      closes: h.close,
    })),
    sameAs: [`https://www.instagram.com/${site.instagram}/`],
  };
}

/** Menüdeki her ürünü fiyatıyla birlikte arama motorlarına anlatır. */
export function menuJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${site.name} — ${getDictionary(locale).menu.title}`,
    inLanguage: locale,
    url: absolute(localePath(locale)),
    hasMenuSection: availableMenu().map((category) => ({
      "@type": "MenuSection",
      name: category.name[locale],
      ...(category.description ? { description: category.description[locale] } : {}),
      hasMenuItem: category.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name[locale],
        description: item.description[locale],
        offers: item.prices.map((price) => ({
          "@type": "Offer",
          price: price.amount,
          priceCurrency: "TRY",
          ...(price.label ? { name: price.label[locale] } : {}),
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
