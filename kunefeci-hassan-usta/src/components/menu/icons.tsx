import { Clock, Crown, Egg, Flame, Heart, Leaf, MapPin, Milk, Nut, Wheat, type LucideIcon } from "lucide-react";
import type { Allergen, Tag } from "@/content/menu";

export const allergenIcons: Record<Allergen, LucideIcon> = {
  gluten: Wheat,
  sut: Milk,
  kabuklu: Nut,
  yumurta: Egg,
};

export const tagIcons: Record<Tag, LucideIcon> = {
  imza: Crown,
  populer: Heart,
  urfa: MapPin,
  sicak: Flame,
  mevsim: Leaf,
  siparis: Clock,
};

const tagTone: Record<Tag, string> = {
  imza: "bg-lacivert-800 text-sari-300",
  populer: "bg-karamel-500/12 text-karamel-700",
  urfa: "bg-fistik-500/15 text-fistik-600",
  sicak: "bg-serbet-500/15 text-karamel-700",
  mevsim: "bg-fistik-500/15 text-fistik-600",
  siparis: "bg-lacivert-800/[0.07] text-lacivert-700",
};

export function TagBadge({ id, label }: { id: Tag; label: string }) {
  const Icon = tagIcons[id];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none tracking-wide ${tagTone[id]}`}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}
