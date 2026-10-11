import { Photo, SectionHeading } from "@/components/ui";
import { photos, type PhotoKey } from "@/content/photos";
import type { Dictionary } from "@/i18n/dictionaries";

// Spans make a loose mosaic; photos that don't exist yet are simply skipped.
const tiles: { key: PhotoKey; span: string }[] = [
  { key: "kunefe1", span: "col-span-2 row-span-2" },
  { key: "baklava", span: "" },
  { key: "cay", span: "" },
  { key: "urfa", span: "col-span-2" },
  { key: "kahve", span: "" },
  { key: "kunefe3", span: "row-span-2" },
  { key: "fistik", span: "" },
  { key: "tel", span: "col-span-2" },
];

export function Gallery({ dict }: { dict: Dictionary }) {
  const available = tiles.filter((t) => photos[t.key]);
  if (available.length < 4) return null;

  return (
    <section className="grain bg-krem-100 pb-24 md:pb-32">
      <div className="container-page">
        <SectionHeading eyebrow={dict.gallery.eyebrow} title={dict.gallery.title} />
        <div className="mt-12 grid grid-flow-dense auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] md:grid-cols-4 md:gap-4 lg:auto-rows-[230px]">
          {available.map((tile) => (
            <div
              key={tile.key}
              className={`reveal group relative overflow-hidden rounded-[1.75rem] bg-krem-200 ${tile.span}`}
            >
              <Photo
                src={photos[tile.key]}
                alt=""
                sizes="(min-width: 768px) 25vw, 50vw"
                className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
