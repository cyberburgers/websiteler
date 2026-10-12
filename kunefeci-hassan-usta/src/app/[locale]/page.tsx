import Link from "next/link";
import { notFound } from "next/navigation";
import { Megaphone } from "lucide-react";
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

/** The menu's front page: welcome card, quick filters, the wheel, then every dish on the menu. */
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
        {/* Phones: the welcome sits on the shop photo, the search and the wheel below it.
            Tablets and up: the photo stands alone on the left, whole and clear of text; the welcome heads the
            right column and the search and the wheel close it, level with the photo's bottom edge. */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-[auto_1fr] md:gap-x-8 lg:grid-cols-[1.15fr_1fr] lg:gap-x-12">
          <div
            className="animate-rise relative col-start-1 row-start-1 h-[21rem] overflow-hidden rounded-[28px] sm:h-[24rem] md:row-span-2 md:h-auto md:min-h-[32rem]"
            style={intro(0)}
          >
            <Photo
              photo="dukkan"
              alt={dict.home.shopPhoto}
              sizes="(min-width: 1024px) 38rem, (min-width: 768px) 50vw, 100vw"
              preload
              quality={85}
              className="animate-settle object-[50%_30%] brightness-120"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(29,49,38,.05)_30%,rgba(29,49,38,.92))] md:hidden"
            />
          </div>

          <section
            aria-labelledby="hos-geldiniz"
            className="animate-rise relative col-start-1 row-start-1 self-end p-[18px] md:col-start-2 md:self-start md:px-0 md:pb-8 md:pt-4 lg:pt-6"
            style={intro(0)}
          >
            <div className="flex flex-wrap gap-2">
              <OpenStatus labels={dict.status} hours={content.info.hours} tone="glass" />
              <TableChip label={dict.home.table} />
            </div>
            <h1
              id="hos-geldiniz"
              className="font-display mt-3 text-[34px] font-medium italic leading-[1.02] text-krem-50 md:mt-5 md:text-5xl lg:mt-6 lg:text-[64px]"
            >
              {dict.home.welcome}
            </h1>
            <p className="mt-1.5 text-sm text-krem-100/80 md:mt-3 md:max-w-sm md:text-base md:leading-relaxed md:text-krem-100/70 lg:mt-4 lg:text-lg">
              {dict.home.welcomeLead}
            </p>
          </section>

          <div className="animate-rise flex flex-col md:col-start-2 md:row-start-2 md:justify-end" style={intro(120)}>
            {notice && (
              <p
                role="note"
                className="mt-4 flex items-start gap-2.5 rounded-2xl bg-fistik-300 px-4 py-3 text-sm font-bold leading-snug text-zumrut-925 md:mb-4 md:mt-0"
              >
                <Megaphone className="mt-px size-[18px] shrink-0" aria-hidden="true" />
                {notice}
              </p>
            )}
            <nav
              aria-label={dict.search.filters}
              className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:mx-0 md:mt-0 md:flex-wrap md:px-0"
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
