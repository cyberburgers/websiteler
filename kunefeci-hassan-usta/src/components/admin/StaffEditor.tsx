"use client";

import type { SiteContent } from "@/lib/content";
import { Field, Section, Toggle, inputClass, noteClass } from "./fields";
import { TableCodes } from "./TableCodes";

/** The key this panel reads and answers the tables' calls and orders with; empty until calls are set up. */
export type StaffSetup = { key: string; enabled: boolean };

/** Table service: ordering on or off, the number of tables and each table's QR code. */
export function StaffEditor({
  staff,
  siteUrl,
  content,
  update,
}: {
  staff: StaffSetup;
  /** The site's own address, which the table codes lead to. */
  siteUrl: string;
  content: SiteContent;
  update: (change: (draft: SiteContent) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {!staff.enabled && (
        <p className={`${noteClass} p-4 text-sm leading-relaxed`}>
          Garson çağırma henüz kurulmadı: Vercel&apos;de projeye <b>Upstash Redis</b> bağlanmalı. O zamana kadar müşteriler
          tuşu görmez. Adımlar README dosyasında.
        </p>
      )}

      <Section title="Masadan sipariş">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zumrut-950/50 p-3 ring-1 ring-white/10">
          <Toggle
            checked={content.tableOrders !== false}
            onChange={(on) => update((d) => void (on ? delete d.tableOrders : (d.tableOrders = false)))}
            label="Müşteriler masadan sipariş verebilsin"
            showLabel
          />
        </div>
      </Section>

      <Section title="Masa karekodları">
        <Field label="Masa sayısı">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={999}
            value={content.tables ?? ""}
            placeholder="12"
            onChange={(e) => {
              const n = Math.floor(Number(e.target.value));
              update((d) => void (n >= 1 && n <= 999 ? (d.tables = n) : delete d.tables));
            }}
            className={`${inputClass} max-w-32 tabular-nums`}
          />
        </Field>
        <TableCodes siteUrl={siteUrl} count={Math.min(content.tables ?? 12, 60)} />
      </Section>
    </div>
  );
}
