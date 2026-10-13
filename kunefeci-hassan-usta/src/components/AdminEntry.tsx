"use client";

import { KeyRound, LockKeyhole, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

/**
 * The staff's way into the panel: a quiet glass pill at the top right, "Yönetici" with a key. It opens the
 * sign-in over the menu, which blurs behind it; already signed in, it goes straight to the panel.
 */
export function AdminEntry({ label, text, className = "" }: { label: string; text: string; className?: string }) {
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
      <button
        type="button"
        onClick={open}
        aria-label={label}
        aria-haspopup="dialog"
        data-yonetici=""
        className={`group inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-zumrut-950/50 pe-1 ps-1 text-[13px] font-bold text-krem-100/90 ring-1 ring-inset ring-krem-50/[0.12] backdrop-blur-md transition hover:bg-zumrut-950/75 hover:text-krem-50 hover:ring-fistik-300/40 active:scale-95 min-[360px]:pe-3.5 md:h-11 md:pe-4 ${className}`}
      >
        <span className="grid size-8 place-items-center rounded-full bg-krem-50/[0.08] text-karamel-300 ring-1 ring-inset ring-karamel-300/25 transition-colors group-hover:bg-fistik-300 group-hover:text-zumrut-925 group-hover:ring-transparent md:size-9">
          <KeyRound className="size-4" strokeWidth={2.25} aria-hidden="true" />
        </span>
        {/* On the narrowest phones the word would touch the logo; the key alone is enough there. */}
        <span className="hidden min-[360px]:inline">{text}</span>
      </button>
      <dialog
        ref={dialogRef}
        lang="tr"
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
