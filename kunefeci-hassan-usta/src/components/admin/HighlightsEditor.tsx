"use client";

import { Megaphone } from "lucide-react";
import type { SiteContent } from "@/lib/content";
import { Bilingual, Section, buttonClass } from "./fields";

type Update = (change: (draft: SiteContent) => void) => void;

export function HighlightsEditor({ content, update }: { content: SiteContent; update: Update }) {
  const notice = content.notice ?? { tr: "", en: "" };

  return (
    <div className="space-y-4">
      <Section
        title="Duyuru"
        hint="Ana sayfanın üstünde yeşil bir kutuda görünür. Ör. “Bayramın ilk günü kapalıyız.” Boş bırakılırsa görünmez."
      >
        <Bilingual
          label="Duyuru metni"
          multiline
          value={notice}
          onChange={(next) => update((d) => void (next.tr ? (d.notice = next) : delete d.notice))}
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
