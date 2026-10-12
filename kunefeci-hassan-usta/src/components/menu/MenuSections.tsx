"use client";

import { ItemCard } from "./ItemCard";
import { DrinkLine } from "./parts";
import type { MenuViewCategory } from "./types";

/**
 * Which dish cards stretch over two columns, so a category never ends on a half-empty row: two columns
 * from tablet width, three from laptop width. Five dishes on a laptop: the first is wide, then three.
 * Four: first and last wide (2+1, 1+2). Always the first or last dish, so the order stays as set.
 */
export function wideCard(count: number, index: number) {
  const md = count > 1 && count % 2 === 1 && index === 0;
  const lg = count > 1 && ((count % 3 === 2 && index === 0) || (count % 3 === 1 && (index === 0 || index === count - 1)));
  return { md, lg };
}

/** Every category of the menu under its heading: desserts as big cards, drinks as lines. */
export function MenuSections({
  categories,
  labels,
  onOpen,
}: {
  categories: MenuViewCategory[];
  labels: { details: string; soldOut: string };
  onOpen: (itemId: string) => void;
}) {
  return categories.map((category) => (
    <section
      key={category.id}
      id={`kategori-${category.id}`}
      aria-labelledby={`baslik-${category.id}`}
      // Lands with the heading just under the category bar (see jumpTo): bar alone on phones, header too on wide screens.
      className="scroll-mt-11 pt-8 md:scroll-mt-7 md:pt-12 lg:scroll-mt-[108px]"
    >
      <h3 id={`baslik-${category.id}`} className="font-display text-[28px] font-semibold text-krem-50 md:text-4xl">
        {category.name}
      </h3>
      {category.description && <p className="mt-1 text-sm text-krem-100/65">{category.description}</p>}
      {category.layout === "cards" ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {category.items.map((item, index) => (
            <ItemCard
              key={item.id}
              item={item}
              wide={wideCard(category.items.length, index)}
              onOpen={() => onOpen(item.id)}
              detailsLabel={labels.details}
              soldOutLabel={labels.soldOut}
            />
          ))}
        </ul>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
          {category.items.map((item) => (
            <li key={item.id} id={item.id} className="scroll-mt-36">
              <DrinkLine item={item} onOpen={() => onOpen(item.id)} soldOutLabel={labels.soldOut} />
            </li>
          ))}
        </ul>
      )}
    </section>
  ));
}
