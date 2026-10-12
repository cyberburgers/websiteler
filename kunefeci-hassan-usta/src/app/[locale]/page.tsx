import Link from "next/link";
import { notFound } from "next/navigation";
import { Megaphone, Search } from "lucide-react";
import { TableChip } from "@/components/home/TableChip";
import { HomeMenu } from "@/components/menu/HomeMenu";
import { filterIcons } from "@/components/menu/icons";
import { filterIds, type FilterId } from "@/components/menu/types";
import { OpenStatus } from "@/components/OpenStatus";
import { Photo } from "@/components/ui";
import { DessertWheel, WheelBanner } from "@/components/wheel/DessertWheel";
import { availableMenu } from "@/content/menu";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getContent } from "@/lib/content";
import { tx } from "@/lib/format";
import { menuView } from "@/lib/menu-view";
import { JsonLd, menuJsonLd, restaurantJsonLd } from "@/lib/structured-data";
import { wheelSlices } from "@/lib/wheel";

/** Each quick filter keeps a little of its own colour: pistachio green, syrup amber. */
const filterTone: Partial<Record<FilterId, string>> = {
  fistikli: "bg-fistik-300 text-zumrut-925",
  sicak: "bg-karamel-400/[0.16] text-karamel-300",
};

/** The menu's front page: welcome card, search and quick filters, the wheel, then every dish on the menu. */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const waiterDict = getDictionary("tr");
  const content = await getContent();
  const menu = availableMenu(content.menu);
  const notice = tx(content.notice, locale);
  const categories = menuView(locale, menu, content.pairing);
  const searchHref = localePath(locale, "/ara");
  const intro = (ms: number) => ({ animationDelay: `calc(var(--intro-delay, 0s) + ${ms}ms)` });

  return (
    <>
      <JsonLd data={restaurantJsonLd(locale, content.info)} />
      <JsonLd data={menuJsonLd(locale, menu)} />

      <div className="container-page max-w-6xl pb-12 pt-[4.25rem] md:pt-24">
        <div className="lg:grid lg:grid-cols-[1.2fr_1fr] lg:items-stretch lg:gap-8">
          <section className="animate-rise relative isolate flex h-[21rem] items-end overflow-hidden rounded-[28px] sm:h-[24rem] lg:h-auto lg:min-h-[30rem]" style={intro(0)}>
            <Photo
              photo="dukkan"
              alt={dict.home.shopPhoto}
              sizes="(min-width: 1024px) 40rem, 100vw"
              preload
              className="animate-settle -z-10 object-[50%_30%] brightness-120"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(29,49,38,.05)_30%,rgba(29,49,38,.92))]"
            />
            <div className="p-[18px] md:p-7">
              <div className="flex flex-wrap gap-2">
                <OpenStatus labels={dict.status} hours={content.info.hours} tone="glass" />
                <TableChip label={dict.home.table} />
              </div>
              <h1 className="font-display mt-3 text-[34px] font-medium italic leading-[1.02] text-krem-50 md:text-5xl">
                {dict.home.welcome}
              </h1>
              <p className="mt-1.5 text-sm text-krem-100/80 md:text-base">{dict.home.welcomeLead}</p>
            </div>
          </section>

          <div className="animate-rise flex flex-col" style={intro(120)}>
            {notice && (
              <p
                role="note"
                className="mt-4 flex items-start gap-2.5 rounded-2xl bg-fistik-300 px-4 py-3 text-sm font-bold leading-snug text-zumrut-925 lg:mt-0 lg:mb-4"
              >
                <Megaphone className="mt-px size-[18px] shrink-0" aria-hidden="true" />
                {notice}
              </p>
            )}
            <Link
              href={searchHref}
              className="mt-4 flex h-[52px] items-center gap-2.5 rounded-[26px] bg-krem-50/[0.07] px-[18px] text-[15px] text-krem-100/60 ring-1 ring-inset ring-fistik-300/[0.18] transition-colors hover:bg-krem-50/[0.1] lg:mt-0"
            >
              <Search className="size-[18px] text-fistik-300" aria-hidden="true" />
              {dict.menu.searchPlaceholder}
            </Link>
            <nav
              aria-label={dict.search.filters}
              className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0"
            >
              {filterIds.map((id) => {
                const Icon = filterIcons[id];
                return (
                  <Link
                    key={id}
                    href={`${searchHref}?f=${id}`}
                    className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition-colors hover:brightness-125 ${
                      filterTone[id] ?? "bg-krem-50/[0.08] text-krem-100/85"
                    }`}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {dict.search.filterNames[id]}
                  </Link>
                );
              })}
            </nav>

            <WheelBanner title={dict.wheel.trigger} action={dict.home.spin} className="mt-5" />
          </div>
        </div>

        <section aria-labelledby="menu-baslik" className="mt-8 md:mt-12">
          <h2 id="menu-baslik" className="font-display text-[28px] font-medium text-krem-50 md:text-4xl">
            {dict.menu.title}
          </h2>
          <div className="mt-2">
            <HomeMenu
              categories={categories}
              homeHref={localePath(locale)}
              labels={{
                tabs: dict.home.categories,
                details: dict.category.details,
                close: dict.menu.close,
                price: dict.menu.price,
                pairing: dict.item.pairing,
                showWaiter: dict.item.showWaiter,
                share: dict.item.share,
                copied: dict.item.copied,
                soldOut: dict.item.soldOut,
                soldOutHint: dict.item.soldOutHint,
              }}
              waiter={{ title: waiterDict.item.waiterTitle, table: waiterDict.home.table }}
            />
          </div>
        </section>
      </div>

      <DessertWheel slices={wheelSlices(locale, menu)} labels={dict.wheel} />
    </>
  );
}
