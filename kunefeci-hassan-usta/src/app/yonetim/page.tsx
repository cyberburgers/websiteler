import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminApp } from "@/components/admin/AdminApp";
import { isAdmin, passwordState } from "@/lib/admin/auth";
import { staffSetup } from "@/lib/admin/staff";
import { readContentFresh } from "@/lib/content";
import { storeIsWritable } from "@/lib/content/store";
import { serviceDay } from "@/lib/serviceDay";

export default function AdminPage() {
  return (
    <Suspense
      fallback={<p className="grid min-h-dvh place-items-center text-sm font-bold text-zumrut-900/60">Yükleniyor…</p>}
    >
      <Panel />
    </Suspense>
  );
}

async function Panel() {
  if (!(await isAdmin())) redirect("/yonetim/giris");
  // Read straight from the store, not the site's cache, so the panel always edits the latest version.
  const content = await readContentFresh();
  return (
    <AdminApp initial={content} writable={storeIsWritable()} staff={passwordState() === "ok" ? await staffSetup() : null} today={serviceDay()} />
  );
}
