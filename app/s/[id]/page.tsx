import { notFound, redirect } from 'next/navigation';
import { get } from '@/lib/store';

export const dynamic = 'force-dynamic';

// Legacy piece URL from before the marketplace: forward to the canonical store page.
export default async function PiecePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const piece = await get(id);
  if (!piece) notFound();
  redirect(`/market/store/${piece.storeSlug}`);
}
