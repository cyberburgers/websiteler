"use client";

import { Check, Copy, ExternalLink, Loader2, QrCode, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { renewStaffKeyAction } from "@/app/yonetim/actions";
import type { SiteContent } from "@/lib/content";
import { Field, Section, Toggle, buttonClass, inputClass } from "./fields";
import { TableCodes } from "./TableCodes";

export type StaffSetup = { key: string; url: string; qrSvg: string; enabled: boolean };

/**
 * Table service: ordering on or off, where the waiter screen is (address and QR code for the counter
 * tablet), and how calls and orders reach this panel.
 */
export function StaffEditor({
  staff,
  onStaffChange,
  siteUrl,
  content,
  update,
}: {
  staff: StaffSetup;
  /** The site's own address, which the table codes lead to. */
  siteUrl: string;
  /** After "Yeni adres oluştur": the new address, also for this panel's own call alerts. */
  onStaffChange: (next: StaffSetup) => void;
  content: SiteContent;
  update: (change: (draft: SiteContent) => void) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [renewing, startRenew] = useTransition();
  const renew = () => {
    if (!window.confirm("Tabletteki eski adres çalışmayı bırakır; tableti yeni karekodla açmanız gerekir. Devam edilsin mi?")) {
      return;
    }
    startRenew(async () => {
      const next = await renewStaffKeyAction().catch(() => null);
      if (next?.key) onStaffChange(next);
      else window.alert("Yeni adres oluşturulamadı. İnternet bağlantısını kontrol edip tekrar deneyin.");
    });
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(staff.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // No clipboard; the address can still be selected by hand.
    }
  };

  return (
    <div className="space-y-4">
      {!staff.enabled && (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200">
          Garson çağırma henüz kurulmadı: Vercel&apos;de projeye <b>Upstash Redis</b> bağlanmalı. O zamana kadar müşteriler
          tuşu görmez. Adımlar README dosyasında.
        </p>
      )}

      <Section
        title="Masadan sipariş"
        hint="Masanın karekoduyla açılan menüde ürünlerin yanında “Ekle” çıkar; siparişler Siparişler sekmesine ve garson ekranına sesli düşer."
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 ring-1 ring-zumrut-800/10">
          <Toggle
            checked={content.tableOrders !== false}
            onChange={(on) => update((d) => void (on ? delete d.tableOrders : (d.tableOrders = false)))}
            label="Müşteriler masadan sipariş verebilsin"
            showLabel
          />
        </div>
      </Section>

      <Section
        title="Garson ekranı"
        hint="Kasadaki tablette ya da telefonda açık durur. Çağrı ya da sipariş gelince sesli uyarı verir; siparişler kalemleri, notu ve tutarıyla görünür."
      >
        {staff.url ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="mx-auto w-40 shrink-0 rounded-2xl bg-white p-3 ring-1 ring-zumrut-800/10 sm:mx-0 [&>svg]:h-auto [&>svg]:w-full"
              role="img"
              aria-label="Garson ekranının karekodu"
              dangerouslySetInnerHTML={{ __html: staff.qrSvg }}
            />
            <div className="min-w-0 flex-1 space-y-3 text-sm leading-relaxed text-zumrut-900/75">
              <p className="flex gap-2">
                <QrCode className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>Tabletin kamerasıyla bu karekodu okutun ya da bağlantıyı tablete gönderin.</span>
              </p>
              <p>
                Açılınca <b>“Sesi aç”</b>a bir kez dokunun ve sayfayı açık bırakın. Bağlantıyı yalnızca personelle paylaşın.
                Biri işten ayrılırsa ya da tablet kaybolursa <b>Yeni adres oluştur</b>: eski bağlantı hemen çalışmaz olur.
              </p>
              <div className="flex flex-wrap gap-2">
                <a href={staff.url} target="_blank" rel="noopener" className={buttonClass.primary}>
                  Garson ekranını aç <ExternalLink className="size-4" aria-hidden="true" />
                </a>
                <button type="button" onClick={copy} className={buttonClass.quiet}>
                  {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                  {copied ? "Kopyalandı" : "Bağlantıyı kopyala"}
                </button>
                <button type="button" onClick={renew} disabled={renewing} className={buttonClass.quiet}>
                  {renewing ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCw className="size-4" aria-hidden="true" />
                  )}
                  Yeni adres oluştur
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-zumrut-900/75">
            Garson ekranının adresi, garson çağırma kurulunca (yukarıdaki not) burada çıkar.
          </p>
        )}
      </Section>

      <Section
        title="Masa karekodları"
        hint="Her masanın kodu sabittir: masa numarası ve site adresi değişmedikçe hiç değişmez. Kaybolan kartı buradan yeniden basın."
      >
        <Field label="Masa sayısı" hint="Bundan büyük masa numarasıyla gelen çağrı ve sipariş kabul edilmez.">
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
