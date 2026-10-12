import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MenuSearch, type MenuSearchProps } from "@/components/menu/MenuSearch";
import { MenuSearchFromUrl } from "@/components/menu/MenuSearchFromUrl";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { categoryPath, menuView } from "@/lib/menu-view";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/ara">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    path: "/ara",
    title: dict.search.title,
    description: dict.meta.description,
    noindex: true,
  });
}

export default async function SearchPage({ params }: PageProps<"/[locale]/ara">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const categories = menuView(locale);
  const items = categories.flatMap((c) => c.items);

  const props: MenuSearchProps = {
    categories,
    hrefs: Object.fromEntries(items.map((i) => [i.id, categoryPath(locale, i.categoryId, i.id)])),
    popular: items.filter((i) => i.tags.some((t) => t.id === "populer" || t.id === "imza")),
    homeHref: localePath(locale),
    labels: {
      ...dict.search,
      placeholder: dict.menu.searchPlaceholder,
      clear: dict.menu.clear,
      noResults: dict.menu.noResults,
    },
  };

  return (
    <div className="container-page min-h-[70dvh] pb-14 pt-16 md:pt-20">
      <h1 className="sr-only">{dict.search.title}</h1>
      {/* The address bar is only known in the browser; until then the empty search shows. */}
      <Suspense fallback={<MenuSearch {...props} />}>
        <MenuSearchFromUrl {...props} />
      </Suspense>
    </div>
  );
}
