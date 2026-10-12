import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { CategoryView } from "@/components/menu/CategoryView";
import { allergenIcons } from "@/components/menu/icons";
import { Photo } from "@/components/ui";
import { allergenIds, allergens } from "@/content/menu";
import { linksFor } from "@/content/site";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getContent, getMenu } from "@/lib/content";
import { categoryPath, fill, menuView, pairingItems } from "@/lib/menu-view";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getMenu()).map((category) => ({ kategori: category.id }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/menu/[kategori]">): Promise<Metadata> {
  const { locale, kategori } = await params;
  if (!isLocale(locale)) return {};
  const category = menuView(locale, await getMenu()).find((c) => c.id === kategori);
  if (!category) return {};
  return pageMetadata({
    locale,
    path: `/menu/${category.id}`,
    title: category.name,
    description: [category.description, category.items.map((i) => i.name).join(", ")].filter(Boolean).join(" "),
  });
}

export default async function CategoryPage({ params }: PageProps<"/[locale]/menu/[kategori]">) {
  const { locale, kategori } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const waiterDict = getDictionary("tr");
  const content = await getContent();
  const categories = menuView(locale, await getMenu());
  const index = categories.findIndex((c) => c.id === kategori);
  if (index === -1) notFound();
  const category = categories[index];
  const next = categories[(index + 1) % categories.length];
  const count = fill(category.layout === "cards" ? dict.home.dishes : dict.home.drinks, { n: category.items.length });

  return (
    <>
      <section className="relative isolate flex h-[19rem] items-end overflow-hidden md:h-[24rem]">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Photo photo={category.photo} alt="" sizes="100vw" preload />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(29,49,38,.78),rgba(29,49,38,.2)_38%,rgba(29,49,38,.96))]" />
        </div>
        <div className="container-page max-w-6xl pb-5 md:pb-8">
          <p className="animate-rise text-[11px] font-extrabold uppercase tracking-[0.22em] text-fistik-300 [animation-delay:calc(var(--intro-delay,0s)_+_60ms)]">
            {String(index + 1).padStart(2, "0")} · {count}
          </p>
          <h1 className="font-display mt-1.5 text-[clamp(2.6rem,9vw,4.5rem)] font-semibold leading-none tracking-[-0.015em] text-krem-50">
            <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
              <span className="animate-line-up block [animation-delay:calc(var(--intro-delay,0s)_+_100ms)]">
                {category.name}
              </span>
            </span>
          </h1>
          {category.description && (
            <p className="animate-rise mt-1.5 max-w-xl text-sm text-krem-100/80 [animation-delay:calc(var(--intro-delay,0s)_+_200ms)] md:text-base">
              {category.description}
            </p>
          )}
        </div>
      </section>

      <CategoryTabs
        tabs={categories.map((c) => ({ id: c.id, name: c.name, href: categoryPath(locale, c.id) }))}
        active={category.id}
        searchHref={localePath(locale, "/ara")}
        labels={{ tabs: dict.category.tabs, search: dict.search.title }}
      />

      <div className="container-page max-w-6xl pb-12 pt-3.5 md:pt-6">
        <CategoryView
          key={category.id}
          category={category}
          pairing={pairingItems(categories).map((item) => ({
            item,
            href: categoryPath(locale, item.categoryId, item.id),
          }))}
          trayHref={linksFor(content.info).whatsapp(dict.category.trayText)}
          labels={{
            ...dict.category,
            close: dict.menu.close,
            price: dict.menu.price,
            contains: dict.menu.contains,
            noAllergens: dict.menu.noAllergens,
            pairing: dict.item.pairing,
            showWaiter: dict.item.showWaiter,
            share: dict.item.share,
            copied: dict.item.copied,
          }}
          waiter={{ title: waiterDict.item.waiterTitle, table: waiterDict.home.table }}
        />

        {next.id !== category.id && (
          <Link
            href={categoryPath(locale, next.id)}
            className="group mt-5 flex h-[72px] items-center gap-3 rounded-3xl bg-krem-50/[0.07] pe-2 ps-[18px] ring-1 ring-fistik-300/[0.18] transition-colors hover:bg-krem-50/[0.11] md:mt-8 md:max-w-md"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-extrabold uppercase tracking-[0.2em] text-fistik-300">
                {dict.category.next}
              </span>
              <span className="font-display mt-0.5 block truncate text-xl font-semibold text-krem-50">{next.name}</span>
            </span>
            <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-zumrut-800">
              <Photo photo={next.photo} alt="" sizes="56px" className="transition-transform duration-700 group-hover:scale-110" />
            </span>
          </Link>
        )}

        <aside className="mt-8 rounded-3xl border border-krem-50/[0.08] p-5 md:mt-10 md:flex md:items-start md:gap-8 md:p-6">
          <div className="md:w-64 md:shrink-0">
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-krem-100/55">
              {dict.menu.allergensTitle}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-semibold text-krem-100/80">
              {allergenIds.map((id) => {
                const Icon = allergenIcons[id];
                return (
                  <li key={id} className="inline-flex items-center gap-1.5">
                    <Icon className="size-4 text-karamel-300" strokeWidth={1.8} aria-hidden="true" />
                    {allergens[id][locale]}
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-krem-100/55 md:mt-0">{dict.menu.allergensNote}</p>
        </aside>
      </div>
    </>
  );
}
