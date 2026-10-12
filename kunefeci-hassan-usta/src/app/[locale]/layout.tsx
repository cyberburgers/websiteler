import type { Metadata, Viewport } from "next";
import { Berkshire_Swash, Fraunces, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { MobileActionBar } from "@/components/MobileActionBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { links, site } from "@/content/site";
import { isLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import "../globals.css";

const berkshire = Berkshire_Swash({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-berkshire",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

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
  themeColor: "#181a3a",
  colorScheme: "light",
  viewportFit: "cover",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const home = localePath(locale);

  return (
    <html lang={locale} className={`${berkshire.variable} ${fraunces.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-dvh">
        <a
          href="#icerik"
          className="fixed start-4 top-4 z-[60] -translate-y-24 rounded-full bg-sari-300 px-5 py-3 font-bold text-lacivert-900 shadow-lg transition focus:translate-y-0"
        >
          {dict.nav.skip}
        </a>
        <SiteHeader
          locale={locale}
          logo={<Logo id="header-logo" className="h-auto w-full drop-shadow-[0_10px_18px_rgba(16,17,42,.35)]" />}
          homeHref={home}
          languageLabel={dict.nav.language}
          phoneHref={links.tel}
          phoneDisplay={site.phoneDisplay}
        />
        <main id="icerik">{children}</main>
        <SiteFooter locale={locale} dict={dict} />
        <MobileActionBar locale={locale} dict={dict} />
      </body>
    </html>
  );
}
