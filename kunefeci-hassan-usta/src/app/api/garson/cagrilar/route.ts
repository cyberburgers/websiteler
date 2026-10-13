import { isStaffKey } from "@/lib/admin/auth";
import { markDone, markSeen, openCalls } from "@/lib/calls/store";

const noStore = { "Cache-Control": "no-store" };

/** The panel's "Siparişler" tab: open calls. Needs the panel's key, sent as a header so it stays out of request logs. */
export async function GET(request: Request) {
  if (!(await isStaffKey(request.headers.get("x-garson-anahtari")))) {
    return Response.json({ error: "Bağlantı geçersiz" }, { status: 401, headers: noStore });
  }
  try {
    return Response.json({ calls: await openCalls(), now: Date.now() }, { headers: noStore });
  } catch (error) {
    console.error("Garson çağrıları okunamadı", error);
    return Response.json({ error: "Çağrılar okunamadı" }, { status: 503, headers: noStore });
  }
}

/** A waiter tapped "Tamam" on a call, "Onayla" on an order (action "gor") or "Teslim edildi" (action "teslim"). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { k?: string; id?: string; action?: string };
  if (!(await isStaffKey(body.k))) return Response.json({ error: "Bağlantı geçersiz" }, { status: 401, headers: noStore });
  if (!body.id || !/^[\w-]{8,32}$/.test(body.id)) {
    return Response.json({ error: "Çağrı bulunamadı" }, { status: 400, headers: noStore });
  }
  try {
    const ok = body.action === "teslim" ? await markDone(body.id) : await markSeen(body.id);
    return Response.json({ ok }, { headers: noStore });
  } catch (error) {
    console.error("Çağrı kapatılamadı", error);
    return Response.json({ error: "Kaydedilemedi" }, { status: 503, headers: noStore });
  }
}
