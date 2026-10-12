import { notFound } from "next/navigation";
import { MenuPage } from "@/components/menu/MenuPage";
import { isLocale } from "@/i18n/config";
import { JsonLd, restaurantJsonLd } from "@/lib/structured-data";

/** The site is the menu: the home page opens straight onto it. */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <JsonLd data={restaurantJsonLd(locale)} />
      <MenuPage locale={locale} />
    </>
  );
}
