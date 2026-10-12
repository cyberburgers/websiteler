import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Logo } from "@/components/Logo";
import { PrintButton } from "@/components/menu/PrintButton";
import { site } from "@/content/site";
import { isLocale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Masa QR kodu",
  robots: { index: false, follow: false },
};

/**
 * Masalara konacak QR kartı (/tr/qr). Yazdırıp kesmeniz yeterli.
 * QR sitenin ana adresine gider; ana sayfa menünün kendisidir. Ziyaretçi Türkçe menüye düşer, dili oradan değiştirebilir.
 */
export default async function QrPage({ params }: PageProps<"/[locale]/qr">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const menuUrl = new URL("/", site.url).toString();
  const svg = await QRCode.toString(menuUrl, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#23264a", light: "#00000000" },
  });

  return (
    <section className="bg-lacivert-900 pb-24 pt-36 md:pt-44 print:bg-white print:p-0">
      <div className="container-page flex flex-col items-center gap-8">
        <div className="print-hidden flex flex-col items-center gap-3 text-center text-krem-100">
          <h1 className="font-display text-4xl text-krem-50">Masa QR kartı</h1>
          <p className="max-w-md text-krem-100/70">
            Bu kartı yazdırıp masalara koyun. Müşteriler telefonla okutunca menü açılır.
          </p>
          <PrintButton label="Kartı yazdır" />
        </div>

        <article className="w-[90mm] rounded-[6mm] bg-krem-50 p-[8mm] text-center text-lacivert-800 shadow-2xl ring-1 ring-karamel-300/60 print:shadow-none">
          <Logo id="qr-logo" className="mx-auto w-[42mm]" />
          <p className="font-display mt-[4mm] text-[6mm] leading-tight">Menüyü görmek için okutun</p>
          <p className="mt-[1mm] text-[3.2mm] text-lacivert-800/70">Scan for the menu</p>
          <div
            className="mx-auto mt-[5mm] w-[48mm] [&>svg]:h-auto [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <p className="mt-[4mm] text-[3mm] font-semibold tracking-wide text-karamel-700">
            {menuUrl.replace(/^https?:\/\//, "")}
          </p>
        </article>
      </div>
    </section>
  );
}
