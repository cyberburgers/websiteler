import { MapPin, Navigation, Phone } from "lucide-react";
import { OpenStatus } from "@/components/OpenStatus";
import { Photo, buttonStyles } from "@/components/ui";
import { links, site } from "@/content/site";
import type { Dictionary } from "@/i18n/dictionaries";

/** The shop itself, after the menu: its photo, whether it's open, where it is, and how to get there. */
export function ShopCard({ dict }: { dict: Dictionary }) {
  return (
    <section id="dukkan" className="print-hidden bg-krem-100 pb-24 md:pb-32">
      <div className="container-page">
        <div className="reveal grid overflow-hidden rounded-[2rem] bg-lacivert-900 text-krem-100 shadow-[0_40px_80px_-40px_rgba(35,38,74,.6)] md:grid-cols-[minmax(0,26rem)_1fr]">
          <div className="relative aspect-[4/5] bg-lacivert-800">
            <Photo photo="dukkan" alt={dict.visit.imageAlt} sizes="(min-width: 768px) 26rem, 92vw" />
          </div>
          <div className="pattern-star flex flex-col justify-center gap-6 p-7 sm:p-10 md:p-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sari-300">{dict.visit.eyebrow}</p>
              <h2 className="font-display mt-3 text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.05] text-krem-50">
                {dict.visit.title}
              </h2>
            </div>
            <div>
              <OpenStatus labels={dict.status} />
            </div>
            <a
              href={links.mapsSearch}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 text-[17px] leading-relaxed text-krem-100/85 hover:text-krem-50"
            >
              <MapPin className="mt-1 size-5 shrink-0 text-karamel-300" aria-hidden="true" />
              <span>
                {site.address.street}
                <br />
                {site.address.district} / {site.address.city}
              </span>
            </a>
            <div className="flex flex-wrap gap-3">
              <a href={links.directions} target="_blank" rel="noopener noreferrer" className={buttonStyles.primary}>
                <Navigation className="size-[18px]" aria-hidden="true" />
                {dict.actions.directions}
              </a>
              <a href={links.tel} className={buttonStyles.ghostDark}>
                <Phone className="size-[18px]" aria-hidden="true" />
                {dict.actions.call}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
