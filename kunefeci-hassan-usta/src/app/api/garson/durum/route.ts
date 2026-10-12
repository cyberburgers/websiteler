import { callStatus } from "@/lib/calls/store";

/** The guest's phone asks every few seconds whether a waiter has seen the call. */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[\w-]{8,32}$/.test(id)) return Response.json({ status: "yok" }, { status: 400 });
  try {
    return Response.json({ status: await callStatus(id) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "bilinmiyor" }, { status: 503 });
  }
}
