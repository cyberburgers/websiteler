"use client";

import { AlertTriangle, BellRing, CheckCircle2, ExternalLink, LogOut, QrCode } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { logoutAction, saveContentAction } from "@/app/yonetim/actions";
import { Logo } from "@/components/Logo";
import type { SiteContent } from "@/lib/content";
import { usePanelCalls } from "./CallAlerts";
import { buttonClass, headerButton, noteClass } from "./fields";
import { HighlightsEditor } from "./HighlightsEditor";
import { InfoEditor } from "./InfoEditor";
import { MenuEditor } from "./MenuEditor";
import { OrdersBoard } from "./OrdersBoard";
import { PairingEditor } from "./PairingEditor";
import { StaffEditor, type StaffSetup } from "./StaffEditor";

type Tab = "siparis" | "menu" | "oneri" | "duyuru" | "masalar" | "isletme";
const TABS: { id: Tab; label: string }[] = [
  { id: "siparis", label: "Siparişler" },
  { id: "menu", label: "Menü" },
  { id: "oneri", label: "Öneriler" },
  { id: "duyuru", label: "Duyuru" },
  { id: "masalar", label: "Masalar" },
  { id: "isletme", label: "İşletme bilgileri" },
];

type Props = {
  initial: SiteContent;
  /** False on Vercel before a Blob store is connected: the panel can look but not save. */
  writable: boolean;
  /** Null until a panel password is set (the key for the tables' calls comes with it). */
  staff: StaffSetup | null;
  /** The site's own address, which the table codes lead to. */
  siteUrl: string;
  /** The shop's working day, for "Bugün yok". */
  today: string;
};

/**
 * After a save, the first visit to each page still gets the old copy while the new one is built.
 * Opening the guest pages once from here takes that first visit, so guests see the change.
 */
function warmPages() {
  for (const locale of ["tr", "en"]) {
    for (const path of ["", "/ara"]) void fetch(`/${locale}${path}`, { cache: "no-store" }).catch(() => {});
  }
}

const savedTime = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso))
    : null;

