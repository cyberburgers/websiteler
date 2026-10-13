import type { Metadata, Viewport } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Yönetim · Künefeci Hassan Usta", template: "%s · Yönetim" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0f2817",
};

/** The panel has its own page shell: no menu header or footer, dark and calm, in the shop's colours. */
export default function AdminLayout({ children }: LayoutProps<"/yonetim">) {
  return (
    <html lang="tr" className={`panel ${fontVariables} antialiased`}>
      <body className="min-h-dvh text-krem-50">{children}</body>
    </html>
  );
}
