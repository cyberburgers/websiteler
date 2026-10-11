import type { Metadata, Viewport } from "next";
import { Berkshire_Swash, Cairo, Fraunces, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { MobileActionBar } from "@/components/MobileActionBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { links, site } from "@/content/site";
import { isLocale, localeMeta, localePath, locales } from "@/i18n/config";
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
  axes: ["SOFT"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  preload: false,
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
};

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const home = localePath(locale);

  const nav = [
    { href: localePath(locale, "/menu"), label: dict.nav.menu },
    { href: `${home}#hikaye`, label: dict.nav.story },
    { href: `${home}#tepsi`, label: dict.nav.trays },
    { href: `${home}#ziyaret`, label: dict.nav.visit },
  ];

  return (
    <html
      lang={locale}
      dir={localeMeta[locale].dir}
      className={`${berkshire.variable} ${fraunces.variable} ${manrope.variable} ${cairo.variable} antialiased`}
    >
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
          nav={nav}
          labels={{
            open: dict.nav.open,
            close: dict.nav.close,
            language: dict.nav.language,
            primary: dict.nav.primary,
            call: dict.actions.call,
            whatsapp: dict.actions.whatsapp,
          }}
          phoneHref={links.tel}
          phoneDisplay={site.phoneDisplay}
          whatsappHref={links.whatsapp(dict.actions.whatsappText)}
        />
        <main id="icerik">{children}</main>
        <SiteFooter locale={locale} dict={dict} />
        <MobileActionBar locale={locale} dict={dict} />
      </body>
    </html>
  );
}
