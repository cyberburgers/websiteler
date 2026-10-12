"use client";

import type { ReactNode } from "react";
import { openItem } from "./itemHash";

/** Opens a dish's detail sheet on this page (falls back to jumping to it without JavaScript). */
export function OpenItemLink({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${id}`}
      aria-haspopup="dialog"
      onClick={(e) => {
        e.preventDefault();
        openItem(id);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
