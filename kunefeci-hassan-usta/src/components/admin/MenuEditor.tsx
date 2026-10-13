"use client";

import { ArrowDown, ArrowUp, CalendarX2, Check, EyeOff, ImageIcon, Pencil, Plus, Trash2, Undo2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/ui";
import { allergenIds, allergens, tagIds, tags, type MenuCategory, type MenuItem } from "@/content/menu";
import type { SiteContent } from "@/lib/content";
import { serviceDay } from "@/lib/serviceDay";
import { Bilingual, Field, PhotoField, Toggle, buttonClass, cardClass, chipClass, inputClass, noteClass } from "./fields";
import { TEMP_PREFIX, allIds, blankCategory, blankItem, formatTl, move, uniqueId } from "./menu-utils";
import { ItemPairingField } from "./PairingEditor";

type Update = (change: (draft: SiteContent) => void) => void;

const digits = (value: string) => Number(value.replace(/\D/g, "").slice(0, 7) || 0);

function PriceInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <span className="relative block">
      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm font-bold text-krem-100/45">
        ₺
      </span>
      <input
        inputMode="numeric"
        aria-label={label}
        value={value ? String(value) : ""}
        placeholder="0"
        onChange={(e) => onChange(digits(e.target.value))}
        className={`${inputClass} ps-7 font-extrabold tabular-nums`}
      />
    </span>
  );
}

/** A dish's id comes from its Turkish name the first time it is closed, and then never changes (links keep working). */
function settleIds(draft: SiteContent) {
  const taken = allIds(draft.menu);
  for (const c of draft.menu) {
    if (c.id.startsWith(TEMP_PREFIX) && c.name.tr.trim()) {
      taken.delete(c.id);
      c.id = uniqueId(c.name.tr, taken);
      taken.add(c.id);
    }
    for (const i of c.items) {
      if (i.id.startsWith(TEMP_PREFIX) && i.name.tr.trim()) {
        taken.delete(i.id);
        i.id = uniqueId(i.name.tr, taken);
        taken.add(i.id);
      }
    }
  }
}

function ModalShell({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-zumrut-925 p-0 text-krem-50 backdrop:bg-black/65 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-3xl sm:ring-1 sm:ring-karamel-300/20"
    >
      {open && (
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-karamel-300/15 bg-zumrut-925/95 px-4 py-3 backdrop-blur">
            <h2 className="text-lg font-extrabold">{title}</h2>
            <button type="button" onClick={() => ref.current?.close()} className={buttonClass.primary}>
              Tamam
            </button>
          </div>
          <div className="flex-1 space-y-5 p-4 pb-10 sm:p-6">{children}</div>
        </div>
      )}
    </dialog>
  );
}

