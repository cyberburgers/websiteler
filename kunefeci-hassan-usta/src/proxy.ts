import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

// Every page lives under a language prefix (/tr, /en); anything without one goes to Turkish.
// The menu is the home page, so old /menu links (and printed QR codes) land there too.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const parts = pathname.split("/").filter(Boolean);
  const hasLocale = isLocale(parts[0] ?? "");
  const locale = hasLocale ? parts[0] : defaultLocale;
  const rest = hasLocale ? parts.slice(1) : parts;

  const url = request.nextUrl.clone();
  if (rest.length === 1 && rest[0] === "menu") {
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url, 308);
  }
  if (hasLocale) return;

  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and any path with a file extension (images, icons, sitemap.xml, robots.txt).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
