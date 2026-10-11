import { Phone, Users } from "lucide-react";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { Photo, buttonStyles } from "@/components/ui";
import { photos } from "@/content/photos";
import { links } from "@/content/site";
import type { Dictionary } from "@/i18n/dictionaries";

export function Trays({ dict }: { dict: Dictionary }) {
  return (
    <section id="tepsi" className="grain bg-krem-100 py-24 md:py-32">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,var(--color-karamel-300),var(--color-serbet-400)_45%,var(--color-karamel-500))] text-lacivert-950 shadow-[0_50px_100px_-50px_rgba(111,68,30,.8)] lg:grid lg:grid-cols-[1.15fr_1fr]">
          <svg
            aria-hidden="true"
            viewBox="0 0 400 400"
            className="absolute -start-24 -top-24 -z-10 size-[26rem] text-lacivert-900/10"
          >
            {[190, 160, 130, 100].map((r) => (
              <circle
                key={r}
                cx="200"
                cy="200"
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={r === 160 ? "4 10" : undefined}
              />
            ))}
          </svg>

          <div className="relative p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-lacivert-900/70">{dict.trays.eyebrow}</p>
            <h2 className="font-display mt-5 text-balance text-[clamp(2.25rem,4.6vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.015em]">
              {dict.trays.title}
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-lacivert-950/80">{dict.trays.lead}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-lacivert-950/10 px-4 py-2 text-sm font-bold">
              <Users className="size-4" aria-hidden="true" />
              {dict.trays.note}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={links.whatsapp(dict.actions.trayText)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles.navy}
              >
                <WhatsAppIcon className="size-5" />
                {dict.actions.whatsapp}
              </a>
              <a href={links.tel} className={`${buttonStyles.ghostLight} bg-krem-50/40 ring-lacivert-900/25`}>
                <Phone className="size-[18px]" aria-hidden="true" />
                {dict.actions.call}
              </a>
            </div>
          </div>

          <div className="relative min-h-80 lg:min-h-full">
            <Photo
              src={photos.kunefe2 ?? photos.hero}
              alt=""
              sizes="(min-width: 1024px) 36rem, 100vw"
              className="lg:[mask-image:linear-gradient(to_right,transparent,black_30%)] rtl:lg:[mask-image:linear-gradient(to_left,transparent,black_30%)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
