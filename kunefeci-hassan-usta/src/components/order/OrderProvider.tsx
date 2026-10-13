"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { OrderCatalog, OrderLabels } from "@/lib/order/types";
import { useTable } from "@/lib/table";

type Ordering = {
  /**
   * A menu opened from a table's QR card, with ordering turned on in the panel. Not tied to the opening
   * hours: the shop often keeps serving past its closing time.
   */
  canOrder: boolean;
  table: string | null;
  catalog: OrderCatalog;
  labels: OrderLabels;
  locale: Locale;
};

const OrderContext = createContext<Ordering | null>(null);

export function OrderProvider({
  enabled,
  catalog,
  labels,
  locale,
  children,
}: {
  enabled: boolean;
  catalog: OrderCatalog;
  labels: OrderLabels;
  locale: Locale;
  children: ReactNode;
}) {
  const table = useTable();
  const value = useMemo(
    () => ({ canOrder: enabled && Boolean(table), table, catalog, labels, locale }),
    [enabled, table, catalog, labels, locale],
  );
  return <OrderContext value={value}>{children}</OrderContext>;
}

/** Outside the provider (a page without the menu) nothing can be ordered. */
export function useOrdering(): Ordering | null {
  return use(OrderContext);
}
