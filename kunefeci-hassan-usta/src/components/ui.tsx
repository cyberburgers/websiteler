import Image from "next/image";
import { FoodArt } from "@/components/art/FoodArt";
import { photoArt, photos, type PhotoKey } from "@/content/photos";

/** Shown wherever a photo hasn't been supplied yet — on-brand instead of an empty grey box. */
export function PhotoPlaceholder({ className = "", label }: { className?: string; label?: string }) {
  return (
    <div
      className={`absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_25%,var(--color-fistik-200),var(--color-karamel-300)_55%,var(--color-karamel-500))] ${className}`}
    >
      <div className="pattern-star absolute inset-0 opacity-70 mix-blend-multiply" />
      <svg viewBox="0 0 64 64" aria-hidden="true" className="relative w-1/4 max-w-20 text-krem-50/80">
        <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M14 34c4-3 6 3 10 0s6 3 10 0 6 3 10 0 6 3 6 0M16 26c4-3 6 3 10 0s6 3 10 0 6 3 10 0 4 3 4 0M18 42c4-3 6 3 10 0s6 3 10 0 6 3 10 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}

/**
 * A photo slot: the real photo when one has been added, otherwise the dish illustration.
 * `fill` crops round dishes to their rim, for circular frames.
 */
export function Photo({
  photo,
  alt,
  sizes,
  className = "",
  preload,
  fill,
}: {
  photo?: PhotoKey;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
  fill?: boolean;
}) {
  const src = photo ? photos[photo] : undefined;
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        placeholder="blur"
        preload={preload}
        className={`object-cover ${className}`}
      />
    );
  }
  const art = photo ? photoArt[photo] : undefined;
  if (art) return <FoodArt kind={art} fill={fill} className={className} />;
  return <PhotoPlaceholder label={alt} />;
}

const buttonBase =
  "inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-bold transition-all duration-300 active:scale-[.98]";

export const buttonStyles = {
  primary: `${buttonBase} bg-fistik-300 text-zumrut-900 shadow-[0_10px_30px_-10px_rgba(182,232,106,.55)] hover:bg-fistik-200 hover:shadow-[0_14px_36px_-10px_rgba(182,232,106,.75)]`,
  ghostDark: `${buttonBase} text-krem-50 ring-1 ring-krem-50/25 hover:bg-krem-50/10`,
  dark: `${buttonBase} bg-zumrut-800 text-krem-50 hover:bg-zumrut-700`,
  ghostLight: `${buttonBase} text-zumrut-800 ring-1 ring-zumrut-800/20 hover:bg-zumrut-800/[0.05]`,
};
