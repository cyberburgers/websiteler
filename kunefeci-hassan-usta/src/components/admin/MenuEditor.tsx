"use client";

import { ArrowDown, ArrowUp, CalendarX2, Check, EyeOff, Pencil, Plus, Trash2, Undo2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/ui";
import { allergenIds, allergens, tagIds, tags, type MenuCategory, type MenuItem } from "@/content/menu";
import type { SiteContent } from "@/lib/content";
import { Bilingual, Field, PhotoField, Toggle, buttonClass, inputClass } from "./fields";
import { TEMP_PREFIX, allIds, blankCategory, blankItem, formatTl, move, uniqueId } from "./menu-utils";

type Update = (change: (draft: SiteContent) => void) => void;

const digits = (value: string) => Number(value.replace(/\D/g, "").slice(0, 7) || 0);

function PriceInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <span className="relative block">
      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zumrut-900/50">
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
      className="m-0 h-dvh max-h-none w-full max-w-none bg-krem-100 p-0 text-zumrut-900 backdrop:bg-zumrut-950/60 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-3xl"
    >
      {open && (
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zumrut-800/10 bg-krem-100/95 px-4 py-3 backdrop-blur">
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
      <legend className="text-sm font-bold text-zumrut-900">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? selected.filter((s) => s !== o.id) : [...selected, o.id])}
              className={`h-10 rounded-full px-4 text-sm font-bold transition-colors ${
                on ? "bg-zumrut-800 text-krem-50" : "bg-white text-zumrut-900 ring-1 ring-zumrut-800/15"
              }`}
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
            <legend className="text-sm font-bold text-zumrut-900">Fiyat</legend>
            <p className="text-xs text-zumrut-900/55">
              Tek fiyat yeterli. Porsiyon / 1 kg gibi seçenekler için yeni satır ekleyin.
            </p>
            <div className="mt-2 space-y-2">
              {item.prices.map((price, pi) => (
                <div key={pi} className="flex flex-wrap items-end gap-2 rounded-xl bg-white/60 p-2 ring-1 ring-zumrut-800/10">
                  {item.prices.length > 1 && (
                    <>
                      <Field label="Seçenek (Türkçe)">
                        <input
                          value={price.label?.tr ?? ""}
                          placeholder="Ör. Porsiyon"
                          onChange={(e) =>
                            edit((d) => void (d.prices[pi].label = { tr: e.target.value, en: d.prices[pi].label?.en ?? "" }))
                          }
                          className={`${inputClass} w-36`}
                        />
                      </Field>
                      <Field label="İngilizce">
                        <input
                          value={price.label?.en ?? ""}
                          placeholder="Portion"
                          onChange={(e) =>
                            edit((d) => void (d.prices[pi].label = { tr: d.prices[pi].label?.tr ?? "", en: e.target.value }))
                          }
                          className={`${inputClass} w-32`}
                        />
                      </Field>
                    </>
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
            label="İçerdiği alerjenler"
            options={allergenIds.map((id) => ({ id, label: allergens[id].tr }))}
            selected={item.allergens}
            onChange={(next) => edit((d) => void (d.allergens = next))}
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

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 ring-1 ring-zumrut-800/10">
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

          <details className="rounded-xl bg-white p-3 ring-1 ring-zumrut-800/10">
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
            <legend className="text-sm font-bold text-zumrut-900">Görünüm</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["cards", "Fotoğraflı", "Tatlılar için: her ürün fotoğrafıyla."],
                  ["list", "Liste", "İçecekler için: fotoğrafsız, kısa satırlar."],
                ] as const
              ).map(([value, title, hint]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={category.layout === value}
                  onClick={() => edit((d) => void (d.layout = value))}
                  className={`rounded-xl p-3 text-start ring-1 transition ${
                    category.layout === value ? "bg-zumrut-800 text-krem-50 ring-zumrut-800" : "bg-white ring-zumrut-800/15"
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

/**
 * @param today The shop's working day (YYYY-MM-DD). A dish marked "Bugün yok" carries this date, so it is
 * back on the menu by itself the next morning.
 */
export function MenuEditor({ content, update, today }: { content: SiteContent; update: Update; today: string }) {
  const [itemId, setItemId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const close = () => {
    setItemId(null);
    setCategoryId(null);
    update(settleIds);
  };
  const soldOutToday = content.menu.flatMap((c) => c.items).filter((i) => i.soldOutOn === today);

  return (
    <div className="space-y-4">
      {soldOutToday.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <CalendarX2 className="size-5 shrink-0 text-amber-700" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-amber-950">
            <b>Bugün yok:</b> {soldOutToday.map((i) => i.name.tr).join(", ")}.{" "}
            <span className="text-amber-900/80">Yarın sabah kendiliğinden menüye döner.</span>
          </p>
          <button
            type="button"
            onClick={() =>
              update((draft) => {
                for (const i of draft.menu.flatMap((c) => c.items)) delete i.soldOutOn;
              })
            }
            className={buttonClass.quiet}
          >
            <Undo2 className="size-4" aria-hidden="true" /> Hepsi var
          </button>
        </div>
      )}
      {content.menu.map((category, ci) => (
        <section key={category.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-zumrut-800/10">
          <header className="flex items-center gap-2 border-b border-zumrut-800/10 bg-zumrut-800 px-3 py-2.5 text-krem-50">
            <h2 className="min-w-0 flex-1 truncate text-base font-extrabold">
              {category.name.tr || "Adsız kategori"}
              <span className="ms-2 text-xs font-semibold text-krem-100/70">{category.items.length} ürün</span>
            </h2>
            <button
              type="button"
              aria-label={`${category.name.tr} kategorisini yukarı taşı`}
              disabled={ci === 0}
              onClick={() => update((draft) => move(draft.menu, ci, ci - 1))}
              className="grid size-9 place-items-center rounded-lg bg-white/10 disabled:opacity-30"
            >
              <ArrowUp className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`${category.name.tr} kategorisini aşağı taşı`}
              disabled={ci === content.menu.length - 1}
              onClick={() => update((draft) => move(draft.menu, ci, ci + 1))}
              className="grid size-9 place-items-center rounded-lg bg-white/10 disabled:opacity-30"
            >
              <ArrowDown className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCategoryId(category.id)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-sm font-bold"
            >
              <Pencil className="size-3.5" aria-hidden="true" /> Düzenle
            </button>
          </header>

          <ul className="divide-y divide-zumrut-800/10">
            {category.items.map((item, ii) => {
              const hidden = item.available === false;
              const soldOut = !hidden && item.soldOutOn === today;
              return (
                <li
                  key={item.id}
                  className={`flex gap-3 p-3 ${hidden ? "bg-krem-100/70" : soldOut ? "bg-amber-50/80" : ""}`}
                >
                  <span
                    className={`relative size-14 shrink-0 overflow-hidden rounded-xl bg-krem-200 ${hidden ? "opacity-50" : ""}`}
                  >
                    {item.image && <Photo photo={item.image} alt="" sizes="56px" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className={`min-w-0 flex-1 font-bold leading-snug ${hidden ? "text-zumrut-900/50" : ""}`}>
                        {item.name.tr || "Adsız ürün"}
                        {hidden && (
                          <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-zumrut-900/10 px-2 py-0.5 align-middle text-[11px] font-extrabold text-zumrut-900/70">
                            <EyeOff className="size-3" aria-hidden="true" /> Gizli
                          </span>
                        )}
                        {soldOut && (
                          <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-amber-200 px-2 py-0.5 align-middle text-[11px] font-extrabold text-amber-950">
                            <CalendarX2 className="size-3" aria-hidden="true" /> Bugün yok
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
                          className="text-start text-sm font-bold text-zumrut-800 underline decoration-zumrut-800/30 underline-offset-4"
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
                              if (soldOut) delete target.soldOutOn;
                              else target.soldOutOn = today;
                            })
                          }
                          className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-extrabold transition active:scale-[.97] ${
                            soldOut
                              ? "bg-amber-400 text-zumrut-950 ring-1 ring-amber-500"
                              : "bg-white text-zumrut-900 ring-1 ring-zumrut-800/20 hover:bg-krem-100"
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
          <div className="border-t border-zumrut-800/10 p-3">
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
        className={`${buttonClass.quiet} w-full border-2 border-dashed border-zumrut-800/20 ring-0`}
      >
        <Plus className="size-4" aria-hidden="true" /> Yeni kategori ekle
      </button>

      <ItemDialog content={content} update={update} itemId={itemId} onClose={close} />
      <CategoryDialog content={content} update={update} categoryId={categoryId} onClose={close} />
    </div>
  );
}
