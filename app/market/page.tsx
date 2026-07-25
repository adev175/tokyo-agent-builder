import MarketHome from '@/components/MarketHome';
import { listPieces } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function MarketPage() {
  const pieces = await listPieces();
  return <MarketHome pieces={pieces} />;
}
