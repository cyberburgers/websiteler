import Link from "next/link";
import { ArrowRight, MapPin, Navigation } from "lucide-react";
import { OpenStatus } from "@/components/OpenStatus";
import { Photo, buttonStyles } from "@/components/ui";
import { menu, tags } from "@/content/menu";
import { links, site } from "@/content/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatPrice } from "@/lib/format";

/** Rotating brand text around the hero photo, like the rim of the round sign. */
function RingText({ text }: { text: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className="absolute inset-0 size-full animate-spin-slow">
      <defs>
        <path id="hero-ring" d="M100,100 m-90,0 a90,90 0 1,1 180,0 a90,90 0 1,1 -180,0" />
      </defs>
      <text
        fill="currentColor"
        fontSize="8.4"
        fontWeight="700"
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        <textPath href="#hero-ring" textLength="563" lengthAdjust="spacing">
          {text}
        </textPath>
      </text>
    </svg>
  );
}

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const signature = menu.flatMap((c) => c.items).find((i) => i.tags?.includes("imza"));

  return (
    <section className="relative isolate overflow-hidden bg-lacivert-900 text-krem-100">
      <div aria-hidden="true" className="pattern-star absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute -end-40 top-0 -z-10 size-[44rem] rounded-full bg-serbet-500/25 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-72 -start-40 -z-10 size-[40rem] rounded-full bg-lacivert-600/50 blur-[120px]"
      />

      <div className="container-page grid items-center gap-16 pb-28 pt-40 md:pt-48 lg:min-h-[min(100svh,1000px)] lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-32 lg:pt-36">
        <div className="relative z-10">
          <p className="animate-rise flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.24em] text-sari-300">
            <span aria-hidden="true" className="h-px w-10 bg-sari-300/60" />
            {dict.hero.eyebrow}
          </p>
          <h1 className="font-display mt-7 text-[clamp(3rem,7.4vw,6.4rem)] font-medium leading-[0.96] tracking-[-0.025em] text-krem-50">
            <span className="animate-rise block [animation-delay:90ms]">{dict.hero.titleA}</span>
            <span className="animate-rise block italic text-karamel-300 [animation-delay:180ms]">
              {dict.hero.titleB}
            </span>
            <span className="animate-rise block [animation-delay:270ms]">{dict.hero.titleC}</span>
          </h1>
          <p className="animate-rise mt-8 max-w-xl text-lg leading-relaxed text-krem-100/75 [animation-delay:360ms] md:text-xl">
            {dict.hero.lead}
          </p>
          <div className="animate-rise mt-10 flex flex-wrap gap-3 [animation-delay:450ms]">
            <Link href={localePath(locale, "/menu")} className={buttonStyles.primary}>
              {dict.actions.seeMenu}
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <a href={links.directions} target="_blank" rel="noopener noreferrer" className={buttonStyles.ghostDark}>
              <Navigation className="size-[18px]" aria-hidden="true" />
              {dict.actions.directions}
            </a>
          </div>
          <div className="animate-rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-krem-100/70 [animation-delay:540ms]">
            <OpenStatus labels={dict.status} />
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-karamel-300" aria-hidden="true" />
              {site.address.district}, {site.address.city}
            </span>
          </div>
        </div>

        <div className="animate-rise relative mx-auto w-full max-w-[33rem] [animation-delay:200ms] lg:max-w-[38rem]">
          <div className="relative aspect-square text-sari-300/70">
            <RingText text={dict.hero.ring} />
            <div className="absolute inset-[10%] rounded-full bg-gradient-to-b from-karamel-300 to-karamel-700 p-[3.2%] shadow-[0_50px_90px_-30px_rgba(0,0,0,.75)]">
              <div className="relative size-full overflow-hidden rounded-full ring-2 ring-lacivert-900/40">
                <Photo photo="hero" alt={dict.hero.imageAlt} sizes="(min-width: 1024px) 34rem, 80vw" preload fill />
              </div>
            </div>
            <svg
              viewBox="0 0 120 100"
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[12%] h-[30%] w-[36%] -translate-x-1/2 blur-[1.5px]"
            >
              {[
                ["M34 96C24 76 44 66 34 46C26 30 40 18 36 4", "0s"],
                ["M60 96C50 74 70 62 60 42C52 26 66 14 62 2", "1.2s"],
                ["M86 96C76 78 96 66 86 48C78 32 92 20 88 6", "2.4s"],
              ].map(([d, delay]) => (
                <path
                  key={delay}
                  d={d}
                  className="animate-steam opacity-0"
                  style={{ animationDelay: delay }}
                  stroke="#fffdf6"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
            </svg>

            <div className="absolute -end-1 top-[7%] grid size-24 rotate-12 place-items-center rounded-full bg-fistik-500 p-3 text-center text-[11px] font-extrabold uppercase leading-tight tracking-wider text-krem-50 shadow-xl ring-4 ring-lacivert-900 sm:size-28 sm:text-xs">
              {dict.hero.sticker}
            </div>

            {signature && (
              <Link
                href={`${localePath(locale, "/menu")}#${signature.id}`}
                className="group absolute bottom-[4%] start-0 flex items-center gap-4 rounded-3xl bg-krem-50 py-3 pe-5 ps-3 text-lacivert-900 shadow-[0_24px_50px_-18px_rgba(0,0,0,.6)] transition hover:-translate-y-1 sm:start-[-4%]"
              >
                <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl">
                  <Photo photo="hero" alt="" sizes="56px" fill />
                </span>
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-karamel-600">
                    {tags.imza[locale]}
                  </span>
                  <span className="font-display block text-lg leading-tight">{signature.name[locale]}</span>
                </span>
                <span className="ms-2 rounded-full bg-lacivert-800 px-3 py-1.5 text-sm font-bold text-sari-300">
                  {formatPrice(signature.prices[0].amount, locale)}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="scallop absolute inset-x-0 -bottom-px" />
    </section>
  );
}