function Chips<T extends string>({
  options,
  selected,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  selected: T[];
  onChange: (next: T[]) => void;
  label: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-krem-100">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? selected.filter((s) => s !== o.id) : [...selected, o.id])}
              className={`h-10 rounded-full px-4 text-sm font-bold transition-colors ${chipClass(on)}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ItemDialog({
  content,
  update,
  itemId,
  onClose,
}: {
  content: SiteContent;
  update: Update;
  itemId: string | null;
  onClose: () => void;
}) {
  const ci = content.menu.findIndex((c) => c.items.some((i) => i.id === itemId));
  const category = content.menu[ci];
  const ii = category?.items.findIndex((i) => i.id === itemId) ?? -1;
  const item = category?.items[ii];

  const edit = (change: (draft: MenuItem) => void) =>
    update((draft) => {
      change(draft.menu[ci].items[ii]);
    });

  return (
    <ModalShell open={Boolean(item)} title={item?.name.tr || "Yeni ürün"} onClose={onClose}>
      {item && (
        <>
          <PhotoField value={item.image} onChange={(image) => edit((d) => void (d.image = image))} />
          <Bilingual
            label="Ürün adı"
            value={item.name}
            placeholder="Ör. Fıstıklı Künefe"
            onChange={(name) => edit((d) => void (d.name = name))}
          />
          <Bilingual
            label="Açıklama"
            multiline
            value={item.description}
            onChange={(description) => edit((d) => void (d.description = description))}
          />

          <fieldset>
            <legend className="text-sm font-bold text-krem-100">Fiyat</legend>
            <p className="text-xs text-krem-100/55">
              Tek fiyat yeterli. Porsiyon / 1 kg gibi seçenekler için yeni satır ekleyin.
            </p>
            <div className="mt-2 space-y-2">
              {item.prices.map((price, pi) => (
                <div key={pi} className="flex flex-wrap items-end gap-2 rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
                  {item.prices.length > 1 && (
                    <Field label="Seçenek">
                      <input
                        value={price.label?.tr ?? ""}
                        placeholder="Ör. Porsiyon"
                        onChange={(e) => edit((d) => void (d.prices[pi].label = { tr: e.target.value, en: "" }))}
                        className={`${inputClass} w-40`}
                      />
                    </Field>
                  )}
                  <span className="w-28">
                    <PriceInput
                      label="Fiyat"
                      value={price.amount}
                      onChange={(amount) => edit((d) => void (d.prices[pi].amount = amount))}
                    />
                  </span>
                  {item.prices.length > 1 && (
                    <button
                      type="button"
                      aria-label="Bu fiyat satırını sil"
                      onClick={() =>
                        edit((d) => {
                          d.prices.splice(pi, 1);
                          if (d.prices.length === 1) delete d.prices[0].label;
                        })
                      }
                      className={buttonClass.icon}
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {item.prices.length < 6 && (
              <button
                type="button"
                onClick={() => edit((d) => void d.prices.push({ amount: 0, label: { tr: "", en: "" } }))}
                className={`${buttonClass.quiet} mt-2`}
              >
                <Plus className="size-4" aria-hidden="true" /> Seçenek ekle
              </button>
            )}
          </fieldset>

          <Chips
            label="Etiketler"
            options={tagIds.map((id) => ({ id, label: tags[id].tr }))}
            selected={item.tags ?? []}
            onChange={(next) => edit((d) => void (d.tags = next))}
          />
          <Chips
            label="İçerdiği alerjenler (sitede gösterilmez; müşteri sorarsa buradan bakılır)"
            options={allergenIds.map((id) => ({ id, label: allergens[id].tr }))}
            selected={item.allergens}
            onChange={(next) => edit((d) => void (d.allergens = next))}
          />

          <ItemPairingField
            key={item.id}
            content={content}
            item={item}
            dessert={category.layout === "cards"}
            onChange={(next) => edit((d) => void (next === undefined ? delete d.pairing : (d.pairing = next)))}
          />

          <Field label="Kategori">
            <select
              value={category.id}
              onChange={(e) =>
                update((draft) => {
                  const [moved] = draft.menu[ci].items.splice(ii, 1);
                  draft.menu.find((c) => c.id === e.target.value)?.items.push(moved);
                })
              }
              className={inputClass}
            >
              {content.menu.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.tr || "Adsız kategori"}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zumrut-900 p-3 ring-1 ring-white/10">
            <Toggle
              checked={item.available !== false}
              onChange={(on) => edit((d) => void (on ? delete d.available : (d.available = false)))}
              label="Menüde göster"
              showLabel
            />
            <span className="flex gap-2">
              <button
                type="button"
                aria-label="Yukarı taşı"
                disabled={ii === 0}
                onClick={() => update((draft) => move(draft.menu[ci].items, ii, ii - 1))}
                className={buttonClass.icon}
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Aşağı taşı"
                disabled={ii === category.items.length - 1}
                onClick={() => update((draft) => move(draft.menu[ci].items, ii, ii + 1))}
                className={buttonClass.icon}
              >
                <ArrowDown className="size-4" />
              </button>
            </span>
          </div>

          <details className="rounded-xl bg-zumrut-900 p-3 ring-1 ring-white/10">
            <summary className="cursor-pointer text-sm font-bold">Çarkta görünen kısa ad (isteğe bağlı)</summary>
            <div className="mt-3">
              <Bilingual
                label="Kısa ad"
                value={item.shortName}
                onChange={(shortName) =>
                  edit((d) => void (shortName.tr || shortName.en ? (d.shortName = shortName) : delete d.shortName))
                }
              />
            </div>
          </details>

          <button
            type="button"
            onClick={() => {
              if (!window.confirm(`"${item.name.tr || "Bu ürün"}" silinsin mi?`)) return;
              update((draft) => void draft.menu[ci].items.splice(ii, 1));
            }}
            className={buttonClass.danger}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Ürünü sil
          </button>
        </>
      )}
    </ModalShell>
  );
}

function CategoryDialog({
  content,
  update,
  categoryId,
  onClose,
}: {
  content: SiteContent;
  update: Update;
  categoryId: string | null;
  onClose: () => void;
}) {
  const ci = content.menu.findIndex((c) => c.id === categoryId);
  const category = content.menu[ci];
  const edit = (change: (draft: MenuCategory) => void) => update((draft) => change(draft.menu[ci]));

  return (
    <ModalShell open={Boolean(category)} title={category?.name.tr || "Yeni kategori"} onClose={onClose}>
      {category && (
        <>
          <Bilingual
            label="Kategori adı"
            value={category.name}
            placeholder="Ör. Künefeler"
            onChange={(name) => edit((d) => void (d.name = name))}
          />
          <Bilingual
            label="Kısa açıklama (isteğe bağlı)"
            value={category.description}
            onChange={(description) =>
              edit((d) => void (description.tr || description.en ? (d.description = description) : delete d.description))
            }
          />
          <fieldset>
            <legend className="text-sm font-bold text-krem-100">Görünüm</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["cards", "Kartlar", "Tatlılar için: büyük kartlar, yüklenen fotoğrafla."],
                  ["list", "Liste", "İçecekler için: fotoğrafsız, kısa satırlar."],
                ] as const
              ).map(([value, title, hint]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={category.layout === value}
                  onClick={() => edit((d) => void (d.layout = value))}
                  className={`rounded-xl p-3 text-start ring-1 transition ${
                    category.layout === value ? "bg-karamel-300 text-zumrut-950 ring-karamel-300" : "bg-white/5 ring-white/15 hover:bg-white/10"
                  }`}
                >
                  <span className="block text-sm font-extrabold">{title}</span>
                  <span className="mt-0.5 block text-xs opacity-75">{hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            onClick={() => {
              const count = category.items.length;
              const question = count
                ? `"${category.name.tr}" kategorisi ve içindeki ${count} ürün silinsin mi?`
                : `"${category.name.tr || "Bu kategori"}" silinsin mi?`;
              if (window.confirm(question)) update((draft) => void draft.menu.splice(ci, 1));
            }}
            className={buttonClass.danger}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Kategoriyi sil
          </button>
        </>
      )}
    </ModalShell>
  );
}

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
/** The ending each month name takes: Ocak'tan, Nisan'dan, Eylül'den. */
const FROM = ["tan", "tan", "tan", "dan", "tan", "dan", "dan", "tan", "den", "den", "dan", "tan"];
/** "12 Ekim'den beri" for a "Bugün yok" left on from an earlier day, so a forgotten one is noticed. */
function sinceLabel(day: string, today: string) {
  if (day === today) return "Bugün yok";
  const [, month, date] = day.split("-").map(Number);
  return `${date} ${MONTHS[month - 1]}'${FROM[month - 1]} beri yok`;
}

/**
 * @param today The shop's working day (YYYY-MM-DD). A dish marked "Bugün yok" carries the day it was
 * marked and stays that way until it is taken off here.
 */
export function MenuEditor({ content, update, today }: { content: SiteContent; update: Update; today: string }) {
  const [itemId, setItemId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const close = () => {
    setItemId(null);
    setCategoryId(null);
    update(settleIds);
  };
  const soldOutNow = content.menu.flatMap((c) => c.items).filter((i) => i.soldOutSince && i.available !== false);

  return (
    <div className="space-y-4">
      {soldOutNow.length > 0 && (
        <div className={`${noteClass} flex flex-wrap items-center gap-3 p-4`}>
          <CalendarX2 className="size-5 shrink-0 text-amber-300" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm leading-relaxed">
            <b>Bugün yok:</b> {soldOutNow.map((i) => i.name.tr).join(", ")}.{" "}
            <span className="text-amber-100/70">Siz geri alana kadar menüde “Bugün yok” yazar.</span>
          </p>
          <button
            type="button"
            onClick={() =>
              update((draft) => {
                for (const i of draft.menu.flatMap((c) => c.items)) delete i.soldOutSince;
              })
            }
            className={buttonClass.quiet}
          >
            <Undo2 className="size-4" aria-hidden="true" /> Hepsi var
          </button>
        </div>
      )}
      {content.menu.map((category, ci) => (
        <section key={category.id} className={`${cardClass} overflow-hidden`}>
          <header className="flex items-center gap-2 border-b border-karamel-300/15 bg-gradient-to-r from-zumrut-800 to-zumrut-900 px-3 py-2.5 text-krem-50">
            <h2 className="min-w-0 flex-1 truncate text-base font-extrabold">
              {category.name.tr || "Adsız kategori"}
              <span className="ms-2 text-xs font-semibold text-karamel-300/80">{category.items.length} ürün</span>
            </h2>
            <button
              type="button"
              aria-label={`${category.name.tr} kategorisini yukarı taşı`}
              disabled={ci === 0}
              onClick={() => update((draft) => move(draft.menu, ci, ci - 1))}
              className="grid size-9 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-30"
            >
              <ArrowUp className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`${category.name.tr} kategorisini aşağı taşı`}
              disabled={ci === content.menu.length - 1}
              onClick={() => update((draft) => move(draft.menu, ci, ci + 1))}
              className="grid size-9 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-30"
            >
              <ArrowDown className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCategoryId(category.id)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/5 px-3 text-sm font-bold text-karamel-300 ring-1 ring-karamel-300/30 hover:bg-karamel-300/10"
            >
              <Pencil className="size-3.5" aria-hidden="true" /> Düzenle
            </button>
          </header>

          <ul className="divide-y divide-white/[0.07]">
            {category.items.map((item, ii) => {
              const hidden = item.available === false;
              const soldOut = !hidden && item.soldOutSince !== undefined;
              return (
                <li
                  key={item.id}
                  className={`flex gap-3 p-3 ${hidden ? "bg-black/15" : soldOut ? "bg-amber-300/[0.06]" : ""}`}
                >
                  <span
                    className={`relative size-14 shrink-0 overflow-hidden rounded-xl bg-zumrut-950 ${hidden ? "opacity-50" : ""}`}
                  >
                    {item.image ? (
                      <Photo photo={item.image} alt="" sizes="56px" />
                    ) : (
                      <ImageIcon className="absolute inset-0 m-auto size-5 text-krem-100/25" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className={`min-w-0 flex-1 font-bold leading-snug ${hidden ? "text-krem-100/45" : ""}`}>
                        {item.name.tr || "Adsız ürün"}
                        {hidden && (
                          <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 align-middle text-[11px] font-extrabold text-krem-100/70">
                            <EyeOff className="size-3" aria-hidden="true" /> Gizli
                          </span>
                        )}
                        {soldOut && (
                          <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-amber-300/15 px-2 py-0.5 align-middle text-[11px] font-extrabold text-amber-200 ring-1 ring-amber-300/30">
                            <CalendarX2 className="size-3" aria-hidden="true" /> {sinceLabel(item.soldOutSince!, today)}
                          </span>
                        )}
                      </p>
                      <button
                        type="button"
                        aria-label={`${item.name.tr} ürününü düzenle`}
                        onClick={() => setItemId(item.id)}
                        className={buttonClass.icon}
                      >
                        <Pencil className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                      {item.prices.length === 1 ? (
                        <span className="w-28">
                          <PriceInput
                            label={`${item.name.tr} fiyatı`}
                            value={item.prices[0].amount}
                            onChange={(amount) => update((draft) => void (draft.menu[ci].items[ii].prices[0].amount = amount))}
                          />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setItemId(item.id)}
                          className="text-start text-sm font-bold text-karamel-300 underline decoration-karamel-300/40 underline-offset-4"
                        >
                          {item.prices.map((p) => `${p.label?.tr || "?"} ${formatTl(p.amount)}`).join(" · ")}
                        </button>
                      )}
                      <Toggle
                        checked={!hidden}
                        onChange={(on) =>
                          update((draft) => {
                            const target = draft.menu[ci].items[ii];
                            if (on) delete target.available;
                            else target.available = false;
                          })
                        }
                        label="Menüde"
                        showLabel
                      />
                      {!hidden && (
                        <button
                          type="button"
                          aria-pressed={soldOut}
                          aria-label={`${item.name.tr}: bugün yok`}
                          onClick={() =>
                            update((draft) => {
                              const target = draft.menu[ci].items[ii];
                              if (soldOut) delete target.soldOutSince;
                              else target.soldOutSince = serviceDay();
                            })
                          }
                          className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-extrabold transition active:scale-[.97] ${
                            soldOut
                              ? "bg-amber-400 text-zumrut-950 ring-1 ring-amber-500"
                              : "bg-white/5 text-krem-100 ring-1 ring-white/15 hover:bg-white/10"
                          }`}
                        >
                          {soldOut ? (
                            <Check className="size-4" aria-hidden="true" />
                          ) : (
                            <CalendarX2 className="size-4" aria-hidden="true" />
                          )}
                          Bugün yok
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-white/[0.07] p-3">
            <button
              type="button"
              onClick={() => {
                const item = blankItem();
                update((draft) => void draft.menu[ci].items.push(item));
                setItemId(item.id);
              }}
              className={`${buttonClass.quiet} w-full`}
            >
              <Plus className="size-4" aria-hidden="true" /> Bu kategoriye ürün ekle
            </button>
          </div>
        </section>
      ))}

      <button
        type="button"
        onClick={() => {
          const category = blankCategory();
          update((draft) => void draft.menu.push(category));
          setCategoryId(category.id);
        }}
        className={`${buttonClass.quiet} w-full border-2 border-dashed border-karamel-300/30 ring-0`}
      >
        <Plus className="size-4" aria-hidden="true" /> Yeni kategori ekle
      </button>

      <ItemDialog content={content} update={update} itemId={itemId} onClose={close} />
      <CategoryDialog content={content} update={update} categoryId={categoryId} onClose={close} />
    </div>
  );
}
