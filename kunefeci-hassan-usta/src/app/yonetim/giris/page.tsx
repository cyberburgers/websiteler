import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-zumrut-900 p-6 shadow-[0_30px_70px_-30px_rgba(0,0,0,.9)] ring-1 ring-karamel-300/20 sm:p-8">
        <Logo id="giris-logo" className="mx-auto w-28" />
        <h1 className="font-display mt-4 text-center text-2xl font-semibold text-krem-50">Yönetim paneli</h1>
        <p className="mt-1 text-center text-sm text-krem-100/60">Menüyü, fiyatları ve saatleri buradan değiştirin.</p>
        <LoginForm tone="dark" />
      </div>
    </main>
  );
}
