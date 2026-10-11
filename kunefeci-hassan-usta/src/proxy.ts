import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

// Every page lives under a language prefix (/tr, /en). Anything without
// one — including printed QR codes pointing at /menu — goes to Turkish.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and any path with a file extension (images, icons, sitemap.xml, robots.txt).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
