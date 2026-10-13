import "server-only";
import { headers } from "next/headers";
import QRCode from "qrcode";
import type { StaffSetup } from "@/components/admin/StaffEditor";
import { callsEnabled } from "@/lib/calls/store";
import { replaceStaffKey, staffKey } from "./auth";

/**
 * The waiter screen's address on this very site, and a QR code so the tablet can open it with its camera.
 * Without a key (Vercel before Redis is connected) the panel says what is missing instead.
 */
export async function staffSetup({ renew = false } = {}): Promise<StaffSetup> {
  const key = renew ? await replaceStaffKey() : await staffKey();
  if (!key) return { key: "", url: "", qrSvg: "", enabled: false };
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
  return { key, url, qrSvg, enabled: callsEnabled() };
}
