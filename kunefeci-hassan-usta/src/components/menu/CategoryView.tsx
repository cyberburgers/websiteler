"use client";

import { ArrowRight, LayoutList, RectangleHorizontal } from "lucide-react";
import { useRef, useSyncExternalStore } from "react";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { Photo } from "@/components/ui";
import { TagBadge } from "./icons";
import { ItemSheet, type SheetLabels, type WaiterLabels } from "./ItemSheet";
import { AllergenIcons, ItemLine, lineClass } from "./parts";
import type { MenuViewCategory, MenuViewItem } from "./types";

type Labels = SheetLabels & {
  hint: string;
  view: string;
  cards: string;
  list: string;
  details: string;
  trayAsk: string;
};

type Props = {
  category: MenuViewCategory;
  pairing: { item: MenuViewItem; href: string }[];
  trayHref: string;
  labels: Labels;
  waiter: WaiterLabels;
};

type View = "cards" | "list";
const VIEW_KEY = "menu-gorunum";
const VIEW_EVENT = "menu-gorunum:degisti";

function readView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "cards";
  } catch {
    return "cards";
  }
}

function subscribeView(onChange: () => void) {
  window.addEventListener(VIEW_EVENT, onChange);
  return () => window.removeEventListener(VIEW_EVENT, onChange);
}

function saveView(view: View) {
  try {
    localStorage.setItem(VIEW_KEY, view);
  } catch {
    // Private mode: the choice just isn't remembered.
  }
  window.dispatchEvent(new Event(VIEW_EVENT));
}

/** The open dish lives in the address bar (#hassan-usta-ozel), so it can be shared and Back closes it. */
const HASH_EVENT = "menu-urun:degisti";

function subscribeHash(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  window.addEventListener(HASH_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(HASH_EVENT, onChange);
  };
}

const readHash = () => decodeURIComponent(window.location.hash.slice(1));

function ItemCard({
  item,
  onOpen,
  trayHref,
  labels,
}: {
  item: MenuViewItem;
  onOpen: () => void;
  trayHref: string;
  labels: Labels;
}) {
  const single = item.prices.length === 1;
  const onOrder = item.tags.some((t) => t.id === "siparis");
  return (
    <li id={item.id} className="reveal scroll-mt-40">
      <div className="h-full rounded-[26px] bg-krem-100 p-2 text-lacivert-800 shadow-[0_24px_48px_-36px_rgba(0,0,0,.8)]">
        <button type="button" onClick={onOpen} aria-haspopup="dialog" className="group block w-full text-start">
          <span className="relative block h-[228px] overflow-hidden rounded-[20px] bg-krem-200 md:h-[240px]">
            <Photo
              photo={item.photo}
              alt={item.name}
              sizes="(min-width: 1024px) 24rem, (min-width: 768px) 45vw, 100vw"
              className="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
            {item.tags.length > 0 && (
              <span className="absolute start-2.5 top-2.5 flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <TagBadge key={t.id} id={t.id} label={t.label} onPhoto />
                ))}
              </span>
            )}
            {single && (
              <span className="absolute bottom-2.5 end-2.5 rounded-full bg-sari-300 px-3 py-1.5 text-base font-extrabold tabular-nums text-lacivert-925 shadow-md">
                {item.prices[0].formatted}
              </span>
            )}
          </span>
          <span className="block px-2 pb-1.5 pt-3">
            <span className="font-display block text-[23px] font-semibold leading-[1.1]">{item.name}</span>
            <span className="mt-1.5 block text-[13.5px] leading-[1.45] text-lacivert-800/70">{item.description}</span>
            {!single && (
              <span className="mt-3 grid grid-cols-2 gap-2">
                {item.prices.map((p) => (
                  <span
                    key={p.label}
                    className="flex h-14 flex-col items-center justify-center rounded-2xl ring-2 ring-lacivert-800/15"
                  >
                    <span className="text-xs font-semibold text-lacivert-800/70">{p.label}</span>
                    <span className="text-[17px] font-extrabold tabular-nums text-karamel-600">{p.formatted}</span>
                  </span>
                ))}
              </span>
            )}
            <span className="mt-2.5 flex items-center gap-2 text-karamel-600">
              <AllergenIcons item={item} />
              <span className="ms-auto inline-flex items-center gap-1 text-[12.5px] font-extrabold text-lacivert-800">
                {labels.details}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
              </span>
            </span>
          </span>
        </button>
        {onOrder && (
          <a
            href={trayHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-2 mb-2 mt-2 flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#25d366] text-sm font-extrabold text-[#0b3d1f] transition hover:brightness-105"
          >
            <WhatsAppIcon className="size-[18px]" />
            {labels.trayAsk}
          </a>
        )}
      </div>
    </li>
  );
}

/** The dishes of one category as big cards or a compact list, and the detail sheet they open. */
export function CategoryView({ category, pairing, trayHref, labels, waiter }: Props) {
  const storedView = useSyncExternalStore(subscribeView, readView, () => "cards" as View);
  const view: View = category.layout === "list" ? "list" : storedView;
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  // True while the open sheet has its own history entry, so closing it can simply go Back.
  const pushed = useRef(false);

  const open = (id: string) => {
    window.history.pushState(null, "", `#${id}`);
    pushed.current = true;
    window.dispatchEvent(new Event(HASH_EVENT));
  };

  const dismiss = () => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
      return;
    }
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    window.dispatchEvent(new Event(HASH_EVENT));
  };

  const selected = category.items.find((i) => i.id === hash) ?? null;
  const sheetPairing = category.layout === "cards" ? pairing : [];

  return (
    <>
      {category.layout === "cards" && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-[12.5px] text-krem-100/55">{labels.hint}</span>
          <div role="group" aria-label={labels.view} className="flex rounded-xl bg-krem-50/[0.08] p-[3px]">
            {(
              [
                ["cards", labels.cards, RectangleHorizontal],
                ["list", labels.list, LayoutList],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                aria-pressed={view === value}
                onClick={() => saveView(value)}
                className={`grid h-[34px] w-10 place-items-center rounded-[9px] transition-colors ${
                  view === value ? "bg-krem-50 text-lacivert-925" : "text-krem-100/70 hover:text-krem-50"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "cards" ? (
        <ul className="mt-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {category.items.map((item) => (
            <ItemCard key={item.id} item={item} onOpen={() => open(item.id)} trayHref={trayHref} labels={labels} />
          ))}
        </ul>
      ) : (
        <ul className={`grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3 ${category.layout === "cards" ? "mt-3.5" : ""}`}>
          {category.items.map((item) => (
            <li key={item.id} id={item.id} className="scroll-mt-40">
              <button
                type="button"
                onClick={() => open(item.id)}
                aria-haspopup="dialog"
                className={`${lineClass} ${category.layout === "list" ? "min-h-[68px] ps-4" : ""}`}
              >
                <ItemLine item={item} thumb={category.layout === "cards"} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ItemSheet
        item={selected}
        pairing={sheetPairing}
        labels={labels}
        waiter={waiter}
        onDismiss={dismiss}
      />
    </>
  );
}
