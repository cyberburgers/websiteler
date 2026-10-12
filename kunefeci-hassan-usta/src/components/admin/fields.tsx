"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { uploadPhotoAction } from "@/app/yonetim/actions";
import { Photo } from "@/components/ui";
import type { Text } from "@/content/menu";

export const inputClass =
  "h-11 w-full rounded-xl bg-white px-3.5 text-[15px] text-zumrut-950 outline-none ring-1 ring-zumrut-800/20 placeholder:text-zumrut-900/35 focus:ring-2 focus:ring-zumrut-600";

export const buttonClass = {
  primary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zumrut-800 px-4 text-sm font-extrabold text-krem-50 transition hover:bg-zumrut-700 disabled:opacity-50",
  quiet:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-zumrut-900 ring-1 ring-zumrut-800/15 transition hover:bg-krem-50 disabled:opacity-50",
  danger:
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50",
  icon: "grid size-10 shrink-0 place-items-center rounded-xl bg-white text-zumrut-900 ring-1 ring-zumrut-800/15 transition hover:bg-krem-50 disabled:opacity-30",
};

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-zumrut-900">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-xs leading-relaxed text-zumrut-900/55">{hint}</span>}
    </label>
  );
}

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-zumrut-800/10 sm:p-5">
      <h2 className="text-base font-extrabold text-zumrut-950">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-zumrut-900/60">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Turkish first (required where it matters); English may stay empty and then shows the Turkish. */
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
    <fieldset>
      <legend className="text-sm font-bold text-zumrut-900">{label}</legend>
      <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zumrut-900/50">Türkçe</span>
          <Input
            value={current.tr}
            placeholder={placeholder}
            onChange={(e) => onChange({ ...current, tr: e.target.value })}
            className={`${cls} mt-1`}
            rows={multiline ? 3 : undefined}
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zumrut-900/50">
            İngilizce <span className="font-semibold normal-case tracking-normal">(boşsa Türkçesi görünür)</span>
          </span>
          <Input
            value={current.en}
            onChange={(e) => onChange({ ...current, en: e.target.value })}
            className={`${cls} mt-1`}
            rows={multiline ? 3 : undefined}
          />
        </label>
      </div>
    </fieldset>
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
      className="inline-flex shrink-0 items-center gap-2.5 text-sm font-bold text-zumrut-900"
    >
      <span
        className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-zumrut-600" : "bg-zumrut-900/20"}`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-[left] ${checked ? "left-[22px]" : "left-0.5"}`}
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
      <span className="text-sm font-bold text-zumrut-900">{label}</span>
      <div className="mt-1.5 flex items-center gap-3">
        <span className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-krem-200 ring-1 ring-zumrut-800/10">
          {value ? (
            <Photo photo={value} alt="" sizes="96px" />
          ) : (
            <span className="grid size-full place-items-center text-xs font-semibold text-zumrut-900/45">Yok</span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-white/70">
              <Loader2 className="size-6 animate-spin text-zumrut-800" aria-hidden="true" />
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
        <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
