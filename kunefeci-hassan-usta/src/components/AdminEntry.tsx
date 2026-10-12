"use client";

import { LockKeyhole, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

/**
 * The staff's way into the panel: a small button at the top right. It opens the sign-in over the menu,
 * which blurs behind it; already signed in, it goes straight to the panel.
 */
export function AdminEntry({ label, className }: { label: string; className: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [going, setGoing] = useState(false);
  const router = useRouter();

  const open = async () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>("input[name=sifre]")?.focus();
    try {
      const res = await fetch("/api/yonetim/oturum", { cache: "no-store" });
      if ((await res.json()).admin) {
        setGoing(true);
        router.push("/yonetim");
      }
    } catch {
      // Offline: the password form is there anyway.
    }
  };

  return (
    <>
      <button type="button" onClick={open} aria-label={label} aria-haspopup="dialog" data-yonetici="" className={className}>
        <LockKeyhole className="size-[18px]" aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        aria-labelledby="yonetici-baslik"
        className="login-sheet m-auto w-[min(100%-2rem,24rem)] rounded-[28px] bg-krem-50 p-0 text-zumrut-900 shadow-[0_30px_80px_-24px_rgba(0,0,0,.7)]"
      >
        <div className="relative p-6 sm:p-7">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Kapat"
            className="absolute end-3 top-3 grid size-10 place-items-center rounded-full bg-krem-200 text-zumrut-900 transition hover:bg-krem-300"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <span className="grid size-12 place-items-center rounded-2xl bg-zumrut-800 text-fistik-300">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </span>
          <h2 id="yonetici-baslik" className="font-display mt-4 text-2xl font-semibold">
            Yönetim paneli
          </h2>
          <p className="mt-1 text-sm text-zumrut-900/60">
            {going ? "Zaten giriş yapılmış, panele geçiliyor…" : "Menüyü, fiyatları ve saatleri buradan değiştirin."}
          </p>
          {!going && <LoginForm autoFocus={false} />}
        </div>
      </dialog>
    </>
  );
}
