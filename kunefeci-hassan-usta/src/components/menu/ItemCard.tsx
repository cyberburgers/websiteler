"use client";

import { ArrowRight } from "lucide-react";
import { AddControl } from "@/components/order/AddControl";
import { useOrdering } from "@/components/order/OrderProvider";
import { Photo } from "@/components/ui";
import { TagBadge } from "./icons";
import { SoldOutBadge } from "./parts";
import type { MenuViewItem } from "./types";

/**
 * One dish as a big card: a large photo, then the name and price, and under them what the dish is.
 * Sizes with several prices (Porsiyon / 1 kg) are listed as menu lines with dotted leaders.
 * A dish that has run out today stays as it is, with "Bugün yok" on its photo.
 * At a table (menu opened from its QR card) "Ayrıntı" makes way for "+ Ekle".
 */
export function ItemCard({
  item,
  wide = { md: false, lg: false },
  onOpen,
  detailsLabel,
  soldOutLabel,
  priority = false,
}: {
  item: MenuViewItem;
  /** Stretch over two columns on tablets (md) or laptops (lg), with a landscape photo; see wideCard. */
  wide?: { md: boolean; lg: boolean };
  onOpen: () => void;
  detailsLabel: string;
  soldOutLabel: string;
  /** Load the photo right away (the first card on the page). */
  priority?: boolean;
}) {
  const single = item.prices.length === 1;
  const out = item.soldOut;
  const ordering = useOrdering();
  const orderable = Boolean(ordering?.canOrder && !out && ordering.catalog[item.id]);
  // Written out in full so Tailwind finds every class.
  const span = `${wide.md ? "md:col-span-2" : ""} ${wide.lg ? "lg:col-span-2" : wide.md ? "lg:col-span-1" : ""}`;
  const shape = `${wide.md ? "md:aspect-[2/1]" : ""} ${wide.lg ? "lg:aspect-[2/1]" : wide.md ? "lg:aspect-square" : ""}`;
  const sizes = `${wide.lg ? "(min-width: 1024px) 48rem" : "(min-width: 1024px) 24rem"}, ${wide.md ? "(min-width: 768px) 90vw" : "(min-width: 768px) 45vw"}, 100vw`;
  return (
    <li id={item.id} className={`reveal scroll-mt-36 ${span}`}>
      <div className="flex h-full flex-col rounded-[28px] bg-krem-100 p-2.5 text-zumrut-800 shadow-[0_28px_50px_-34px_rgba(0,0,0,.9)]">
        <button type="button" onClick={onOpen} aria-haspopup="dialog" className="group block w-full flex-1 text-start">
          <span className={`relative block aspect-square overflow-hidden rounded-[22px] bg-krem-200 ${shape}`}>
            <Photo
              photo={item.photo}
              alt={item.name}
              sizes={sizes}
              preload={priority}
              className="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
            {out ? (
              <SoldOutBadge label={soldOutLabel} />
            ) : (
              item.tags.length > 0 && (
                <span className="absolute start-3 top-3 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <TagBadge key={t.id} id={t.id} label={t.label} onPhoto />
                  ))}
                </span>
              )
            )}
          </span>
          <span className="block px-2.5 pt-4">
            <span className="flex items-start justify-between gap-4">
              <span className="font-display text-[25px] font-semibold leading-[1.1] text-zumrut-900">{item.name}</span>
              {single && (
                <span className="shrink-0 pt-0.5 text-[21px] font-extrabold tabular-nums text-karamel-600">
                  {item.prices[0].formatted}
                </span>
              )}
            </span>
            {item.description && (
              <span className="mt-2 block text-[15px] leading-relaxed text-zumrut-800/75">{item.description}</span>
            )}
            {!single && (
              <span className="mt-3 block space-y-1.5">
                {item.prices.map((p) => (
                  <span key={p.label} className="flex items-baseline text-[15px]">
                    <span className="font-semibold text-zumrut-800/80">{p.label}</span>
                    <span aria-hidden="true" className="leader" />
                    <span className="text-lg font-extrabold tabular-nums text-karamel-600">{p.formatted}</span>
                  </span>
                ))}
              </span>
            )}
          </span>
        </button>
        <div className="mx-2.5 mb-2 mt-3.5 flex min-h-[53px] items-center gap-2 border-t border-zumrut-800/10 pt-3 text-karamel-600">
          {orderable ? (
            <span className="ms-auto">
              <AddControl item={item} onChoose={onOpen} tone="light" />
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpen}
              aria-haspopup="dialog"
              className="group/ayrinti ms-auto inline-flex items-center gap-1 text-[13px] font-extrabold text-zumrut-800"
            >
              {detailsLabel}
              <ArrowRight className="size-3.5 transition-transform group-hover/ayrinti:translate-x-0.5 rtl:rotate-180" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
