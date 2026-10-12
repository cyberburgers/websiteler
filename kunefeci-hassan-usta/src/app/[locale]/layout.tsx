import type { Metadata, Viewport } from "next";
import { Berkshire_Swash, Fraunces, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Splash } from "@/components/Splash";
import { links, site } from "@/content/site";
import { isLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import "../globals.css";
import "../splash-logo.css";

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
  themeColor: "#0b3d28",
  colorScheme: "light",
  viewportFit: "cover",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const home = localePath(locale);

  return (
    <html
      lang={locale}
      className={`${berkshire.variable} ${fraunces.variable} ${manrope.variable} antialiased`}
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
          locale={locale}
          logo={<Logo id="header-logo" className="h-auto w-full drop-shadow-[0_8px_14px_rgba(6,45,29,.45)]" />}
          homeHref={home}
          searchHref={localePath(locale, "/ara")}
          labels={{ search: dict.search.title, back: dict.category.back, language: dict.nav.language }}
          phoneHref={links.tel}
          phoneDisplay={site.phoneDisplay}
        />
        <main id="icerik">{children}</main>
        <SiteFooter locale={locale} dict={dict} />
      </body>
    </html>
  );
}
