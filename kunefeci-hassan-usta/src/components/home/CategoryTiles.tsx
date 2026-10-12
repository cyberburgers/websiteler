import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MenuViewCategory } from "@/components/menu/types";
import { Photo } from "@/components/ui";
import { WheelTile } from "@/components/wheel/DessertWheel";
import type { Locale } from "@/i18n/config";
import { fill } from "@/lib/format";
import { categoryPath } from "@/lib/menu-view";

type Labels = { dishes: string; drinks: string; wheelTitle: string; wheelAction: string };

/**
 * Bento layout. Phones: a wide first tile, two halves, a wide strip, then a half beside the wheel.
 * Tablets and up: three columns with the first tile two-by-two.
 */
const shapes = [
  { tile: "col-span-2 h-[13.5rem] md:row-span-2 md:h-auto", big: true },
  { tile: "h-[13rem] md:h-auto" },
  { tile: "h-[13rem] md:h-auto" },
  { tile: "col-span-2 h-[10.5rem] md:col-span-1 md:h-auto", strip: true },
  { tile: "h-[11.5rem] md:h-auto" },
];

export function CategoryTiles({
  categories,
  locale,
  labels,
}: {
  categories: MenuViewCategory[];
  locale: Locale;
  labels: Labels;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:auto-rows-[15rem] md:grid-cols-3 md:gap-4 lg:auto-rows-[16.5rem]">
      {categories.map((category, i) => {
        const shape = shapes[i] ?? { tile: "h-[11.5rem] md:h-auto" };
        const count = fill(category.layout === "cards" ? labels.dishes : labels.drinks, {
          n: category.items.length,
        });
        const detail = shape.strip
          ? `${category.items
              .slice(0, 3)
              .map((item) => item.name)
              .join(", ")}…`
          : count;
        return (
          <Link
            key={category.id}
            href={categoryPath(locale, category.id)}
            className={`group relative isolate block overflow-hidden rounded-[26px] bg-lacivert-800 text-krem-50 ${shape.tile}`}
          >
            <Photo
              photo={category.photo}
              alt=""
              sizes={shape.big ? "(min-width: 768px) 44rem, 100vw" : "(min-width: 768px) 22rem, 50vw"}
              preload={i === 0}
              className="-z-10 transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
            />
            <span
              aria-hidden="true"
              className={`absolute inset-0 -z-10 ${
                shape.strip
                  ? "bg-[linear-gradient(90deg,rgba(20,21,47,.92),rgba(20,21,47,.15)_70%)] md:bg-[linear-gradient(180deg,rgba(20,21,47,0)_35%,rgba(20,21,47,.9))]"
                  : "bg-[linear-gradient(180deg,rgba(20,21,47,0)_35%,rgba(20,21,47,.9))]"
              }`}
            />
            <span
              className={`absolute start-3.5 end-3.5 ${
                shape.strip
                  ? "top-1/2 -translate-y-1/2 start-[18px] md:top-auto md:bottom-3.5 md:translate-y-0"
                  : shape.big
                    ? "bottom-4 start-[18px] end-16"
                    : "bottom-3.5"
              }`}
            >
              <span
                className={`font-display block font-semibold leading-[1.05] ${
                  shape.big ? "text-[30px] md:text-[44px]" : shape.strip ? "text-[26px] md:text-[23px]" : "text-[21px] md:text-[23px]"
                }`}
              >
                {category.name}
              </span>
              <span className="mt-1 block text-xs text-krem-100/75 md:text-[13px]">{detail}</span>
            </span>
            {shape.big && (
              <span className="absolute bottom-3.5 end-3.5 grid size-10 place-items-center rounded-full bg-sari-300 text-lacivert-925 transition-transform group-hover:translate-x-0.5 md:size-12">
                <ArrowRight className="size-[18px] rtl:rotate-180" strokeWidth={2.4} aria-hidden="true" />
              </span>
            )}
          </Link>
        );
      })}
      <WheelTile
        title={labels.wheelTitle}
        action={labels.wheelAction}
        className={categories.length % 2 === 0 ? "col-span-2 h-[11.5rem] md:col-span-1 md:h-auto" : "h-[11.5rem] md:h-auto"}
      />
    </div>
  );
}
