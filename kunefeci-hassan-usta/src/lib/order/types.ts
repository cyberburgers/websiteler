/** What the basket needs to know about each dish it can hold, already in the guest's language. */
export type CatalogItem = {
  name: string;
  options: { label?: string; amount: number; formatted: string }[];
};

export type OrderCatalog = Record<string, CatalogItem>;

export type OrderLabels = {
  add: string;
  choose: string;
  addToOrder: string;
  added: string;
  less: string;
  more: string;
  viewBasket: string;
  items: string;
  title: string;
  note: string;
  notePlaceholder: string;
  total: string;
  payHint: string;
  /** "Siparişi {table} için gönder": the table is named on the button, so it's clear the order is for here. */
  send: string;
  sending: string;
  sentTitle: string;
  sentHint: string;
  preparing: string;
  preparingHint: string;
  delivered: string;
  deliveredHint: string;
  lastOrder: string;
  tooSoon: string;
  soldOut: string;
  busy: string;
  error: string;
  close: string;
  done: string;
};
