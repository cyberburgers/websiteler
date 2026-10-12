import { notFound } from "next/navigation";
import { Hero } from "@/components/home/Hero";
import { Process } from "@/components/home/Process";
import { Signature } from "@/components/home/Signature";
import { Story } from "@/components/home/Story";
import { Ticker } from "@/components/home/Ticker";
import { Trays } from "@/components/home/Trays";
import { Visit } from "@/components/home/Visit";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { JsonLd, restaurantJsonLd } from "@/lib/structured-data";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <>
      <JsonLd data={restaurantJsonLd(locale)} />
      <Hero locale={locale} dict={dict} />
      <Signature locale={locale} dict={dict} />
      <Ticker items={dict.ticker} />
      <Story dict={dict} />
      <Process dict={dict} />
      <Trays dict={dict} />
      <Visit dict={dict} />
    </>
  );
}
