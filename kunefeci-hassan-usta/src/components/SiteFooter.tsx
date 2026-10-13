import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { InstagramIcon } from "./BrandIcons";
import { linksFor, site, type ShopInfo } from "@/content/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { groupedHours } from "@/lib/hours";

async function CopyrightYear() {
  "use cache";
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
