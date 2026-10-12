import Link from "next/link";
import { BookOpen, Navigation, Phone } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";
import { links } from "@/content/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/** Telefonda ekranın altında sabit duran hızlı eylem çubuğu. */
export function MobileActionBar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const item =
    "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-semibold tracking-wide transition active:scale-95";

  return (
    <nav
      aria-label={dict.nav.primary}
      className="print-hidden animate-bar-in fixed inset-x-3 bottom-3 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex gap-1 rounded-[1.4rem] bg-lacivert-900/95 p-1.5 text-krem-100 shadow-[0_18px_40px_-12px_rgba(16,17,42,.6)] ring-1 ring-krem-50/10 backdrop-blur-lg">
        <Link href={`${localePath(locale)}#icerik`} className={`${item} bg-sari-300 text-lacivert-900`}>
          <BookOpen className="size-5" aria-hidden="true" />
          {dict.nav.menu}
        </Link>
        <a href={links.tel} className={`${item} hover:bg-krem-50/10`}>
          <Phone className="size-5" aria-hidden="true" />
          {dict.actions.call}
        </a>
        <a href={links.directions} target="_blank" rel="noopener noreferrer" className={`${item} hover:bg-krem-50/10`}>
          <Navigation className="size-5" aria-hidden="true" />
          {dict.actions.directions}
        </a>
        <a
          href={links.whatsapp(dict.actions.whatsappText)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${item} hover:bg-krem-50/10`}
        >
          <WhatsAppIcon className="size-5" />
          {dict.actions.whatsapp}
        </a>
      </div>
    </nav>
  );
}
