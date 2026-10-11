/** Eight-pointed Seljuk star, the same motif as the background pattern. */
function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M6 6h12v12H6zM12 3.5 20.5 12 12 20.5 3.5 12z" fill="currentColor" />
    </svg>
  );
}

/** A slowly scrolling band of the shop's promises, set slightly askew between two sections. */
export function Ticker({ items }: { items: string[] }) {
  const row = (copy: number) => (
    <ul key={copy} className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="flex items-center">
          <span className="font-brand whitespace-nowrap px-6 text-3xl text-sari-300 md:px-10 md:text-5xl">{item}</span>
          <Star className="size-5 shrink-0 text-karamel-400 md:size-7" />
        </li>
      ))}
    </ul>
  );
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden bg-[linear-gradient(var(--color-krem-100)_50%,var(--color-krem-50)_50%)] py-8 md:py-12"
    >
      <div className="-mx-[4%] -rotate-[1.6deg] bg-lacivert-900 py-4 shadow-[0_24px_48px_-28px_rgba(16,17,42,.7)] md:py-6">
        <div className="animate-marquee flex w-max">{[0, 1].map(row)}</div>
      </div>
    </div>
  );
}
