import { Quote } from "lucide-react";
import { Photo, SectionHeading } from "@/components/ui";
import { site } from "@/content/site";
import type { Dictionary } from "@/i18n/dictionaries";

export function Story({ dict }: { dict: Dictionary }) {
  return (
    <section id="hikaye" className="relative overflow-hidden bg-krem-50 py-24 md:py-32">
      <div className="container-page grid items-center gap-20 lg:grid-cols-2 lg:gap-16">
        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          <div className="relative aspect-[4/5] w-[84%] overflow-hidden rounded-[2.5rem] rounded-se-[9rem] shadow-[0_40px_80px_-40px_rgba(35,38,74,.6)]">
            <Photo photo="yapim" alt={dict.story.imageAlt} sizes="(min-width: 1024px) 30rem, 80vw" />
          </div>
          <div className="absolute -bottom-8 end-0 aspect-square w-[46%] overflow-hidden rounded-full shadow-2xl ring-[10px] ring-krem-50">
            <Photo photo="fistik" alt="" sizes="(min-width: 1024px) 16rem, 40vw" />
          </div>
          <div className="absolute -start-3 top-10 grid size-28 -rotate-12 place-items-center rounded-full bg-lacivert-800 text-center shadow-xl ring-4 ring-krem-50 sm:size-32">
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
    </section>
  );
}