export function AdminApp({ initial, writable, staff, siteUrl, today }: Props) {
  const [content, setContent] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  // During service the panel opens on the orders; before calls are set up there are none to show.
  const [tab, setTab] = useState<Tab>(staff?.enabled ? "siparis" : "menu");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, startSaving] = useTransition();
  const dirty = JSON.stringify(content) !== saved;
  const staffSetup = staff;
  const calls = usePanelCalls(staffSetup?.enabled ? staffSetup.key : null);
  const waiting = calls.list.filter((c) => !c.seenAt).length;
  const tabs = TABS.filter((t) => t.id !== "siparis" || staffSetup?.enabled);

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (change: (draft: SiteContent) => void) => {
    setMessage(null);
    setContent((current) => {
      const draft = structuredClone(current);
      change(draft);
      return draft;
    });
  };

  const save = () =>
    startSaving(async () => {
      const sent = content;
      const result = await saveContentAction(sent, JSON.parse(saved).savedAt ?? null).catch(() => ({
        ok: false as const,
        error: "Sunucuya ulaşılamadı. İnternet bağlantısını kontrol edip tekrar deneyin.",
      }));
      if (result.ok) {
        const stamp = { savedAt: result.savedAt, menuUpdatedAt: result.menuUpdatedAt };
        // Changes made while saving are kept (and still show as unsaved), not replaced by what was sent.
        setContent((current) => ({ ...current, ...stamp }));
        setSaved(JSON.stringify({ ...sent, ...stamp }));
        setMessage({ ok: true, text: "Kaydedildi. Değişiklikler sitede görünüyor." });
        warmPages();
      } else {
        setMessage({ ok: false, text: result.error });
      }
    });

  const discard = () => {
    if (!window.confirm("Kaydedilmemiş değişiklikler silinsin mi?")) return;
    setContent(JSON.parse(saved));
    setMessage(null);
  };

  const lastSaved = savedTime(JSON.parse(saved).savedAt);

  return (
    <div className="min-h-dvh pb-32">
      {/* One row on a phone: the logo, the title, and the buttons as icons (with their names from tablet width). */}
      <header className="bg-zumrut-950 text-krem-50">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-4 pb-2 pt-3 sm:gap-4">
          <Logo id="panel-logo" className="hidden h-auto w-11 shrink-0 sm:block" />
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-[17px] font-semibold leading-tight sm:text-lg">Yönetim paneli</p>
            <p className="truncate text-xs text-krem-100/65">
              {lastSaved ? `Son kayıt ${lastSaved}` : "Henüz panelden kayıt yapılmadı"}
            </p>
          </div>
          <nav aria-label="Panel" className="flex shrink-0 items-center gap-1.5 text-sm font-bold">
            {calls.toggle}
            <a href="/tr" target="_blank" rel="noopener" aria-label="Siteyi aç" title="Siteyi aç" className={headerButton}>
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Siteyi aç</span>
            </a>
            <a href="/tr/qr" target="_blank" rel="noopener" aria-label="Masa QR kartları" title="Masa QR kartları" className={headerButton}>
              <QrCode className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">QR</span>
            </a>
            <form action={logoutAction}>
              <button type="submit" aria-label="Çıkış" title="Çıkış" className={headerButton}>
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </form>
          </nav>
        </div>
      </header>
      {/* The sections stay in reach while scrolling down a long menu. */}
      <div className="sticky top-0 z-40 border-b border-karamel-300/10 bg-zumrut-950/95 shadow-[0_10px_24px_-18px_rgba(0,0,0,.8)] backdrop-blur">
        <div role="tablist" aria-label="Bölümler" className="no-scrollbar mx-auto flex max-w-3xl gap-1 overflow-x-auto px-3 py-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold transition-colors ${
                tab === t.id ? "bg-karamel-300 text-zumrut-950" : "text-krem-100/70 hover:bg-white/5 hover:text-krem-50"
              }`}
            >
              {t.label}
              {t.id === "siparis" && waiting > 0 && (
                <span
                  className={`grid min-w-5 place-items-center rounded-full px-1.5 text-xs font-extrabold tabular-nums ${
                    tab === t.id ? "bg-zumrut-950 text-karamel-300" : "bg-amber-400 text-zumrut-950"
                  }`}
                >
                  {waiting}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Elsewhere in the panel, one slim line says something is waiting (the device chimes as well). */}
        {tab !== "siparis" && waiting > 0 && (
          <button
            type="button"
            onClick={() => setTab("siparis")}
            data-bekleyen=""
            className="flex w-full items-center justify-center gap-2 bg-amber-300 px-4 py-2 text-sm font-extrabold text-zumrut-950"
          >
            <BellRing className="size-4 animate-bell" aria-hidden="true" />
            {waiting} bekleyen sipariş ya da çağrı · Göster
          </button>
        )}
      </div>


      <main className="mx-auto max-w-3xl px-3 pt-4 sm:px-4">
        {!writable && (
          <p className={`${noteClass} mb-4 flex gap-2.5 p-4 text-sm leading-relaxed`}>
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <span>
              Kaydetme henüz kurulmadı: Vercel&apos;de projeye <b>Blob</b> depolaması bağlanmalı. Değişiklik yapabilirsiniz
              ama kaydedemezsiniz. Adımlar README dosyasında.
            </span>
          </p>
        )}
        {tab === "siparis" && (
          <OrdersBoard calls={calls.list} now={calls.now} online={calls.online} answer={calls.answer} />
        )}
        {tab === "menu" && <MenuEditor content={content} update={update} today={today} />}
        {tab === "oneri" && <PairingEditor content={content} update={update} />}
        {tab === "duyuru" && <HighlightsEditor content={content} update={update} />}
        {tab === "masalar" && staffSetup && (
          <StaffEditor
            staff={staffSetup}
            siteUrl={siteUrl}
            content={content}
            update={update}
          />
        )}
        {tab === "isletme" && <InfoEditor content={content} update={update} />}
      </main>

      {(dirty || message) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-karamel-300/20 bg-zumrut-925/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-16px_36px_-18px_rgba(0,0,0,.9)] backdrop-blur">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3">
            <p
              role="status"
              className={`min-w-0 flex-1 text-sm font-bold ${
                message ? (message.ok ? "text-fistik-300" : "text-red-300") : "text-krem-100"
              }`}
            >
              {message ? (
                <span className="inline-flex items-start gap-1.5">
                  {message.ok ? (
                    <CheckCircle2 className="mt-px size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="mt-px size-4 shrink-0" aria-hidden="true" />
                  )}
                  {message.text}
                </span>
              ) : (
                "Kaydedilmemiş değişiklikler var."
              )}
            </p>
            {dirty && (
              <span className="flex gap-2">
                <button type="button" onClick={discard} disabled={saving} className={buttonClass.quiet}>
                  Vazgeç
                </button>
                <button type="button" onClick={save} disabled={saving || !writable} className={`${buttonClass.primary} px-6`}>
                  {saving ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
