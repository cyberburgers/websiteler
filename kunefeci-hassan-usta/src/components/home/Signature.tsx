import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Photo, SectionHeading, hasPhoto } from "@/components/ui";
import { featuredItems, tags } from "@/content/menu";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatPrice } from "@/lib/format";

export function Signature({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = featuredItems().slice(0, 4);
  const menuHref = localePath(locale, "/menu");

  return (
    <section className="grain bg-krem-100 pb-24 pt-20 md:pb-32 md:pt-28">
      <div className="container-page">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow={dict.signature.eyebrow} title={dict.signature.title} />
          <div className="max-w-sm md:pb-2">
            <p className="text-[17px] leading-relaxed text-lacivert-800/70">{dict.signature.lead}</p>
            <Link
              href={menuHref}
              className="group mt-4 inline-flex items-center gap-2 font-bold text-karamel-700 underline-offset-[6px] hover:underline"
            >
              {dict.actions.fullMenu}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <ul className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {items.map((item, i) => {
            const tag = item.tags?.[0];
            const photo = hasPhoto(item.image);
            return (
              <li key={item.id} className="reveal w-[78%] shrink-0 snap-start sm:w-auto">
                <Link href={`${menuHref}#${item.id}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-krem-200 shadow-[0_30px_60px_-35px_rgba(35,38,74,.55)]">
                    <Photo
                      photo={item.image}
                      alt={item.name[locale]}
                      sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
                      className="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                    />
                    {photo && (
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-lacivert-950/75 to-transparent" />
                    )}
                    {tag && (
                      <span className="absolute start-4 top-4 rounded-full bg-krem-50/90 px-3 py-1.5 text-xs font-bold text-lacivert-900 backdrop-blur">
                        {tags[tag][locale]}
                      </span>
                    )}
                    <span
                      className={`font-brand absolute bottom-3 start-5 text-5xl ${photo ? "text-krem-50/85" : "text-karamel-500/70"}`}
                    >
                      0{i + 1}
                    </span>
                    <span className="absolute bottom-5 end-5 rounded-full bg-sari-300 px-4 py-2 text-[15px] font-extrabold text-lacivert-900 shadow-lg">
                      {formatPrice(item.prices[0].amount, locale)}
                    </span>
                  </div>
                  <h3 className="font-display mt-6 text-2xl font-medium text-lacivert-800 transition-colors group-hover:text-karamel-700">
                    {item.name[locale]}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-lacivert-800/65">
                    {item.description[locale]}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
