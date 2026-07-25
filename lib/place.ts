import type { Place } from './types';

const MINUTES_FROM_TOKYO: Record<string, number> = {
  北海道: 240, 青森県: 200, 秋田県: 230, 岩手県: 130, 宮城県: 95, 山形県: 165, 福島県: 90,
  茨城県: 70, 栃木県: 50, 群馬県: 60, 埼玉県: 25, 千葉県: 40, 東京都: 0, 神奈川県: 40,
  新潟県: 100, 富山県: 130, 石川県: 168, 福井県: 200, 山梨県: 90, 長野県: 85, 岐阜県: 140,
  静岡県: 60, 愛知県: 100, 三重県: 160, 滋賀県: 150, 京都府: 140, 大阪府: 150, 兵庫県: 170,
  奈良県: 165, 和歌山県: 220, 鳥取県: 250, 島根県: 280, 岡山県: 200, 広島県: 235, 山口県: 260,
  徳島県: 250, 香川県: 240, 愛媛県: 270, 高知県: 290, 福岡県: 300, 佐賀県: 330, 長崎県: 350,
  熊本県: 340, 大分県: 330, 宮崎県: 370, 鹿児島県: 390, 沖縄県: 180,
};

/**
 * Nominatim rather than Google Geocoding: no key to provision on demo morning, and
 * the returned Japanese address parts are already prefecture / city shaped. The map
 * itself is still Google when GOOGLE_MAPS_API_KEY is present (see PieceMap).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<Place> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=ja&lat=${lat}&lon=${lng}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'tsugi-hackathon/1.0' }, signal: ctrl.signal });
    const body = (await res.json()) as { address?: Record<string, string>; display_name?: string };
    const a = body.address ?? {};
    const prefecture = a.province ?? a.state ?? '';
    const city = a.city ?? a.town ?? a.village ?? a.county ?? a.suburb ?? '';
    // Built from address parts, not display_name: Nominatim returns that most-specific
    // first and with a postcode, which reads nothing like a Japanese address.
    const parts: string[] = [];
    for (const p of [prefecture, city, a.suburb, a.neighbourhood, a.quarter]) {
      if (p && !parts.includes(p)) parts.push(p);
    }
    return withCoords(place(prefecture, city), lat, lng, parts.join(''));
  } catch {
    return withCoords(place('', ''), lat, lng, '');
  } finally {
    clearTimeout(timer);
  }
}

function withCoords(base: Place, lat: number, lng: number, address: string): Place {
  return {
    ...base,
    lat,
    lng,
    address: address.trim(),
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  };
}

export function place(prefecture: string, city: string): Place {
  const travelMinutes = MINUTES_FROM_TOKYO[prefecture] ?? null;
  const h = travelMinutes ? Math.floor(travelMinutes / 60) : 0;
  const m = travelMinutes ? travelMinutes % 60 : 0;
  const openToday = new Date().getDay() !== 0;
  return {
    prefecture,
    city,
    travelMinutes,
    openToday,
    note: travelMinutes
      ? `東京駅から${h}時間${m}分。工房は本日${openToday ? '開いています' : '休みです'}。`
      : `${prefecture}${city}の工房。`,
  };
}
