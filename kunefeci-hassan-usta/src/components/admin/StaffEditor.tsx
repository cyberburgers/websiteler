"use client";

import { Check, Copy, ExternalLink, QrCode } from "lucide-react";
import { useState } from "react";
import type { SiteContent } from "@/lib/content";
import { Section, Toggle, buttonClass } from "./fields";

export type StaffSetup = { key: string; url: string; qrSvg: string; enabled: boolean };

/**
 * Table service: ordering on or off, where the waiter screen is (address and QR code for the counter
 * tablet), and how calls and orders reach this panel.
 */
export function StaffEditor({
  staff,
  content,
  update,
}: {
  staff: StaffSetup;
  content: SiteContent;
  update: (change: (draft: SiteContent) => void) => void;
}) {
  const [copied, setCopied] = useState(false);
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
        hint="Masa QR kartıyla açılan menüde ürünlerin yanında “Ekle” çıkar. Müşteri sepetini gönderir; sipariş garson ekranına ve bu panele sesli düşer."
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 ring-1 ring-zumrut-800/10">
          <Toggle
            checked={content.tableOrders !== false}
            onChange={(on) => update((d) => void (on ? delete d.tableOrders : (d.tableOrders = false)))}
            label="Müşteriler masadan sipariş verebilsin"
            showLabel
          />
        </div>
        <ul className="mt-3 list-disc space-y-1 ps-5 text-sm leading-relaxed text-zumrut-900/75">
          <li>
            Sipariş gelince <b>Onayla</b>: müşterinin telefonunda “Hazırlanıyor” yazar. Masaya götürünce{" "}
            <b>Teslim edildi</b>.
          </li>
          <li>Fiyatlar menüden hesaplanır; “Bugün yok” denen ürün sipariş edilemez.</li>
          <li>Ödeme her zamanki gibi masada ya da kasada alınır.</li>
          <li>Kapalıyken müşteri yalnızca garson çağırabilir. Değişiklik için alttan Kaydet.</li>
        </ul>
      </Section>

      <Section
        title="Bu panelde"
        hint="Panel açıkken çağrılar ve siparişler burada da gelir: üstte “Masa 7 · Sipariş” çıkar ve cihaz öter."
      >
        <p className="text-sm leading-relaxed text-zumrut-900/75">
          Sesin çıkması için panelde herhangi bir yere bir kez dokunmanız yeterli; üstteki düğme <b>“Ses açık”</b> olur.
          Telefon kilitlenirse ya da panel kapatılırsa ses gelmez; dükkânda sürekli açık duracak bir cihaz için aşağıdaki
          garson ekranını kullanın.
        </p>
      </Section>

      <Section
        title="Garson ekranı"
        hint="Kasadaki tablette ya da telefonda açık durur. Çağrı ya da sipariş gelince sesli uyarı verir; siparişler kalemleri, notu ve tutarıyla görünür."
      >
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
              Açılınca <b>“Sesi aç”</b>a bir kez dokunun ve sayfayı açık bırakın. Bağlantıyı yalnızca personelle paylaşın;
              panel şifresini değiştirirseniz bağlantı da değişir.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href={staff.url} target="_blank" rel="noopener" className={buttonClass.primary}>
                Garson ekranını aç <ExternalLink className="size-4" aria-hidden="true" />
              </a>
              <button type="button" onClick={copy} className={buttonClass.quiet}>
                {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                {copied ? "Kopyalandı" : "Bağlantıyı kopyala"}
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Müşteri tuşu" hint="Menünün altında, sayfa kayarken de görünen “Garson çağır” tuşu.">
        <p className="text-sm leading-relaxed text-zumrut-900/75">
          Tuş yalnızca <b>masa QR kartıyla</b> açılan menüde çıkar, çünkü garsonun hangi masaya gideceğini bilmesi gerekir.
          Her masaya kendi numaralı kartını koyun.
        </p>
        <a href="/tr/qr?masa=1-12" target="_blank" rel="noopener" className={buttonClass.quiet}>
          Masa kartlarını bastır <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </Section>
    </div>
  );
}
