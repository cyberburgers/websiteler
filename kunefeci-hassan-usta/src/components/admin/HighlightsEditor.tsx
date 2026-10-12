"use client";

import { Megaphone } from "lucide-react";
import type { SiteContent } from "@/lib/content";
import { Bilingual, Field, Section, buttonClass, inputClass } from "./fields";

type Update = (change: (draft: SiteContent) => void) => void;

export function HighlightsEditor({ content, update }: { content: SiteContent; update: Update }) {
  const notice = content.notice ?? { tr: "", en: "" };
  const signature = content.menu.flatMap((c) => c.items).find((i) => i.tags?.includes("imza"));

  return (
    <div className="space-y-4">
      <Section title="Ustanın önerisi" hint="Ana sayfada, aramanın altında büyük kartla gösterilen ürün.">
        <Field label="Önerilen ürün">
          <select
            value={content.featuredId ?? ""}
            onChange={(e) =>
              update((d) => void (e.target.value ? (d.featuredId = e.target.value) : delete d.featuredId))
            }
            className={inputClass}
          >
            <option value="">Otomatik{signature ? ` (${signature.name.tr})` : ""}</option>
            {content.menu.map((c) => (
              <optgroup key={c.id} label={c.name.tr}>
                {c.items
                  .filter((i) => i.available !== false && !i.id.startsWith("yeni-"))
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name.tr}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </Field>
      </Section>

      <Section
        title="Duyuru"
        hint="Ana sayfanın üstünde yeşil bir kutuda görünür. Ör. “Bayramın ilk günü kapalıyız.” Boş bırakılırsa görünmez."
      >
        <Bilingual
          label="Duyuru metni"
          multiline
          value={notice}
          onChange={(next) => update((d) => void (next.tr || next.en ? (d.notice = next) : delete d.notice))}
        />
        {notice.tr && (
          <>
            <p className="flex items-start gap-2.5 rounded-2xl bg-fistik-300 px-4 py-3 text-sm font-bold leading-snug text-zumrut-925">
              <Megaphone className="mt-px size-[18px] shrink-0" aria-hidden="true" />
              {notice.tr}
            </p>
            <button type="button" onClick={() => update((d) => void delete d.notice)} className={buttonClass.danger}>
              Duyuruyu kaldır
            </button>
          </>
        )}
      </Section>
    </div>
  );
}
