import { SectionHeading } from "@/components/ui";
import type { Dictionary } from "@/i18n/dictionaries";

export function Process({ dict }: { dict: Dictionary }) {
  return (
    <section className="pattern-star relative overflow-hidden bg-lacivert-900 py-24 text-krem-100 md:py-32">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-0 size-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-serbet-500/10 blur-[140px]"
      />
      <div className="container-page relative">
        <SectionHeading eyebrow={dict.process.eyebrow} title={dict.process.title} tone="dark" align="center" />
        <ol className="relative mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {dict.process.steps.map((step, i) => (
            <li
              key={step.title}
              className="reveal group relative overflow-hidden rounded-[2rem] bg-krem-50/[0.04] p-6 ring-1 sm:p-8 ring-krem-50/10 transition-colors hover:bg-krem-50/[0.07]"
            >
              <span
                aria-hidden="true"
                className="absolute -end-6 -top-6 size-28 rounded-full border border-dashed border-sari-300/20 transition-transform duration-700 group-hover:rotate-45"
              />
              <span
                className="font-brand float-start me-4 block text-5xl leading-none text-sari-300 sm:float-none sm:me-0 sm:text-6xl"
                dir="ltr"
              >
                {i + 1}
              </span>
              <h3 className="font-display mt-1 text-2xl font-medium text-krem-50 sm:mt-6">{step.title}</h3>
              <p className="clear-both mt-3 leading-relaxed text-krem-100/70 sm:clear-none">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
