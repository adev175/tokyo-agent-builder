import { notFound } from 'next/navigation';
import StorePage from '@/components/StorePage';
import { getBySlug } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function Store({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = await getBySlug(slug);
  if (!piece) notFound();
  return <StorePage piece={piece} />;
}
