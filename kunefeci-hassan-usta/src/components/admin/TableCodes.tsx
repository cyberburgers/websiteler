"use client";

import { Download, ExternalLink } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { buttonClass } from "./fields";

/** The address on table n's card. The same one for good: it only changes if the site's address does. */
const tableUrl = (siteUrl: string, table: number) => new URL(`/?masa=${table}`, siteUrl).toString();

/**
 * Every table's QR code, kept here in the panel: a card that goes missing can be printed again
 * at any time, and it is exactly the code the table had before.
 */
export function TableCodes({ siteUrl, count }: { siteUrl: string; count: number }) {
  const [codes, setCodes] = useState<string[]>([]);

  useEffect(() => {
    let stale = false;
    const tables = Array.from({ length: count }, (_, i) => i + 1);
    void Promise.all(
      tables.map((n) =>
        QRCode.toString(tableUrl(siteUrl, n), {
          type: "svg",
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#0f2817", light: "#ffffff" },
        }),
      ),
    ).then((svgs) => {
      if (!stale) setCodes(svgs);
    });
    return () => {
      stale = true;
    };
  }, [siteUrl, count]);

  /** A large picture of one code, for a print shop or a sticker. */
  const download = async (table: number) => {
    const png = await QRCode.toDataURL(tableUrl(siteUrl, table), { width: 1200, margin: 2, errorCorrectionLevel: "M" });
    const link = document.createElement("a");
    link.href = png;
    link.download = `masa-${table}-qr.png`;
    link.click();
  };

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {Array.from({ length: count }, (_, i) => i + 1).map((table) => (
          <li key={table} data-masa-kodu={table} className="rounded-2xl bg-zumrut-950/60 p-2.5 ring-1 ring-white/10">
            <p className="px-1 text-sm font-extrabold text-krem-50">Masa {table}</p>
            <div
              role="img"
              aria-label={`Masa ${table} karekodu`}
              className="mt-1.5 aspect-square overflow-hidden rounded-xl bg-white [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: codes[table - 1] ?? "" }}
            />
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => void download(table)}
                aria-label={`Masa ${table} karekodunu indir`}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg text-xs font-bold bg-white/5 text-krem-50 ring-1 ring-white/15 hover:bg-white/10"
              >
                <Download className="size-3.5" aria-hidden="true" /> İndir
              </button>
              <a
                href={`/tr/qr?masa=${table}`}
                target="_blank"
                rel="noopener"
                aria-label={`Masa ${table} kartını bastır`}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg text-xs font-bold bg-white/5 text-krem-50 ring-1 ring-white/15 hover:bg-white/10"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" /> Kart
              </a>
            </div>
          </li>
        ))}
      </ul>
      <a href={`/tr/qr?masa=1-${count}`} target="_blank" rel="noopener" className={buttonClass.quiet}>
        Bütün kartları bastır (1-{count}) <ExternalLink className="size-4" aria-hidden="true" />
      </a>
    </div>
  );
}
