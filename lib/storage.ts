import { list, put } from '@vercel/blob';
import type { Piece } from './types';

const PREFIX = 'tsugi/pieces/';

/**
 * Vercel Functions don't share memory across instances or survive a redeploy, so the
 * seven seed stores would be the only thing buyers ever saw once traffic scaled past one
 * warm lambda. Blob is the smallest persistence layer that fixes that without a schema,
 * a connection pool, or a credential a user ever sees — each piece is one JSON blob.
 */
export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function loadPersistedPieces(): Promise<Piece[]> {
  if (!blobConfigured()) return [];
  try {
    const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
    const pieces = await Promise.all(
      blobs.map(async (b) => {
        try {
          const res = await fetch(b.url, { cache: 'no-store' });
          if (!res.ok) return null;
          return (await res.json()) as Piece;
        } catch {
          return null;
        }
      }),
    );
    return pieces.filter((p): p is Piece => p !== null);
  } catch {
    return [];
  }
}

export async function persistPiece(piece: Piece): Promise<void> {
  if (!blobConfigured()) return;
  await put(`${PREFIX}${piece.id}.json`, JSON.stringify(piece), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}
