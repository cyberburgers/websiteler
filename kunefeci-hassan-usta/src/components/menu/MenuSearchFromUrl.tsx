"use client";

import { useSearchParams } from "next/navigation";
import { MenuSearch, isFilter, type MenuSearchProps } from "./MenuSearch";

/** Opens the search with whatever the link asked for, e.g. the "Fıstıklı" chip on the home page. */
export function MenuSearchFromUrl(props: MenuSearchProps) {
  const params = useSearchParams();
  const filters = (params.get("f") ?? "").split(",").filter(isFilter);
  return <MenuSearch {...props} initialQuery={params.get("q") ?? ""} initialFilters={filters} />;
}
