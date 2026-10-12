import Link from "next/link";
import { MapPin, Navigation, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "./BrandIcons";
import { links, site } from "@/content/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { groupedHours } from "@/lib/hours";

async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

const action =
  "flex h-12 items-center justify-center gap-2 rounded-2xl text-[13px] font-bold transition-colors sm:text-sm";

/** Directions, call, Instagram and WhatsApp, then the address and hours in two short lines. */
export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="print-hidden border-t border-krem-50/10 bg-zumrut-925 text-krem-100">
      <div className="container-page max-w-6xl pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6 md:pt-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <a
            href={links.directions}
            target="_blank"
            rel="noopener noreferrer"
            className={`${action} bg-fistik-300 font-extrabold text-zumrut-925 hover:bg-fistik-200`}
          >
            <Navigation className="size-4" aria-hidden="true" />
            {dict.actions.directions}
          </a>
          <a href={links.tel} className={`${action} bg-krem-50/[0.08] hover:bg-krem-50/[0.14]`}>
            <Phone className="size-4" aria-hidden="true" />
            {dict.actions.call}
          </a>
          <a
            href={links.whatsapp(dict.actions.whatsappText)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${action} bg-krem-50/[0.08] hover:bg-krem-50/[0.14]`}
          >
            <WhatsAppIcon className="size-4" />
            {dict.actions.whatsapp}
          </a>
          <a
            href={links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={`${action} bg-krem-50/[0.08] hover:bg-krem-50/[0.14]`}
          >
            <InstagramIcon className="size-4" />
            {dict.home.instagram}
          </a>
        </div>

        <div className="mt-5 space-y-1.5 text-[13px] leading-relaxed text-krem-100/60">
          <a href={links.mapsSearch} target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-krem-50">
            <MapPin className="mt-0.5 size-4 shrink-0 text-karamel-300" aria-hidden="true" />
            <span>
              {site.address.street}, {site.address.district} / {site.address.city}
            </span>
          </a>
          <p className="ps-6">
            {groupedHours(dict.days, dict.status.dayOff)
              .map((g) => `${g.days} ${g.hours}`)
              .join(" · ")}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-krem-50/10 pt-4 text-xs text-krem-100/45">
          <span>
            © <CopyrightYear /> {site.name}
          </span>
          <span>{dict.footer.photoNote}</span>
          <Link
            href={localePath(locale, "/gizlilik")}
            className="-my-2 inline-block py-2 underline-offset-4 hover:text-krem-50 hover:underline"
          >
            {dict.footer.privacy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
