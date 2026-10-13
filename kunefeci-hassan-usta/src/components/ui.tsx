import Image from "next/image";
import { isPhotoKey, isUploadedPhoto, photos } from "@/content/photos";

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

/** A photo slot: a photo uploaded from the panel (by address) or the shop's own photo (by name). */
export function Photo({
  photo,
  alt,
  sizes,
  className = "",
  preload,
  quality,
}: {
  photo?: string;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
  /** 85 for a large photo that fills the screen (the shop on the home page); the default 75 elsewhere. */
  quality?: 75 | 85;
}) {
  if (photo && isUploadedPhoto(photo)) {
    return (
      <Image
        src={photo}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        quality={quality}
        className={`object-cover ${className}`}
      />
    );
  }
  if (photo && isPhotoKey(photo)) {
    return (
      <Image
        src={photos[photo]}
        alt={alt}
        fill
        sizes={sizes}
        placeholder="blur"
        preload={preload}
        quality={quality}
        className={`object-cover ${className}`}
      />
    );
  }
  return <PhotoPlaceholder label={alt} />;
}

const buttonBase =
  "inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-bold transition-all duration-300 active:scale-[.98]";

export const buttonStyles = {
  primary: `${buttonBase} bg-fistik-300 text-zumrut-900 shadow-[0_10px_30px_-10px_rgba(161,219,181,.55)] hover:bg-fistik-200 hover:shadow-[0_14px_36px_-10px_rgba(161,219,181,.75)]`,
  ghostDark: `${buttonBase} text-krem-50 ring-1 ring-krem-50/25 hover:bg-krem-50/10`,
  dark: `${buttonBase} bg-zumrut-800 text-krem-50 hover:bg-zumrut-700`,
  ghostLight: `${buttonBase} text-zumrut-800 ring-1 ring-zumrut-800/20 hover:bg-zumrut-800/[0.05]`,
};
