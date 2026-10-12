import { MapPin } from "lucide-react";
import { OpenStatus } from "@/components/OpenStatus";
import { Photo } from "@/components/ui";
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { PrintButton } from "@/components/menu/PrintButton";
import { allergenIcons } from "@/components/menu/icons";
import type { MenuViewCategory } from "@/components/menu/types";
import { DessertWheel, WheelTrigger } from "@/components/wheel/DessertWheel";
import { allergens, availableMenu, tags, type Allergen } from "@/content/menu";
import { site } from "@/content/site";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { foldForSearch, formatPrice } from "@/lib/format";
import { JsonLd, menuJsonLd } from "@/lib/structured-data";
import { wheelSlices } from "@/lib/wheel";

function buildView(locale: Locale): MenuViewCategory[] {
  return availableMenu().map((category) => ({
    id: category.id,
    name: category.name[locale],
    description: category.description?.[locale],
    layout: category.layout,
    items: category.items.map((item) => ({
      id: item.id,
      name: item.name[locale],
      description: item.description[locale],
      prices: item.prices.map((p) => ({ label: p.label?.[locale], formatted: formatPrice(p.amount, locale) })),
      allergens: item.allergens.map((a) => ({ id: a, label: allergens[a][locale] })),
      tags: (item.tags ?? []).map((t) => ({ id: t, label: tags[t][locale] })),
      photo: item.image,
      search: foldForSearch(
        [...locales.map((l) => item.name[l]), item.description[locale], category.name[locale]].join(" "),
      ),
    })),
  }));
}

/** The whole menu: title band, the explorer with its search and categories, and the allergen note. */
export function MenuPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const categories = buildView(locale);
  const itemCount = categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <>
      <JsonLd data={menuJsonLd(locale)} />

      <section className="relative isolate overflow-hidden bg-lacivert-900 pb-12 pt-[6.5rem] text-krem-100 sm:pb-20 sm:pt-36 md:pb-24 md:pt-48 print:bg-transparent print:pb-4 print:pt-0 print:text-lacivert-900">
        {/* The shop front behind the title, darkened just enough for the text to read. On wide screens it
            fills only the right side, so the photo isn't blown up past its resolution. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 md:start-auto md:w-[58%] print:hidden">
          <Photo
            photo="dukkan"
            alt=""
            sizes="(min-width: 768px) 58vw, 100vw"
            preload
            className="object-[50%_40%] md:object-[50%_24%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lacivert-900/75 via-lacivert-900/55 to-lacivert-900/80 md:bg-gradient-to-r md:from-lacivert-900 md:via-lacivert-900/55 md:to-lacivert-900/20" />
          <div className="absolute inset-x-0 bottom-0 hidden h-3/5 bg-gradient-to-t from-lacivert-900/85 to-transparent md:block" />
        </div>
        <div className="container-page flex flex-col gap-4 sm:gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="hidden items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-sari-300 sm:flex sm:tracking-[0.24em] print:text-karamel-700">
              <span aria-hidden="true" className="h-px w-10 bg-sari-300/60" />
              {dict.menu.eyebrow}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-5 lg:gap-x-8">
              <h1
                aria-label={dict.menu.title}
                className="font-display text-[clamp(3.25rem,13vw,9.5rem)] font-medium leading-[0.9] tracking-[-0.03em] text-krem-50 print:text-6xl print:text-lacivert-900"
              >
                <span aria-hidden="true" className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                  {[...dict.menu.title].map((char, i) => (
                    <span
                      key={i}
                      className="animate-line-up inline-block"
                      style={{ animationDelay: `calc(var(--intro-delay, 0s) + ${80 + i * 70}ms)` }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </h1>
              <WheelTrigger label={dict.wheel.trigger} className="print-hidden" />
            </div>
            <p className="animate-rise mt-3 max-w-xl text-[15px] leading-relaxed text-krem-100/75 [animation-delay:calc(var(--intro-delay,0s)_+_350ms)] sm:mt-6 sm:text-lg md:text-xl print:text-base print:text-lacivert-800">
              {dict.menu.lead}
            </p>
            <div className="print-hidden animate-rise mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-krem-100/70 [animation-delay:calc(var(--intro-delay,0s)_+_420ms)] sm:mt-6">
              <OpenStatus labels={dict.status} />
              <span className="flex items-center gap-2">
                <MapPin className="size-4 text-karamel-300" aria-hidden="true" />
                {site.address.district}, {site.address.city}
              </span>
            </div>
          </div>
          <div className="animate-rise hidden flex-col items-start gap-4 [animation-delay:calc(var(--intro-delay,0s)_+_450ms)] sm:flex lg:items-end lg:pb-3 lg:text-end">
            <div className="hidden gap-6 sm:flex lg:gap-8">
              <div>
                <p className="font-display text-4xl text-sari-300 print:text-lacivert-900">{categories.length}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-krem-100/55">
                  {dict.menu.categories}
                </p>
              </div>
              <div className="w-px bg-krem-50/15" />
              <div>
                <p className="font-display text-4xl text-sari-300 print:text-lacivert-900">{itemCount}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-krem-100/55">{dict.menu.dishes}</p>
              </div>
            </div>
            <div className="print-hidden hidden md:block">
              <PrintButton label={dict.menu.print} />
            </div>
          </div>
        </div>
      </section>

      <DessertWheel slices={wheelSlices(locale)} labels={dict.wheel} />

      <MenuExplorer
        categories={categories}
        labels={{
          search: dict.menu.search,
          searchPlaceholder: dict.menu.searchPlaceholder,
          clear: dict.menu.clear,
          categories: dict.menu.categories,
          noResults: dict.menu.noResults,
          results: dict.menu.results,
          price: dict.menu.price,
          contains: dict.menu.contains,
          noAllergens: dict.menu.noAllergens,
          close: dict.menu.close,
        }}
      />

      <section className="bg-krem-100 pb-24 md:pb-32">
        <div className="container-page">
          <div className="rounded-[2rem] bg-krem-200/60 p-6 ring-1 ring-karamel-300/40 md:flex md:items-start md:gap-10 md:p-10 print:bg-transparent print:p-0 print:ring-0">
            <div className="md:w-72 md:shrink-0">
              <h2 className="font-display text-2xl font-medium text-lacivert-800">{dict.menu.allergensTitle}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {(Object.keys(allergens) as Allergen[]).map((id) => {
                  const Icon = allergenIcons[id];
                  return (
                    <li
                      key={id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-krem-50 px-3 py-1.5 text-sm font-semibold text-lacivert-800 ring-1 ring-lacivert-800/10"
                    >
                      <Icon className="size-4 text-karamel-600" aria-hidden="true" />
                      {allergens[id][locale]}
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-lacivert-800/75 md:mt-1">{dict.menu.allergensNote}</p>
          </div>
        </div>
      </section>
    </>
  );
}
