import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/**
 * There is no language switch on the page: a phone set to Turkish gets the Turkish menu, any other
 * language the English one. Only the first (preferred) language counts. No header: Turkish.
 */
function phoneLocale(request: NextRequest): Locale {
  const first = request.headers.get("accept-language")?.split(",")[0]?.trim().toLowerCase();
  if (!first || first === "*" || first.startsWith("tr")) return defaultLocale;
  return "en";
}

// Every page lives under a language prefix (/tr, /en); anything without one (the table QR codes,
// shared links) gets the language of the phone. The menu is the home page, so old /menu and
// /menu/<category> links land there too.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const parts = pathname.split("/").filter(Boolean);
  // The panel and its uploaded photos live outside the language prefixes.
  if (parts[0] === "yonetim" || parts[0] === "medya") return;
  const hasLocale = isLocale(parts[0] ?? "");
  const locale = hasLocale ? parts[0] : phoneLocale(request);
  const rest = hasLocale ? parts.slice(1) : parts;

  const url = request.nextUrl.clone();
  if (rest[0] === "menu" && rest.length <= 2) {
    url.pathname = `/${locale}`;
    // A category had its own page once; now the menu is one page and opens at that category's heading.
    if (rest[1]) url.hash = `kategori-${rest[1]}`;
    // Without a language in the address the answer depends on the phone, so it mustn't be kept as permanent.
    if (hasLocale) return NextResponse.redirect(url, 308);
    const response = NextResponse.redirect(url, 307);
    response.headers.set("Vary", "Accept-Language");
    return response;
  }
  if (hasLocale) return;

  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  response.headers.set("Vary", "Accept-Language");
  return response;
}

export const config = {
  // Skip Next internals and any path with a file extension (images, icons, sitemap.xml, robots.txt).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
