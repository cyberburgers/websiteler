"use client";

import { useTable } from "@/lib/table";

/** "Masa 7" when the guest arrived through a table's QR card; nothing otherwise. */
export function TableChip({ label }: { label: string }) {
  const table = useTable();
  if (!table) return null;
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-extrabold text-fistik-300 ring-1 ring-inset ring-fistik-300/55">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-3.5"
      >
        <path d="M4 10h16M6 10v9M18 10v9M3 6h18" />
      </svg>
      {label.replace("{n}", table)}
    </span>
  );
}
