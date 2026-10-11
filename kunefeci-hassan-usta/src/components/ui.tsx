import Image from "next/image";
import type { ReactNode } from "react";
import { FoodArt } from "@/components/art/FoodArt";
import { photoArt, photos, type PhotoKey } from "@/content/photos";

export function SectionHeading({
  eyebrow,
  title,
  tone = "light",
  align = "start",
  as: Tag = "h2",
  className = "",
}: {
  eyebrow: string;
  title: string;
  tone?: "light" | "dark";
  align?: "start" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      <p
        className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.24em] ${centered ? "justify-center" : ""} ${
          tone === "dark" ? "text-sari-300" : "text-karamel-600"
        }`}
      >
        <span
          aria-hidden="true"
          className={`kadayif-rule w-10 ${tone === "dark" ? "opacity-70 brightness-200" : ""}`}
        />
        {eyebrow}
      </p>
      <Tag
        className={`font-display mt-5 text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[1.04] tracking-[-0.015em] ${
          tone === "dark" ? "text-krem-50" : "text-lacivert-800"
        }`}
      >
        {title}
      </Tag>
    </div>
  );
}

/** Shown wherever a photo hasn't been supplied yet — on-brand instead of an empty grey box. */
export function PhotoPlaceholder({ className = "", label }: { className?: string; label?: string }) {
  return (
    <div
      className={`absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_25%,var(--color-sari-200),var(--color-karamel-300)_55%,var(--color-karamel-500))] ${className}`}
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

export function hasPhoto(photo?: PhotoKey): boolean {
  return Boolean(photo && photos[photo]);
}

const buttonBase =
  "inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-bold transition-all duration-300 active:scale-[.98]";

export const buttonStyles = {
  primary: `${buttonBase} bg-sari-300 text-lacivert-900 shadow-[0_10px_30px_-10px_rgba(241,230,160,.6)] hover:bg-sari-200 hover:shadow-[0_14px_36px_-10px_rgba(241,230,160,.8)]`,
  ghostDark: `${buttonBase} text-krem-50 ring-1 ring-krem-50/25 hover:bg-krem-50/10`,
  navy: `${buttonBase} bg-lacivert-800 text-krem-50 hover:bg-lacivert-700`,
  ghostLight: `${buttonBase} text-lacivert-800 ring-1 ring-lacivert-800/20 hover:bg-lacivert-800/[0.05]`,
};

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-bold uppercase tracking-[0.2em] ${className}`}>{children}</p>;
}
