import { isStaffKey } from "@/lib/admin/auth";
import { markSeen, openCalls } from "@/lib/calls/store";

const noStore = { "Cache-Control": "no-store" };

/** The waiter screen: open calls. Needs the screen's key. */
export async function GET(request: Request) {
  if (!isStaffKey(new URL(request.url).searchParams.get("k"))) {
    return Response.json({ error: "Bağlantı geçersiz" }, { status: 401, headers: noStore });
  }
  try {
    return Response.json({ calls: await openCalls(), now: Date.now() }, { headers: noStore });
  } catch (error) {
    console.error("Garson çağrıları okunamadı", error);
    return Response.json({ error: "Çağrılar okunamadı" }, { status: 503, headers: noStore });
  }
}

/** A waiter tapped "Tamam" on a call. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { k?: string; id?: string };
  if (!isStaffKey(body.k)) return Response.json({ error: "Bağlantı geçersiz" }, { status: 401, headers: noStore });
  if (!body.id || !/^[\w-]{8,32}$/.test(body.id)) {
    return Response.json({ error: "Çağrı bulunamadı" }, { status: 400, headers: noStore });
  }
  try {
    return Response.json({ ok: await markSeen(body.id) }, { headers: noStore });
  } catch (error) {
    console.error("Çağrı kapatılamadı", error);
    return Response.json({ error: "Kaydedilemedi" }, { status: 503, headers: noStore });
  }
}
