import { Droplet, Milk, Nut, Quote, Wheat } from "lucide-react";
import { Photo, SectionHeading } from "@/components/ui";
import { site } from "@/content/site";
import type { Dictionary } from "@/i18n/dictionaries";

const pillarIcons = [Wheat, Milk, Droplet, Nut];

export function Story({ dict }: { dict: Dictionary }) {
  return (
    <section id="hikaye" className="relative overflow-hidden bg-krem-50 py-24 md:py-32">
      <div className="container-page grid items-center gap-20 lg:grid-cols-2 lg:gap-16">
        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          {/* The shop's own photo: sign at the top, tray at the bottom, so nothing is laid over either. */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] rounded-se-[9rem] shadow-[0_40px_80px_-40px_rgba(35,38,74,.6)]">
            <Photo photo="yapim" alt={dict.story.imageAlt} sizes="(min-width: 1024px) 36rem, 92vw" />
          </div>
          <div className="absolute -start-3 top-[36%] grid size-24 -rotate-12 place-items-center rounded-full bg-lacivert-800 text-center shadow-xl ring-4 ring-krem-50 sm:size-28">
            <span className="font-brand text-xl leading-tight text-sari-300 sm:text-2xl">
              {site.foundingYear ?? "Urfa"}
            </span>
          </div>
        </div>

        <div>
          <SectionHeading eyebrow={dict.story.eyebrow} title={dict.story.title} />
          <p className="mt-8 text-lg leading-relaxed text-lacivert-800/80">{dict.story.p1}</p>
          <p className="mt-5 text-lg leading-relaxed text-lacivert-800/80">{dict.story.p2}</p>
          <figure className="mt-10 rounded-[2rem] bg-krem-200/60 p-7 ring-1 ring-karamel-300/40">
            <Quote className="size-8 text-karamel-400" aria-hidden="true" />
            <blockquote className="font-display mt-3 text-2xl italic leading-snug text-karamel-700 md:text-[1.7rem]">
              {dict.story.quote}
            </blockquote>
          </figure>
        </div>
      </div>

      <div className="container-page mt-28">
        <div aria-hidden="true" className="kadayif-rule opacity-50" />
        <h3 className="font-display mt-14 text-center text-3xl font-medium text-lacivert-800 md:text-4xl">
          {dict.story.pillarsTitle}
        </h3>
        <ul className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {dict.story.pillars.map((pillar, i) => {
            const Icon = pillarIcons[i] ?? Wheat;
            return (
              <li key={pillar.title} className="reveal text-center">
                <div className="mx-auto grid size-16 place-items-center sm:size-20 rounded-full bg-gradient-to-b from-krem-100 to-krem-200 text-karamel-600 ring-1 ring-karamel-300/60">
                  <Icon className="size-8" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h4 className="font-display mt-5 text-lg font-medium text-lacivert-800 sm:text-xl">{pillar.title}</h4>
                <p className="mx-auto mt-2 max-w-60 text-[15px] leading-relaxed text-lacivert-800/65">{pillar.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
