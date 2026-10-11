import type { MetadataRoute } from "next";
import { menuUpdatedAt } from "@/content/menu";
import { site } from "@/content/site";
import { localePath, locales } from "@/i18n/config";

const pages = [
  { path: "/", priority: 1, lastModified: menuUpdatedAt },
  { path: "/menu", priority: 0.9, lastModified: menuUpdatedAt },
  { path: "/gizlilik", priority: 0.2, lastModified: "2026-10-11" },
];

export default function sitemap(): MetadataRoute.Sitemap {
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
