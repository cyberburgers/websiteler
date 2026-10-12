"use client";

import { useSyncExternalStore } from "react";
import type { OrderCatalog } from "./types";

/**
 * The guest's basket and their last sent order, kept for the visit in sessionStorage
 * so moving between menu pages (or a reload) keeps them.
 */
export type CartLine = { id: string; option: number; qty: number };
export type Cart = { lines: CartLine[]; note: string };

export type SentOrder = {
  id: string;
  at: number;
  lines: { name: string; qty: number; total: string }[];
  total: string;
  status: "bekliyor" | "goruldu" | "teslim";
};

const CART_KEY = "siparis-sepeti";
const ORDER_KEY = "siparis-son";
const EVENT = "siparis:degisti";
const EMPTY: Cart = { lines: [], note: "" };

// useSyncExternalStore needs the same object back while nothing changed, so parsed values are kept by their text.
const parsed = new Map<string, unknown>();
function readJson<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(key);
  } catch {
    return fallback;
  }
  if (!raw) return fallback;
  const cacheKey = `${key}:${raw}`;
  if (!parsed.has(cacheKey)) {
    if (parsed.size > 40) parsed.clear();
    try {
      parsed.set(cacheKey, JSON.parse(raw));
    } catch {
      return fallback;
    }
  }
  return parsed.get(cacheKey) as T;
}

function writeJson(key: string, value: unknown) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode without storage: the basket still works until the page changes.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useCart(): Cart {
  return useSyncExternalStore(subscribe, () => readJson(CART_KEY, EMPTY), () => EMPTY);
}

export function useSentOrder(): SentOrder | null {
  return useSyncExternalStore(subscribe, () => readJson<SentOrder | null>(ORDER_KEY, null), () => null);
}

const sameLine = (a: CartLine, id: string, option: number) => a.id === id && a.option === option;

export function setQty(id: string, option: number, qty: number) {
  const cart = readJson(CART_KEY, EMPTY);
  const rest = cart.lines.filter((l) => !sameLine(l, id, option));
  const index = cart.lines.findIndex((l) => sameLine(l, id, option));
  const lines =
    qty <= 0
      ? rest
      : index === -1
        ? [...cart.lines, { id, option, qty }]
        : cart.lines.map((l, i) => (i === index ? { ...l, qty } : l));
  writeJson(CART_KEY, { ...cart, lines });
}

export function addOne(id: string, option: number) {
  const line = readJson(CART_KEY, EMPTY).lines.find((l) => sameLine(l, id, option));
  setQty(id, option, Math.min(20, (line?.qty ?? 0) + 1));
}

export function setNote(note: string) {
  writeJson(CART_KEY, { ...readJson(CART_KEY, EMPTY), note });
}

/** Drops dishes that ran out since they were added. */
export function removeItems(ids: string[]) {
  const cart = readJson(CART_KEY, EMPTY);
  writeJson(CART_KEY, { ...cart, lines: cart.lines.filter((l) => !ids.includes(l.id)) });
}

export function clearCart() {
  writeJson(CART_KEY, null);
}

export function saveSentOrder(order: SentOrder | null) {
  writeJson(ORDER_KEY, order);
}

export function qtyOf(cart: Cart, id: string, option = 0): number {
  return cart.lines.find((l) => sameLine(l, id, option))?.qty ?? 0;
}

/** The basket's lines that are still on the menu, with their names and prices, and the totals. */
export function pricedCart(cart: Cart, catalog: OrderCatalog) {
  const lines = cart.lines.flatMap((line) => {
    const item = catalog[line.id];
    const price = item?.options[line.option];
    return item && price ? [{ ...line, item, price, amount: price.amount * line.qty }] : [];
  });
  return {
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    total: lines.reduce((sum, l) => sum + l.amount, 0),
  };
}
