"use client";

import { AlertTriangle, CheckCircle2, ExternalLink, LogOut, QrCode } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { logoutAction, saveContentAction } from "@/app/yonetim/actions";
import type { SiteContent } from "@/lib/content";
import { usePanelCalls } from "./CallAlerts";
import { buttonClass } from "./fields";
import { HighlightsEditor } from "./HighlightsEditor";
import { InfoEditor } from "./InfoEditor";
import { MenuEditor } from "./MenuEditor";
import { StaffEditor, type StaffSetup } from "./StaffEditor";

type Tab = "menu" | "duyuru" | "garson" | "isletme";
const TABS: { id: Tab; label: string }[] = [
  { id: "menu", label: "Menü" },
  { id: "duyuru", label: "Duyuru" },
  { id: "garson", label: "Garson" },
  { id: "isletme", label: "İşletme bilgileri" },
];

type Props = {
  initial: SiteContent;
  /** False on Vercel before a Blob store is connected: the panel can look but not save. */
  writable: boolean;
  /** Null until a panel password is set (the waiter screen key comes from it). */
  staff: StaffSetup | null;
  /** The shop's working day, for "Bugün yok". */
  today: string;
};

/**
 * After a save, the first visit to each page still gets the old copy while the new one is built.
 * Opening the guest pages once from here takes that first visit, so guests see the change.
 */
function warmPages(content: SiteContent) {
  const paths = ["", "/ara", ...content.menu.filter((c) => c.items.length > 0).map((c) => `/menu/${c.id}`)];
  for (const locale of ["tr", "en"]) {
    for (const path of paths) void fetch(`/${locale}${path}`, { cache: "no-store" }).catch(() => {});
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

export function AdminApp({ initial, writable, staff, today }: Props) {
  const [content, setContent] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [tab, setTab] = useState<Tab>("menu");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, startSaving] = useTransition();
  const dirty = JSON.stringify(content) !== saved;
  const calls = usePanelCalls(staff?.enabled ? staff.key : null);

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
      const result = await saveContentAction(content, JSON.parse(saved).savedAt ?? null).catch(() => ({
        ok: false as const,
        error: "Sunucuya ulaşılamadı. İnternet bağlantısını kontrol edip tekrar deneyin.",
      }));
      if (result.ok) {
        const next = { ...content, savedAt: result.savedAt, menuUpdatedAt: result.menuUpdatedAt };
        setContent(next);
        setSaved(JSON.stringify(next));
        setMessage({ ok: true, text: "Kaydedildi. Değişiklikler sitede görünüyor." });
        warmPages(next);
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
      <header className="bg-zumrut-925 text-krem-50">
        <div className="mx-auto flex max-w-3xl flex-col gap-2.5 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold leading-tight">Künefeci Hassan Usta</p>
            <p className="text-xs text-krem-100/65">
              Yönetim paneli{lastSaved ? ` · Son kayıt ${lastSaved}` : " · Henüz panelden kayıt yapılmadı"}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
            {calls.toggle}
            <a href="/tr" target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3">
              Siteyi aç <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
            <a href="/tr/qr" target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3">
              <QrCode className="size-4" aria-hidden="true" /> QR
            </a>
            <form action={logoutAction}>
              <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3">
                <LogOut className="size-4" aria-hidden="true" /> Çıkış
              </button>
            </form>
          </nav>
        </div>
        <div role="tablist" aria-label="Bölümler" className="no-scrollbar mx-auto flex max-w-3xl gap-1 overflow-x-auto px-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`h-11 shrink-0 rounded-t-xl px-4 text-sm font-extrabold transition-colors ${
                tab === t.id ? "bg-krem-100 text-zumrut-950" : "text-krem-100/75 hover:text-krem-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {calls.alerts}

      <main className="mx-auto max-w-3xl px-3 pt-4 sm:px-4">
        {!writable && (
          <p className="mb-4 flex gap-2.5 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <span>
              Kaydetme henüz kurulmadı: Vercel&apos;de projeye <b>Blob</b> depolaması bağlanmalı. Değişiklik yapabilirsiniz
              ama kaydedemezsiniz. Adımlar README dosyasında.
            </span>
          </p>
        )}
        {tab === "menu" && (
          <>
            <p className="mb-3 text-sm text-zumrut-900/65">
              Fiyatı doğrudan kutudan değiştirin. O gün biten ürüne <b>Bugün yok</b> deyin: menüde kalır, “Bugün yok”
              yazar ve ertesi sabah kendiliğinden geri gelir. Artık satılmayan ürünü <b>Menüde</b> düğmesiyle gizleyin.
              Ayrıntılar için kalem simgesine basın. Bitince alttan <b>Kaydet</b>.
            </p>
            <MenuEditor content={content} update={update} today={today} />
          </>
        )}
        {tab === "duyuru" && <HighlightsEditor content={content} update={update} />}
        {tab === "garson" && staff && <StaffEditor staff={staff} content={content} update={update} />}
        {tab === "isletme" && <InfoEditor content={content} update={update} />}
      </main>

      {(dirty || message) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zumrut-800/15 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_-18px_rgba(20,35,25,.5)] backdrop-blur">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3">
            <p
              role="status"
              className={`min-w-0 flex-1 text-sm font-bold ${
                message ? (message.ok ? "text-zumrut-700" : "text-red-700") : "text-zumrut-900"
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
