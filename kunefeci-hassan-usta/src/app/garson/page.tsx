import { Suspense } from "react";
import { StaffScreen } from "@/components/StaffScreen";
import { isStaffKey } from "@/lib/admin/auth";
import { callsEnabled } from "@/lib/calls/store";

/** The counter tablet: /garson?k=… (the address comes from the panel). */
export default function StaffPage({ searchParams }: PageProps<"/garson">) {
  return (
    <Suspense fallback={<p className="grid min-h-dvh place-items-center text-sm font-bold text-krem-100/60">Yükleniyor…</p>}>
      <Screen searchParams={searchParams} />
    </Suspense>
  );
}

async function Screen({ searchParams }: { searchParams: PageProps<"/garson">["searchParams"] }) {
  const k = (await searchParams).k;
  const key = Array.isArray(k) ? k[0] : k;
  if (!(await isStaffKey(key))) {
    return (
      <Notice title="Bağlantı geçersiz">
        Garson ekranını yönetim panelindeki <b>Garson</b> bölümünden açın. Panelde yeni adres oluşturulduysa eski
        bağlantı çalışmaz.
      </Notice>
    );
  }
  if (!callsEnabled()) {
    return (
      <Notice title="Garson çağırma kurulmamış">
        Vercel&apos;de projeye <b>Upstash Redis</b> bağlanmalı. Adımlar README dosyasında.
      </Notice>
    );
  }
  return <StaffScreen staffKey={key!} />;
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="max-w-sm">
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-3 leading-relaxed text-krem-100/70">{children}</p>
      </div>
    </main>
  );
}
