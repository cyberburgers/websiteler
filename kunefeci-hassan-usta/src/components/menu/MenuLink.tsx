"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { goToHash } from "./jump";

/**
 * A link into the menu (/tr#fistikli-kunefe). From another page it navigates as usual; on the menu
 * itself only the address's #part changes, which the router doesn't announce, so the dish is opened
 * (or the category reached) here directly.
 */
export function MenuLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  return (
    <Link
      href={href}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        const url = new URL(href, window.location.href);
        if (e.defaultPrevented || !url.hash || url.pathname !== window.location.pathname) return;
        e.preventDefault();
        goToHash(decodeURIComponent(url.hash.slice(1)));
      }}
    />
  );
}
