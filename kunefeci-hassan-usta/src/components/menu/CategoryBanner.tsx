import { Photo } from "@/components/ui";

/** The start of a category on the home page: its cover photo, number and name, like a chapter opening. */
export function CategoryBanner({
  id,
  index,
  name,
  description,
  photo,
  count,
}: {
  id: string;
  index: number;
  name: string;
  description?: string;
  photo?: string;
  count: string;
}) {
  return (
    <header className="relative isolate flex min-h-44 items-end overflow-hidden rounded-[30px] bg-zumrut-800 md:min-h-60">
      {photo && <Photo photo={photo} alt="" sizes="(min-width: 1152px) 72rem, 100vw" className="-z-10" />}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(20,35,25,.92)_10%,rgba(20,35,25,.55)_55%,rgba(20,35,25,.15))]"
      />
      <span className="block p-5 md:p-8">
        <span className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-fistik-300">
          <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden="true" className="h-px w-6 bg-fistik-300/60" />
          {count}
        </span>
        <h3
          id={`baslik-${id}`}
          className="font-display mt-1.5 text-[34px] font-semibold leading-none tracking-[-0.015em] text-krem-50 md:text-5xl"
        >
          {name}
        </h3>
        {description && (
          <span className="mt-2 block max-w-md text-sm leading-relaxed text-krem-100/80 md:text-base">{description}</span>
        )}
      </span>
    </header>
  );
}
