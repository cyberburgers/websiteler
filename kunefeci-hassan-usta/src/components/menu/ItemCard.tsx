import { ArrowRight } from "lucide-react";
import { Photo } from "@/components/ui";
import { TagBadge } from "./icons";
import { AllergenIcons } from "./parts";
import type { MenuViewItem } from "./types";

/**
 * One dish as a big card: a large photo, then the name and price, and under them what the dish is.
 * Sizes with several prices (Porsiyon / 1 kg) are listed as menu lines with dotted leaders.
 */
export function ItemCard({
  item,
  onOpen,
  detailsLabel,
  priority = false,
}: {
  item: MenuViewItem;
  onOpen: () => void;
  detailsLabel: string;
  /** Load the photo right away (the first card on the page). */
  priority?: boolean;
}) {
  const single = item.prices.length === 1;
  return (
    <li id={item.id} className="reveal">
      <div className="flex h-full flex-col rounded-[28px] bg-krem-100 p-2.5 text-zumrut-800 shadow-[0_28px_50px_-34px_rgba(0,0,0,.9)]">
        <button type="button" onClick={onOpen} aria-haspopup="dialog" className="group block w-full flex-1 text-start">
          <span className="relative block aspect-square overflow-hidden rounded-[22px] bg-krem-200">
            <Photo
              photo={item.photo}
              alt={item.name}
              sizes="(min-width: 1024px) 24rem, (min-width: 768px) 45vw, 100vw"
              preload={priority}
              className="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
            {item.tags.length > 0 && (
              <span className="absolute start-3 top-3 flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <TagBadge key={t.id} id={t.id} label={t.label} onPhoto />
                ))}
              </span>
            )}
          </span>
          <span className="block px-2.5 pb-2 pt-4">
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
            <span className="mt-3.5 flex items-center gap-2 border-t border-zumrut-800/10 pt-3 text-karamel-600">
              <AllergenIcons item={item} />
              <span className="ms-auto inline-flex items-center gap-1 text-[13px] font-extrabold text-zumrut-800">
                {detailsLabel}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
              </span>
            </span>
          </span>
        </button>
      </div>
    </li>
  );
}
