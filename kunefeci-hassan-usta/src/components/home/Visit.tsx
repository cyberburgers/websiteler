import { Clock, ExternalLink, MapPin, Navigation, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/BrandIcons";
import { MapEmbed } from "@/components/MapEmbed";
import { HoursList, OpenStatus } from "@/components/OpenStatus";
import { SectionHeading, buttonStyles } from "@/components/ui";
import { links, site } from "@/content/site";
import type { Dictionary } from "@/i18n/dictionaries";

function Label({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.2em] text-sari-300">
      <Icon className="size-4" aria-hidden="true" />
      {children}
    </h3>
  );
}

export function Visit({ dict }: { dict: Dictionary }) {
  const contactLink =
    "flex items-center gap-3 rounded-2xl bg-krem-50/[0.05] px-4 py-3.5 ring-1 ring-krem-50/10 transition hover:bg-krem-50/10";

  return (
    <section
      id="ziyaret"
      className="pattern-star relative overflow-hidden bg-lacivert-900 py-24 text-krem-100 md:py-32"
    >
      <div aria-hidden="true" className="scallop absolute inset-x-0 -top-px rotate-180" />
      <div className="container-page grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow={dict.visit.eyebrow} title={dict.visit.title} tone="dark" />
          <div className="mt-7">
            <OpenStatus labels={dict.status} />
          </div>

          <div className="mt-12 space-y-10">
            <div>
              <Label icon={MapPin}>{dict.visit.address}</Label>
              <address className="mt-4 text-lg not-italic leading-relaxed text-krem-50">
                {site.address.street}
                <br />
                {site.address.district} / {site.address.city}
              </address>
              <a
                href={links.directions}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonStyles.primary} mt-6 py-3.5`}
              >
                <Navigation className="size-[18px]" aria-hidden="true" />
                {dict.actions.directions}
              </a>
            </div>

            <div>
              <Label icon={Clock}>{dict.visit.hours}</Label>
              <div className="mt-3 max-w-md">
                <HoursList days={dict.days} labels={dict.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <MapEmbed
            src={links.mapEmbed}
            title={dict.visit.mapFrameTitle}
            loadLabel={dict.visit.mapLoad}
            note={dict.visit.mapNote}
          />
          <a
            href={links.mapsSearch}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-krem-100/70 underline-offset-4 hover:text-krem-50 hover:underline"
          >
            {dict.actions.openInMaps}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>

          <div>
            <Label icon={Phone}>{dict.visit.contact}</Label>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <a href={links.tel} className={contactLink}>
                <Phone className="size-5 text-karamel-300" aria-hidden="true" />
                <span dir="ltr" className="text-sm font-semibold">
                  {site.phoneDisplay}
                </span>
              </a>
              <a
                href={links.whatsapp(dict.actions.whatsappText)}
                target="_blank"
                rel="noopener noreferrer"
                className={contactLink}
              >
                <WhatsAppIcon className="size-5 text-karamel-300" />
                <span className="text-sm font-semibold">{dict.actions.whatsapp}</span>
              </a>
              <a href={links.instagram} target="_blank" rel="noopener noreferrer" className={contactLink}>
                <InstagramIcon className="size-5 text-karamel-300" />
                <span className="truncate text-sm font-semibold" dir="ltr">
                  @{site.instagram}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
