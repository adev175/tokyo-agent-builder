'use client';

import { useEffect, useState } from 'react';

export interface CartLine {
  id: string;
  storeSlug: string;
  nameJp: string;
  nameEn: string;
  priceJpy: number;
  qty: number;
  image: string;
}

const KEY = 'tsugi.cart';
const EVENT = 'tsugi-cart';
export const SHIPPING_JPY = 2400;

export function readCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as CartLine[];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(line: Omit<CartLine, 'qty'>, qty: number) {
  const lines = readCart();
  const found = lines.find((l) => l.id === line.id);
  if (found) found.qty += qty;
  else lines.push({ ...line, qty });
  writeCart(lines);
}

/** localStorage so a phone that scanned the QR keeps its basket. No account, no server. */
export function useCart(): [CartLine[], (lines: CartLine[]) => void] {
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => {
    const sync = () => setLines(readCart());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return [lines, writeCart];
}

export function yen(n: number): string {
  return `¥${n.toLocaleString('en-US')}`;
}
