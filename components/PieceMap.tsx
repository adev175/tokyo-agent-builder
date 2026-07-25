'use client';

import type { Place } from '@/lib/types';

/**
 * Google Maps when a key is present, OpenStreetMap tiles otherwise. Both render the
 * exact workshop coordinates the artisan's phone reported, and both sit under a link
 * that opens Google Maps for directions.
 */
export default function PieceMap({ place }: { place: Place }) {
  if (place.lat === undefined || place.lng === undefined) return null;
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { lat, lng } = place;
  const src = key
    ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${lat},${lng}&zoom=13&language=ja`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.06},${lat - 0.04},${lng + 0.06},${lat + 0.04}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div>
      <div className="border-rule bg-plate mt-3.5 h-[190px] w-full overflow-hidden border">
        <iframe
          src={src}
          title={`${place.prefecture}${place.city}`}
          loading="lazy"
          className="h-full w-full border-0 grayscale-[35%]"
        />
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <span className="jp text-ink text-[14px]">{place.address || `${place.prefecture}${place.city}`}</span>
        <a className="field-label text-shu whitespace-nowrap" href={place.mapsUrl} target="_blank" rel="noreferrer">
          open in maps
        </a>
      </div>
      <p className="mono text-dust mt-1 text-[10px]">
        {lat.toFixed(4)}, {lng.toFixed(4)} · {key ? 'Google Maps' : 'OpenStreetMap'}
      </p>
    </div>
  );
}
