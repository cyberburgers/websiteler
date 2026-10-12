import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { site } from "@/content/site";
import { localePath, locales } from "@/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { menuUpdatedAt } = await getContent();
  const pages = [
    { path: "/", priority: 1, lastModified: menuUpdatedAt },
    { path: "/gizlilik", priority: 0.2, lastModified: "2026-10-12" },
  ];
  const url = (path: string) => new URL(path, site.url).toString();
  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: url(localePath(locale, page.path)),
      lastModified: page.lastModified,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, url(localePath(l, page.path))])),
      },
    })),
  );
}
