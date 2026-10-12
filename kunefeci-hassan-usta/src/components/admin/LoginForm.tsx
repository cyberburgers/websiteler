"use client";

import { LockKeyhole } from "lucide-react";
import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/yonetim/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-bold text-zumrut-900">Şifre</span>
        <input
          type="password"
          name="sifre"
          required
          autoComplete="current-password"
          autoFocus
          className="mt-1.5 h-12 w-full rounded-xl bg-white px-4 text-base text-zumrut-950 outline-none ring-1 ring-zumrut-800/20 focus:ring-2 focus:ring-zumrut-600"
        />
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zumrut-800 text-base font-extrabold text-krem-50 transition hover:bg-zumrut-700 disabled:opacity-60"
      >
        <LockKeyhole className="size-[18px]" aria-hidden="true" />
        {pending ? "Kontrol ediliyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
