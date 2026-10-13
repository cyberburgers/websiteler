import Link from "next/link";
import { cacheLife } from "next/cache";
import { Clock, MapPin, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "./BrandIcons";
import { linksFor, site, type ShopInfo } from "@/content/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { groupedHours } from "@/lib/hours";

/** Who made the site, and how to reach them for one of your own. */
const MAKER = { name: "Aslan Site", phone: "0543 863 45 80", tel: "+905438634580", whatsapp: "905438634580" };

async function CopyrightYear() {
  "use cache";
  // Once a day is plenty for the year; the default (15 minutes) would rebuild every menu page that often.
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

/**
 * The guest is already at the table, so no call or directions buttons: just Instagram to follow
 * the shop, and the address and hours as a quiet note.
 */
export function SiteFooter({ locale, dict, info }: { locale: Locale; dict: Dictionary; info: ShopInfo }) {
  return (
    <footer className="print-hidden border-t border-krem-50/10 bg-zumrut-925 text-krem-100">
      <div className="container-page max-w-6xl pb-[calc(2rem+env(safe-area-inset-bottom))] pt-7 md:pt-9">
        <a
          href={linksFor(info).instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3.5 rounded-2xl bg-krem-50/[0.06] p-3 pe-4 ring-1 ring-inset ring-krem-50/[0.08] transition-colors hover:bg-krem-50/[0.1] sm:max-w-sm"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-fistik-300 text-zumrut-925">
            <InstagramIcon className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-extrabold text-krem-50">{dict.footer.follow}</span>
            <span className="block truncate text-[13px] text-krem-100/60">@{info.instagram}</span>
          </span>
        </a>

        <div className="mt-5 space-y-2 text-[13px] leading-relaxed text-krem-100/60">
          <p className="flex gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-karamel-300" aria-hidden="true" />
            <span>
              {[info.address.street, [info.address.district, info.address.city].filter(Boolean).join(" / ")]
                .filter(Boolean)
                .join(", ")}
            </span>
          </p>
          <p className="flex gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-karamel-300" aria-hidden="true" />
            <span>
              {groupedHours(info.hours, dict.days, dict.status.dayOff)
                .map((g) => `${g.days} ${g.hours}`)
                .join(" · ")}
            </span>
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-krem-50/10 pt-4 text-xs text-krem-100/45">
          <span>
            © <CopyrightYear /> {site.name}
          </span>
          <Link
            href={localePath(locale, "/gizlilik")}
            className="-my-2 inline-block py-2 underline-offset-4 hover:text-krem-50 hover:underline"
          >
            {dict.footer.privacy}
          </Link>
        </div>

        {/* The maker's card: last on the page, after the shop's own details. */}
        <div
          data-yapan=""
          className="mt-6 rounded-2xl bg-karamel-300/[0.08] p-4 ring-1 ring-inset ring-karamel-300/30 sm:max-w-md"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-karamel-300">{MAKER.name}</p>
          <p className="mt-1 text-[15px] font-bold leading-snug text-krem-50">{dict.footer.makerTitle}</p>
          <p className="mt-0.5 text-[13px] leading-snug text-krem-100/70">{dict.footer.makerAsk}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`tel:${MAKER.tel}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-karamel-300 pe-4 ps-3.5 text-sm font-extrabold tabular-nums text-zumrut-950 transition hover:bg-krem-300 active:scale-[.97]"
            >
              <Phone className="size-4" aria-hidden="true" />
              {MAKER.phone}
            </a>
            <a
              href={`https://wa.me/${MAKER.whatsapp}?text=${encodeURIComponent(dict.footer.makerMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-krem-50/[0.06] pe-4 ps-3.5 text-sm font-bold text-krem-50 ring-1 ring-inset ring-krem-50/15 transition hover:bg-krem-50/[0.1] active:scale-[.97]"
            >
              <WhatsAppIcon className="size-4" />
              {dict.footer.makerWhatsApp}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
