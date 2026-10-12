import { isAdmin } from "@/lib/admin/auth";

/** Whether this browser is already signed in to the panel: the header's admin button skips the password then. */
export async function GET() {
  return Response.json({ admin: await isAdmin() }, { headers: { "Cache-Control": "no-store" } });
}
