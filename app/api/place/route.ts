import { reverseGeocode } from '@/lib/place';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get('lat'));
  const lng = Number(url.searchParams.get('lng'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ error: 'lat and lng required' }, { status: 400 });
  }
  return Response.json(await reverseGeocode(lat, lng));
}
