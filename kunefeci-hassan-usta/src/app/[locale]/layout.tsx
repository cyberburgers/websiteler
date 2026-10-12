import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Splash } from "@/components/Splash";
import { WaiterCall } from "@/components/WaiterCall";
import { site } from "@/content/site";
import { isLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { callsEnabled } from "@/lib/calls/store";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { fontVariables } from "../fonts";
import "../globals.css";
import "../splash-logo.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: dict.meta.title, template: `%s · ${site.name}` },
    applicationName: site.name,
    ...pageMetadata({ locale, path: "/", description: dict.meta.description }),
  };
}

export const viewport: Viewport = {
  themeColor: "#1d3126",
  colorScheme: "light",
  viewportFit: "cover",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const home = localePath(locale);
  const { info } = await getContent();

  return (
    <html
      lang={locale}
      className={`${fontVariables} antialiased`}
      // The splash script adds a class to <html> before React hydrates.
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <Splash />
        <a
          href="#icerik"
          className="print-hidden fixed start-4 top-4 z-[60] -translate-y-24 rounded-full bg-fistik-300 px-5 py-3 font-bold text-zumrut-900 shadow-lg transition focus:translate-y-0"
        >
          {dict.nav.skip}
        </a>
        <SiteHeader
          logo={<Logo id="header-logo" className="h-auto w-full drop-shadow-[0_8px_14px_rgba(20,35,25,.45)]" />}
          homeHref={home}
          labels={{ back: dict.category.back }}
        />
        <main id="icerik">{children}</main>
        <SiteFooter locale={locale} dict={dict} info={info} />
        <WaiterCall enabled={callsEnabled()} labels={dict.call} tableLabel={dict.home.table} />
      </body>
    </html>
  );
}
