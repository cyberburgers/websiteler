import type { Metadata, Viewport } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Garson ekranı · Künefeci Hassan Usta",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#142319" };

/** The counter tablet's screen has its own page shell: no menu header or footer. */
export default function StaffLayout({ children }: LayoutProps<"/garson">) {
  return (
    <html lang="tr" className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh bg-zumrut-950 text-krem-50">{children}</body>
    </html>
  );
}
