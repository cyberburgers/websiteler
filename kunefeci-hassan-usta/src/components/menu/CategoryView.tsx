"use client";

import { LayoutList, RectangleHorizontal } from "lucide-react";
import { useSyncExternalStore } from "react";
import { ItemCard, type ItemCardLabels } from "./ItemCard";
import { ItemSheet, type SheetLabels, type WaiterLabels } from "./ItemSheet";
import { closeItem, openItem, useItemHash } from "./itemHash";
import { DrinkMenu, ItemLine, lineClass } from "./parts";
import type { MenuViewCategory, MenuViewItem } from "./types";

type Labels = SheetLabels &
  ItemCardLabels & {
    hint: string;
    view: string;
    cards: string;
    list: string;
  };

type Props = {
  category: MenuViewCategory;
  pairing: { item: MenuViewItem; href: string }[];
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

/** The dishes of one category as big cards or a compact list, and the detail sheet they open. */
export function CategoryView({ category, pairing, labels, waiter }: Props) {
  const storedView = useSyncExternalStore(subscribeView, readView, () => "cards" as View);
  const view: View = category.layout === "list" ? "list" : storedView;
  const hash = useItemHash();

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
                  view === value ? "bg-krem-50 text-zumrut-925" : "text-krem-100/70 hover:text-krem-50"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      {category.layout === "list" ? (
        <DrinkMenu items={category.items} onOpen={openItem} />
      ) : view === "cards" ? (
        <ul className="mt-3.5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {category.items.map((item, ii) => (
            <ItemCard
              key={item.id}
              item={item}
              index={ii}
              onOpen={() => openItem(item.id)}
              labels={labels}
            />
          ))}
        </ul>
      ) : (
        <ul className="mt-3.5 grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
          {category.items.map((item) => (
            <li key={item.id} id={item.id}>
              <button type="button" onClick={() => openItem(item.id)} aria-haspopup="dialog" className={lineClass}>
                <ItemLine item={item} />
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
        onDismiss={closeItem}
      />
    </>
  );
}
