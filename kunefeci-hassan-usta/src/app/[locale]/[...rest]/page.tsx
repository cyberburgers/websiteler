import { notFound } from "next/navigation";

// Unknown paths under a language (e.g. /tr/olmayan-sayfa) render the localized not-found page.
export default function CatchAll() {
  notFound();
}
