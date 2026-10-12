import type { ReactNode } from "react";

/** Dark green title band at the top of inner pages, so the transparent header always sits on the theme colour. */
export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="pattern-star relative isolate overflow-hidden bg-zumrut-900 pb-20 pt-36 text-krem-100 md:pb-24 md:pt-48">
      <div
        aria-hidden="true"
        className="absolute -end-32 -top-24 -z-10 size-[36rem] rounded-full bg-serbet-500/20 blur-[120px]"
      />
      <div className="container-page">
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.24em] text-fistik-300">
          <span aria-hidden="true" className="h-px w-10 bg-fistik-300/60" />
          {eyebrow}
        </p>
        <h1 className="font-display mt-5 max-w-4xl text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.025em] text-krem-50">
          <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
            <span className="animate-line-up block [animation-delay:100ms]">{title}</span>
          </span>
        </h1>
        {children}
      </div>
    </section>
  );
}
