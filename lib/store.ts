import type { Piece } from './types';
import { seedStores } from './seedStores';
import { loadPersistedPieces, persistPiece } from './storage';

const g = globalThis as unknown as { __tsugi?: Map<string, Piece>; __tsugiHydrate?: Promise<void> };

function cache(): Map<string, Piece> {
  if (!g.__tsugi) {
    g.__tsugi = new Map<string, Piece>();
    for (const p of seedStores) g.__tsugi.set(p.id, p);
  }
  return g.__tsugi;
}

// Runs once per warm instance: merges anything craftsmen have persisted to Blob on top
// of the seed stores, so a cold lambda still shows every store a buyer created earlier.
function hydrated(): Promise<void> {
  if (!g.__tsugiHydrate) {
    g.__tsugiHydrate = loadPersistedPieces().then((persisted) => {
      const map = cache();
      for (const p of persisted) map.set(p.id, p);
    });
  }
  return g.__tsugiHydrate;
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 6);
}

// ASCII-only on purpose: Next.js's dynamic-route param decoding does not round-trip
// arbitrary Unicode reliably (verified — a raw Japanese slug 404s on [slug] pages even
// though the exact same string resolves fine through a plain Route Handler), and an
// ASCII slug is also what actually survives being printed on a QR code insert, texted,
// or read aloud. Store names are usually Japanese, so this reliably falls back to the
// caller's second argument (the romanized craft name) instead.
export function slugify(name: string, fallback = 'store'): string {
  const base = name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (base) return base.slice(0, 40);
  const fb = fallback
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return (fb || 'store').slice(0, 40);
}

export async function put(piece: Piece): Promise<void> {
  cache().set(piece.id, piece);
  await persistPiece(piece).catch(() => {});
}

export async function get(id: string): Promise<Piece | undefined> {
  await hydrated();
  return cache().get(id);
}

export async function getBySlug(slug: string): Promise<Piece | undefined> {
  await hydrated();
  for (const p of cache().values()) if (p.storeSlug === slug) return p;
  return undefined;
}

export async function listPieces(): Promise<Piece[]> {
  await hydrated();
  return [...cache().values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
