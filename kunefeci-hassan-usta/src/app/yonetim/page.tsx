import { headers } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { Suspense } from "react";
import { AdminApp } from "@/components/admin/AdminApp";
import { isAdmin, staffKey } from "@/lib/admin/auth";
import { callsEnabled } from "@/lib/calls/store";
import { readContentFresh } from "@/lib/content";
import { storeIsWritable } from "@/lib/content/store";

export default function AdminPage() {
  return (
    <Suspense
      fallback={<p className="grid min-h-dvh place-items-center text-sm font-bold text-zumrut-900/60">Yükleniyor…</p>}
    >
      <Panel />
    </Suspense>
  );
}

async function Panel() {
  if (!(await isAdmin())) redirect("/yonetim/giris");
  // Read straight from the store, not the site's cache, so the panel always edits the latest version.
  const content = await readContentFresh();
  return <AdminApp initial={content} writable={storeIsWritable()} staff={await staffSetup()} />;
}

/** The waiter screen's address on this very site, and a QR code so the tablet can open it with its camera. */
async function staffSetup() {
  const key = staffKey();
  if (!key) return null;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const url = `${proto}://${host}/garson?k=${key}`;
  const qrSvg = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#142319", light: "#00000000" },
  });
  return { url, qrSvg, enabled: callsEnabled() };
}
