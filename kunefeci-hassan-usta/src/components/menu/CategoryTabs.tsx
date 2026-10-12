"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

type Props = {
  tabs: { id: string; name: string; href: string }[];
  active: string;
  searchHref: string;
  labels: { tabs: string; search: string };
};

/** Category pills that stay under the header; the current one is scrolled into view. */
export function CategoryTabs({ tabs, active, searchHref, labels }: Props) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const tab = bar?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!bar || !tab) return;
    bar.scrollLeft = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2;
  }, [active]);

  return (
    <nav
      aria-label={labels.tabs}
      className="under-header print-hidden sticky top-16 z-30 border-b border-krem-50/[0.08] bg-zumrut-925/95 backdrop-blur-xl md:top-20"
    >
      <div className="container-page flex h-16 max-w-6xl items-center gap-2">
        <Link
          href={searchHref}
          aria-label={labels.search}
          className="grid size-[38px] shrink-0 place-items-center rounded-full bg-krem-50/[0.08] text-krem-50 transition-colors hover:bg-krem-50/15"
        >
          <Search className="size-[18px]" aria-hidden="true" />
        </Link>
        <div ref={barRef} className="no-scrollbar relative -me-4 flex min-w-0 flex-1 gap-2 overflow-x-auto pe-4">
          {tabs.map((tab) => {
            const current = tab.id === active;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                aria-current={current ? "page" : undefined}
                className={`flex h-[38px] shrink-0 items-center rounded-full px-[15px] text-[13.5px] transition-colors ${
                  current
                    ? "bg-fistik-300 font-extrabold text-zumrut-925"
                    : "bg-krem-50/[0.08] font-bold text-krem-100/85 hover:bg-krem-50/15"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
