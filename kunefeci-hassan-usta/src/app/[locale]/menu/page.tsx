import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { PrintButton } from "@/components/menu/PrintButton";
import { allergenIcons } from "@/components/menu/icons";
import type { MenuViewCategory } from "@/components/menu/types";
import { allergens, availableMenu, menuUpdatedAt, tags, type Allergen } from "@/content/menu";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { foldForSearch, formatDate, formatPrice } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, menuJsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: PageProps<"/[locale]/menu">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return pageMetadata({ locale, path: "/menu", title: dict.meta.menuTitle, description: dict.meta.menuDescription });
}

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

export default async function MenuPage({ params }: PageProps<"/[locale]/menu">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const categories = buildView(locale);
  const itemCount = categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <>
      <JsonLd data={menuJsonLd(locale)} />

      <section className="pattern-star relative isolate overflow-hidden bg-lacivert-900 pb-20 pt-36 text-krem-100 md:pb-24 md:pt-48 print:bg-transparent print:pb-4 print:pt-0 print:text-lacivert-900">
        <div
          aria-hidden="true"
          className="absolute -end-32 -top-24 -z-10 size-[36rem] rounded-full bg-serbet-500/20 blur-[120px] print:hidden"
        />
        <div className="container-page flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.24em] text-sari-300 print:text-karamel-700">
              <span aria-hidden="true" className="h-px w-10 bg-sari-300/60" />
              {dict.menu.eyebrow}
            </p>
            <h1 className="font-display mt-5 text-[clamp(4rem,13vw,9.5rem)] font-medium leading-[0.9] tracking-[-0.03em] text-krem-50 print:text-6xl print:text-lacivert-900">
              {dict.menu.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-krem-100/75 md:text-xl print:text-base print:text-lacivert-800">
              {dict.menu.lead}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end lg:pb-3 lg:text-end">
            <div className="flex gap-6 lg:gap-8">
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
            <p className="text-sm text-krem-100/60 print:text-lacivert-800">
              {dict.menu.priceNote} · {dict.menu.updated}: {formatDate(menuUpdatedAt, locale)}
            </p>
            <div className="print-hidden">
              <PrintButton label={dict.menu.print} />
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="scallop absolute inset-x-0 -bottom-px print:hidden" />
      </section>

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
