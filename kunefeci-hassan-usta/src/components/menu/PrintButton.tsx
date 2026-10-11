"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-krem-100/80 ring-1 ring-krem-50/20 transition hover:bg-krem-50/10 hover:text-krem-50"
    >
      <Printer className="size-4" aria-hidden="true" />
      {label}
    </button>
  );
}
