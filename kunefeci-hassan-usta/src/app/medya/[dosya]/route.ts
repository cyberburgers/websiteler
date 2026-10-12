import { readLocalPhoto } from "@/lib/content/store";

/** Photos uploaded from the panel when the site runs on its own server (no Vercel Blob). */
export async function GET(_request: Request, { params }: RouteContext<"/medya/[dosya]">) {
  const { dosya } = await params;
  const photo = await readLocalPhoto(dosya);
  if (!photo) return new Response("Bulunamadı", { status: 404 });
  return new Response(new Uint8Array(photo), {
    headers: {
      "Content-Type": "image/jpeg",
      // Every upload gets a new name, so a file never changes.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
