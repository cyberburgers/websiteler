"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import type { DayHours } from "@/content/site";
import type { Locale } from "@/i18n/config";
import { openState } from "@/lib/hours";
import type { OrderCatalog, OrderLabels } from "@/lib/order/types";
import { useTable } from "@/lib/table";
import { useNow } from "@/lib/useShopClock";

type Ordering = {
  /** A menu opened from a table's QR card, with ordering turned on in the panel. */
  atTable: boolean;
  /** …and the shop is open: dishes can be added and sent. An order already sent is followed either way. */
  canOrder: boolean;
  table: string | null;
  catalog: OrderCatalog;
  labels: OrderLabels;
  locale: Locale;
};

const OrderContext = createContext<Ordering | null>(null);

export function OrderProvider({
  enabled,
  hours,
  catalog,
  labels,
  locale,
  children,
}: {
  enabled: boolean;
  /** Outside opening hours "+ Ekle" goes away (the server refuses orders then too); calling the waiter stays. */
  hours: DayHours[];
  catalog: OrderCatalog;
  labels: OrderLabels;
  locale: Locale;
  children: ReactNode;
}) {
  const table = useTable();
  const now = useNow();
  const open = now !== null && openState(now, hours).open;
  const value = useMemo(
    () => ({
      atTable: enabled && Boolean(table),
      canOrder: enabled && open && Boolean(table),
      table,
      catalog,
      labels,
      locale,
    }),
    [enabled, open, table, catalog, labels, locale],
  );
  return <OrderContext value={value}>{children}</OrderContext>;
}

/** Outside the provider (a page without the menu) nothing can be ordered. */
export function useOrdering(): Ordering | null {
  return use(OrderContext);
}
