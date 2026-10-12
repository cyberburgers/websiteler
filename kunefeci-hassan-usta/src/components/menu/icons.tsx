import {
  Clock,
  Crown,
  Flame,
  Heart,
  Leaf,
  MapPin,
  Nut,
  Snowflake,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Tag } from "@/content/menu";
import type { FilterId } from "./types";

export const tagIcons: Record<Tag, LucideIcon> = {
  imza: Crown,
  populer: Heart,
  urfa: MapPin,
  sicak: Flame,
  mevsim: Leaf,
  siparis: Clock,
};

export const filterIcons: Record<FilterId, LucideIcon> = {
  fistikli: Nut,
  sicak: Flame,
  soguk: Snowflake,
  paylasmalik: Users,
};

const tagTone: Record<Tag, string> = {
  imza: "bg-zumrut-800 text-fistik-300",
  populer: "bg-karamel-500/12 text-karamel-700",
  urfa: "bg-fistik-500/15 text-fistik-600",
  sicak: "bg-serbet-500/15 text-karamel-700",
  mevsim: "bg-fistik-500/15 text-fistik-600",
  siparis: "bg-zumrut-800/[0.07] text-zumrut-700",
};

/**
 * A small label such as "Ustanın imzası". On a photo every badge but the signature one
 * turns solid cream, so it stays readable over any picture.
 */
export function TagBadge({ id, label, onPhoto = false }: { id: Tag; label: string; onPhoto?: boolean }) {
  const Icon = tagIcons[id];
  const tone = onPhoto && id !== "imza" ? "bg-krem-50 text-zumrut-800 shadow-sm" : tagTone[id];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-[5px] text-[11px] font-extrabold leading-none tracking-wide ${tone}`}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}
