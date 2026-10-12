import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_24px_60px_-30px_rgba(20,35,25,.45)] ring-1 ring-zumrut-800/10 sm:p-8">
        <Logo id="giris-logo" className="mx-auto w-28" />
        <h1 className="font-display mt-4 text-center text-2xl font-semibold text-zumrut-900">Yönetim paneli</h1>
        <p className="mt-1 text-center text-sm text-zumrut-900/60">Menüyü, fiyatları ve saatleri buradan değiştirin.</p>
        <LoginForm />
      </div>
    </main>
  );
}
