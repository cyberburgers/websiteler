"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { uploadPhotoAction } from "@/app/yonetim/actions";
import { Photo } from "@/components/ui";
import type { Text } from "@/content/menu";

export const inputClass =
  "h-11 w-full rounded-xl bg-zumrut-950 px-3.5 text-[15px] text-krem-50 outline-none ring-1 ring-white/15 placeholder:text-krem-100/30 focus:ring-2 focus:ring-karamel-300/80";

/** A panel card: a shade lighter than the page, with a thin gold edge. */
export const cardClass = "rounded-2xl bg-zumrut-900 ring-1 ring-karamel-300/15 shadow-[0_18px_40px_-30px_rgba(0,0,0,.9)]";

/** A notice to read before carrying on (nothing is broken). */
export const noteClass = "rounded-2xl bg-amber-300/10 text-amber-100 ring-1 ring-amber-300/25";

/** On/off buttons that look like chips: gold when chosen. */
export const chipClass = (on: boolean) =>
  on ? "bg-karamel-300 text-zumrut-950" : "bg-white/5 text-krem-100 ring-1 ring-white/15 hover:bg-white/10";

/** The panel's header buttons: an icon on a phone, the name next to it from tablet width. */
export const headerButton =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2.5 transition-colors hover:bg-white/15 sm:px-3";

export const buttonClass = {
  primary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-karamel-300 px-4 text-sm font-extrabold text-zumrut-950 shadow-[0_8px_20px_-12px_rgba(224,180,121,.6)] transition hover:bg-krem-300 disabled:opacity-50",
  quiet:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:opacity-50 bg-white/5 text-krem-50 ring-1 ring-white/15 hover:bg-white/10",
  danger:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-400/10 px-4 text-sm font-bold text-red-300 ring-1 ring-red-300/30 transition hover:bg-red-400/15",
  icon: "grid size-10 shrink-0 place-items-center rounded-xl transition disabled:opacity-30 bg-white/5 text-krem-50 ring-1 ring-white/15 hover:bg-white/10",
};

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-krem-100">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-xs leading-relaxed text-krem-100/55">{hint}</span>}
    </label>
  );
}

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className={`${cardClass} p-4 sm:p-5`}>
      <h2 className="text-base font-extrabold text-krem-50">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-krem-100/60">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/**
 * A text the guests read. Only Turkish is written in the panel: the English menu shows the Turkish wherever
 * no English is kept. Editing the Turkish drops the English that came with the starting menu, so a changed
 * name or price label never shows an outdated translation on the English menu.
 */
export function Bilingual({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  label: string;
  value: Text | undefined;
  onChange: (value: Text) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const current = value ?? { tr: "", en: "" };
  const Input = multiline ? "textarea" : "input";
  const cls = multiline ? `${inputClass} h-auto min-h-20 py-2.5 leading-relaxed` : inputClass;
  return (
    <label className="block">
      <span className="text-sm font-bold text-krem-100">{label}</span>
      <Input
        value={current.tr}
        placeholder={placeholder}
        onChange={(e) => onChange({ tr: e.target.value, en: "" })}
        className={`${cls} mt-1.5`}
        rows={multiline ? 3 : undefined}
      />
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  showLabel = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={showLabel ? undefined : label}
      onClick={() => onChange(!checked)}
      className="inline-flex shrink-0 items-center gap-2.5 text-sm font-bold text-krem-100"
    >
      <span
        className={`relative h-7 w-12 rounded-full ring-1 transition-colors ${checked ? "bg-karamel-300 ring-karamel-300" : "bg-white/10 ring-white/15"}`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full shadow transition-[left,background-color] ${checked ? "left-[22px] bg-zumrut-950" : "left-0.5 bg-krem-100/80"}`}
        />
      </span>
      {showLabel && label}
    </button>
  );
}

/** Large phone photos are made smaller in the browser first, so the upload is quick even on mobile data. */
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (blob) return blob;
  } catch {
    // The browser couldn't read it (some HEIC files); send the original and let the server try.
  }
  return file;
}

export function PhotoField({
  value,
  onChange,
  label = "Fotoğraf",
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("foto", new File([await shrink(file)], "foto.jpg", { type: "image/jpeg" }));
      const result = await uploadPhotoAction(body);
      if (result.ok) onChange(result.url);
      else setError(result.error);
    } catch {
      setError("Fotoğraf yüklenemedi. Bağlantıyı kontrol edip tekrar deneyin.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="text-sm font-bold text-krem-100">{label}</span>
      <div className="mt-1.5 flex items-center gap-3">
        <span className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-zumrut-950 ring-1 ring-white/10">
          {value ? (
            <Photo photo={value} alt="" sizes="96px" />
          ) : (
            <span className="grid size-full place-items-center text-xs font-semibold text-krem-100/40">Yok</span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-zumrut-950/70">
              <Loader2 className="size-6 animate-spin text-karamel-300" aria-hidden="true" />
            </span>
          )}
        </span>
        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className={`${buttonClass.quiet} cursor-pointer`}>
            <ImagePlus className="size-4" aria-hidden="true" />
            {busy ? "Yükleniyor…" : value ? "Değiştir" : "Fotoğraf yükle"}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          {value && !busy && (
            <button type="button" onClick={() => onChange(undefined)} className={buttonClass.danger}>
              <Trash2 className="size-4" aria-hidden="true" />
              Kaldır
            </button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
