import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import QRCode from "qrcode";
import { Logo } from "@/components/Logo";
import { PrintButton } from "@/components/menu/PrintButton";
import { site } from "@/content/site";
import { getContent } from "@/lib/content";
import { isLocale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Masa QR kartları",
  robots: { index: false, follow: false },
};

/** "7" → [7], "1-12" → [1 … 12]. At most 60 cards at once; anything else gives one card without a number. */
function parseTables(value: string | string[] | undefined): (number | null)[] {
  const text = (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  const range = /^(\d{1,3})\s*-\s*(\d{1,3})$/.exec(text);
  if (range) {
    const [from, to] = [Number(range[1]), Number(range[2])].sort((a, b) => a - b);
    return Array.from({ length: Math.min(to - from + 1, 60) }, (_, i) => from + i);
  }
  return /^\d{1,3}$/.test(text) ? [Number(text)] : [null];
}

async function TableCard({ table }: { table: number | null }) {
  const { info } = await getContent();
  const url = new URL(table ? `/?masa=${table}` : "/", site.url).toString();
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#2c4436", light: "#00000000" },
  });
  return (
    <article className="relative flex h-[128mm] w-[90mm] break-inside-avoid flex-col items-center overflow-hidden rounded-[6mm] bg-zumrut-900 px-[8mm] pb-[6mm] pt-[8mm] text-krem-100 shadow-2xl [print-color-adjust:exact] print:shadow-none">
      <div aria-hidden="true" className="absolute inset-[3mm] rounded-[5mm] border border-fistik-300/35" />
      <Logo id={`qr-logo-${table ?? "genel"}`} className="relative w-[36mm]" />
      <p className="font-display relative mt-[3mm] text-[6.4mm] font-medium italic leading-tight text-krem-50">
        Menü için okutun
      </p>
      <p className="relative mt-[1mm] text-[3mm] text-krem-100/70">Scan for the menu</p>
      <div className="relative mt-[4mm] rounded-[5mm] bg-krem-100 p-[3.5mm]">
        <div className="w-[40mm] [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
      <div className="relative mt-[4mm] flex items-center gap-[2.5mm]">
        {table && (
          <span className="rounded-full bg-fistik-300 px-[4mm] py-[1.6mm] text-[4mm] font-extrabold text-zumrut-900">
            Masa {table}
          </span>
        )}
        <span className="text-[3mm] text-krem-100/70">Türkçe · English</span>
      </div>
      <p className="relative mt-auto text-[2.7mm] tracking-[0.08em] text-krem-100/60">
        @{info.instagram} · {info.address.district}, {info.address.city}
      </p>
    </article>
  );
}

async function Cards({ searchParams }: { searchParams: PageProps<"/[locale]/qr">["searchParams"] }) {
  const tables = parseTables((await searchParams).masa);
  return <CardGrid tables={tables} />;
}

function CardGrid({ tables }: { tables: (number | null)[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-6 print:gap-[5mm]">
      {tables.map((table) => (
        <TableCard key={table ?? "genel"} table={table} />
      ))}
    </div>
  );
}

/**
 * Masalara konacak QR kartları (/tr/qr). Yazdırıp kesmeniz yeterli.
 * /tr/qr?masa=7 tek kart, /tr/qr?masa=1-12 on iki kart basar. Kart okutulunca menü açılır ve
 * müşterinin ekranında masa numarası görünür ("Garsona göster" ekranında da).
 */
export default async function QrPage({ params, searchParams }: PageProps<"/[locale]/qr">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <section className="pb-24 pt-24 md:pt-32 print:p-0">
      <div className="container-page flex flex-col items-center gap-10 print:px-0">
        <div className="print-hidden flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="font-display text-4xl text-krem-50">Masa QR kartları</h1>
          <p className="text-krem-100/70">
            Masa numarasını yazın, kartları yazdırıp masalara koyun. Birden fazla masa için aralık yazın, ör. 1-12.
          </p>
          <form className="flex w-full gap-2">
            <label className="flex-1">
              <span className="sr-only">Masa numarası</span>
              <input
                name="masa"
                inputMode="numeric"
                placeholder="7 ya da 1-12"
                className="h-12 w-full rounded-full bg-krem-50/10 px-5 text-krem-50 outline-none ring-1 ring-krem-50/15 placeholder:text-krem-100/45 focus:ring-2 focus:ring-karamel-400"
              />
            </label>
            <button type="submit" className="h-12 rounded-full bg-fistik-300 px-5 text-sm font-extrabold text-zumrut-900">
              Kartları oluştur
            </button>
          </form>
          <PrintButton label="Yazdır" />
        </div>

        <Suspense fallback={<CardGrid tables={[null]} />}>
          <Cards searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
