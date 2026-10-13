"use client";

import { useState } from "react";
import { MAX_PAIRING, defaultPairing, type MenuItem } from "@/content/menu";
import type { SiteContent } from "@/lib/content";
import { Section, buttonClass } from "./fields";

type Update = (change: (draft: SiteContent) => void) => void;

const names = (content: SiteContent, ids: string[]) => {
  const all = new Map(content.menu.flatMap((c) => c.items).map((i) => [i.id, i.name.tr || "Adsız ürün"]));
  return ids.flatMap((id) => (all.has(id) ? [all.get(id)!] : []));
};

/** Every dish on the menu as a chip, grouped by category; picked ones are numbered in the order they show. */
export function PairingPicker({
  content,
  selected,
  onChange,
  exclude,
}: {
  content: SiteContent;
  selected: string[];
  onChange: (next: string[]) => void;
  /** The dish being edited, which can't be suggested next to itself. */
  exclude?: string;
}) {
  const picked = selected.filter((id) => names(content, [id]).length > 0);
  const full = picked.length >= MAX_PAIRING;
  const toggle = (id: string) => {
    if (picked.includes(id)) onChange(picked.filter((p) => p !== id));
    else if (!full) onChange([...picked, id]);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-zumrut-900/70">
        {picked.length > 0 ? (
          <>
            Sırasıyla: <b>{names(content, picked).join(", ")}</b>
          </>
        ) : (
          "Hiçbiri seçilmedi."
        )}{" "}
        <span className="tabular-nums text-zumrut-900/50">
          ({picked.length}/{MAX_PAIRING})
        </span>
      </p>
      {content.menu.map((category) => {
        const items = category.items.filter((i) => i.id !== exclude && i.available !== false);
        if (items.length === 0) return null;
        return (
          <fieldset key={category.id}>
            <legend className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-zumrut-900/55">
              {category.name.tr || "Adsız kategori"}
            </legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {items.map((item) => {
                const on = picked.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={on}
                    disabled={!on && full}
                    onClick={() => toggle(item.id)}
                    className={`h-10 rounded-full px-4 text-sm font-bold transition-colors disabled:opacity-40 ${
                      on ? "bg-zumrut-800 text-krem-50" : "bg-white text-zumrut-900 ring-1 ring-zumrut-800/15"
                    }`}
                  >
                    {on && <span className="me-1.5 tabular-nums text-fistik-300">{picked.indexOf(item.id) + 1}.</span>}
                    {item.name.tr || "Adsız ürün"}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

/** The "Öneriler" tab: what is suggested under every dessert (a dish can have its own list, in its edit window). */
export function PairingEditor({ content, update }: { content: SiteContent; update: Update }) {
  const general = content.pairing ?? defaultPairing;

  return (
    <div className="space-y-4">
      <Section
        title="Yanında iyi gider"
        hint="Tatlıların penceresinin altında önerilen ürünler. En çok 4 tane, seçtiğiniz sırayla görünür. “Bugün yok” denen ya da gizlenen ürün önerilmez."
      >
        <PairingPicker content={content} selected={general} onChange={(next) => update((d) => void (d.pairing = next))} />
        {content.pairing && (
          <button type="button" onClick={() => update((d) => void delete d.pairing)} className={buttonClass.quiet}>
            Başlangıçtakine dön (çay, mırra)
          </button>
        )}
      </Section>
    </div>
  );
}

type Mode = "genel" | "ozel" | "yok";

/** In a dish's edit window: the general list, its own list, or no suggestions at all. */
export function ItemPairingField({
  content,
  item,
  dessert,
  onChange,
}: {
  content: SiteContent;
  item: MenuItem;
  /** Desserts show the general list by default; drinks show nothing unless given their own. */
  dessert: boolean;
  onChange: (next: string[] | undefined) => void;
}) {
  const [mode, setMode] = useState<Mode>(
    item.pairing === undefined ? "genel" : item.pairing.length > 0 ? "ozel" : "yok",
  );
  const general = (content.pairing ?? defaultPairing).filter((id) => id !== item.id);
  const choose = (next: Mode) => {
    setMode(next);
    if (next === "genel") onChange(undefined);
    else if (next === "yok") onChange([]);
    else onChange(item.pairing?.length ? item.pairing : dessert ? general : []);
  };
  const options: { id: Mode; title: string; hint: string }[] = [
    {
      id: "genel",
      title: "Genel liste",
      hint: dessert ? names(content, general).join(", ") || "Boş" : "İçeceklerde öneri çıkmaz",
    },
    { id: "ozel", title: "Bu ürüne özel", hint: "Aşağıdan seçin" },
    { id: "yok", title: "Gösterme", hint: "Bu üründe öneri yok" },
  ];

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-bold text-zumrut-900">Yanında iyi gider</legend>
      <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={mode === o.id}
            onClick={() => choose(o.id)}
            className={`rounded-2xl p-3 text-start transition-colors ${
              mode === o.id ? "bg-zumrut-800 text-krem-50" : "bg-white text-zumrut-900 ring-1 ring-zumrut-800/15"
            }`}
          >
            <span className="block text-sm font-extrabold">{o.title}</span>
            <span className={`mt-0.5 block text-xs ${mode === o.id ? "text-krem-100/75" : "text-zumrut-900/60"}`}>
              {o.hint}
            </span>
          </button>
        ))}
      </div>
      {mode === "ozel" && (
        <PairingPicker content={content} selected={item.pairing ?? []} onChange={onChange} exclude={item.id} />
      )}
    </fieldset>
  );
}
