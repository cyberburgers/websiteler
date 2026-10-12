import { ArrowUpRight, Flame, Snowflake } from "lucide-react";
import { Photo } from "@/components/ui";
import { TagBadge, allergenIcons } from "./icons";
import type { MenuViewItem } from "./types";

export type ItemCardLabels = { details: string; hot: string; cold: string };

/**
 * One dish as a big card. The photo runs edge to edge; under it a small line with the dish's number
 * and whether it comes hot or cold, the name and price, what the dish is, its sizes as menu lines,
 * and the allergens spelled out.
 */
export function ItemCard({
  item,
  index,
  onOpen,
  labels,
  priority = false,
}: {
  item: MenuViewItem;
  /** Position in its category, shown as 01, 02… */
  index: number;
  onOpen: () => void;
  labels: ItemCardLabels;
  /** Load the photo right away (the first card on the page). */
  priority?: boolean;
}) {
  const single = item.prices.length === 1;
  const serving = item.filters.includes("sicak") ? "hot" : item.filters.includes("soguk") ? "cold" : null;
  const ServingIcon = serving === "hot" ? Flame : Snowflake;

  return (
    <li id={item.id} className="reveal">
      <article className="group/card flex h-full flex-col overflow-hidden rounded-[30px] bg-krem-100 text-zumrut-800 shadow-[0_30px_60px_-36px_rgba(0,0,0,.95)] ring-1 ring-black/5">
        <button type="button" onClick={onOpen} aria-haspopup="dialog" className="group block w-full flex-1 text-start">
          <span className="relative block aspect-square overflow-hidden bg-krem-200">
            <Photo
              photo={item.photo}
              alt={item.name}
              sizes="(min-width: 1024px) 26rem, (min-width: 768px) 48vw, 100vw"
              preload={priority}
              className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
            />
            {/* A soft fade at the bottom so the photo melts into the card. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-krem-100/70 to-transparent"
            />
            {item.tags.length > 0 && (
              <span className="absolute start-3.5 top-3.5 flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <TagBadge key={t.id} id={t.id} label={t.label} onPhoto />
                ))}
              </span>
            )}
            <span
              aria-hidden="true"
              className="absolute end-3.5 top-3.5 grid size-10 place-items-center rounded-full bg-krem-50/90 text-zumrut-900 shadow-md backdrop-blur transition-transform duration-500 group-hover:rotate-45"
            >
              <ArrowUpRight className="size-[18px]" strokeWidth={2.4} />
            </span>
          </span>

          <span className="block px-5 pb-5 pt-3.5">
            <span className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-karamel-500">
              <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              {serving && (
                <>
                  <span aria-hidden="true" className="h-px w-5 bg-karamel-400/50" />
                  <span className="inline-flex items-center gap-1">
                    <ServingIcon className="size-3" strokeWidth={2.6} aria-hidden="true" />
                    {serving === "hot" ? labels.hot : labels.cold}
                  </span>
                </>
              )}
            </span>

            <span className="mt-1.5 flex items-start justify-between gap-4">
              <span className="font-display text-[26px] font-semibold leading-[1.08] tracking-[-0.01em] text-zumrut-900">
                {item.name}
              </span>
              {single && (
                <span className="shrink-0 rounded-full bg-zumrut-900 px-3.5 py-1 text-lg font-extrabold tabular-nums text-fistik-200">
                  {item.prices[0].formatted}
                </span>
              )}
            </span>

            {item.description && (
              <span className="mt-2 block text-[15px] leading-relaxed text-zumrut-800/75">{item.description}</span>
            )}

            {!single && (
              <span className="mt-3.5 block divide-y divide-zumrut-800/10 rounded-2xl bg-krem-50 px-4 ring-1 ring-zumrut-800/[0.07]">
                {item.prices.map((p) => (
                  <span key={p.label} className="flex items-center justify-between py-2.5">
                    <span className="text-[15px] font-semibold text-zumrut-800/80">{p.label}</span>
                    <span className="text-lg font-extrabold tabular-nums text-zumrut-900">{p.formatted}</span>
                  </span>
                ))}
              </span>
            )}

            {item.allergens.length > 0 && (
              <span className="mt-4 flex flex-wrap gap-1.5">
                {item.allergens.map((a) => {
                  const Icon = allergenIcons[a.id];
                  return (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1 rounded-full bg-karamel-400/[0.12] px-2.5 py-1 text-xs font-bold text-karamel-700"
                    >
                      <Icon className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
                      {a.label}
                    </span>
                  );
                })}
              </span>
            )}
            <span className="sr-only">{labels.details}</span>
          </span>
        </button>

      </article>
    </li>
  );
}
