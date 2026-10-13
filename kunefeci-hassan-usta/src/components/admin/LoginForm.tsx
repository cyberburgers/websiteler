"use client";

import { LockKeyhole } from "lucide-react";
import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/yonetim/actions";

/** `autoFocus`: on the login page. In the header's sign-in window the field is focused as the window opens. */
const tones = {
  // The sign-in window on the menu site.
  light: {
    label: "text-zumrut-900",
    input: "bg-white text-zumrut-950 ring-zumrut-800/20 focus:ring-zumrut-600",
    error: "bg-red-50 text-red-800 ring-red-200",
    button: "bg-zumrut-800 text-krem-50 hover:bg-zumrut-700",
  },
  // The panel's own sign-in page, dark like the panel.
  dark: {
    label: "text-krem-100",
    input: "bg-zumrut-950 text-krem-50 ring-white/15 focus:ring-karamel-300/80",
    error: "bg-red-400/10 text-red-200 ring-red-300/30",
    button: "bg-karamel-300 text-zumrut-950 hover:bg-krem-300",
  },
};

export function LoginForm({ autoFocus = true, tone = "light" }: { autoFocus?: boolean; tone?: keyof typeof tones }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const c = tones[tone];
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block">
        <span className={`text-sm font-bold ${c.label}`}>Şifre</span>
        <input
          type="password"
          name="sifre"
          required
          autoComplete="current-password"
          autoFocus={autoFocus}
          className={`mt-1.5 h-12 w-full rounded-xl px-4 text-base outline-none ring-1 focus:ring-2 ${c.input}`}
        />
      </label>
      {state.error && (
        <p role="alert" className={`rounded-xl px-4 py-3 text-sm font-semibold ring-1 ${c.error}`}>
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-extrabold transition disabled:opacity-60 ${c.button}`}
      >
        <LockKeyhole className="size-[18px]" aria-hidden="true" />
        {pending ? "Kontrol ediliyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
