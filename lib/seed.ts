import type { Piece } from './types';

const generatedCode = `import urllib.request, urllib.parse, json, re, socket
socket.setdefaulttimeout(5)

QUERIES = ["九谷焼 盃 青手", "九谷焼 盃 徳田"]
SOURCES = [
    ("Yahoo Auctions", "https://auctions.yahoo.co.jp/search/search?p="),
    ("Mercari", "https://jp.mercari.com/search?keyword="),
]

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req).read().decode("utf-8", "ignore")

items, method = [], "20th-80th percentile of live JP resale listings"
try:
    for source, base in SOURCES:
        for q in QUERIES:
            html = fetch(base + urllib.parse.quote(q))
            for title, price in re.findall(r'title="([^"]{6,80})".{0,400}?([0-9,]{4,9})円', html, re.S)[:6]:
                items.append({
                    "title": title,
                    "priceJpy": int(price.replace(",", "")),
                    "url": base + urllib.parse.quote(q),
                    "source": source,
                })
    print(json.dumps({"items": items[:12], "method": method}, ensure_ascii=False))
except Exception as e:
    print(json.dumps({"items": [], "method": "fetch failed: %s" % e}))`;

export const seed: Piece = {
  id: 'demo',
  storeName: '徳田窯',
  storeSlug: 'tokuda-kiln-demo',
  storeOrigin: '祖父が窯を築き、父が継ぎ、いま三代目として私が続けています。花坂の土と手取川の水で作っております。',
  storePeople: '三代目の私と、上絵付けを手伝う妻の二人で窯を回しております。',
  imageDataUrl: '/demo.jpg',
  images: ['/demo.jpg', '/craft1.jpg', '/craft5.jpg'],
  voice: {
    transcriptJa:
      '父の窯を継いで四十年になります。この盃は青手で、緑の絵具を厚く盛って二度焼いています。内側は白いまま残しました。',
    heritageJa:
      '祖父は戦後、絵具の材料が手に入らず、この緑だけは自分で鉱石を挽いて作りました。その挽き方の加減は帳面には残っておらず、父が私の手を取って教えたものです。',
  },
  vision: {
    craft: 'Kutani ware',
    craftJa: '九谷焼',
    objectJa: '盃',
    material: ['磁土', '上絵具', '呉須'],
    technique: ['青手', '上絵付', '盛絵'],
    regionGuess: '石川県能美市',
    condition: '完品。高台に僅かな窯傷、使用による擦れなし。',
    features: [
      'aote overglaze in five colours, green dominant',
      'hand-trimmed foot ring, unglazed stoneware body',
      'gold leaf outline on the rim, worn evenly',
      'painted seal in iron red under the foot',
    ],
    confidence: 0.86,
    candidates: [
      { craftJa: '九谷焼', craft: 'Kutani ware', prefecture: '石川県', category: '陶磁器', score: 0.87 },
      { craftJa: '京焼・清水焼', craft: 'Kyo ware / Kiyomizu ware', prefecture: '京都府', category: '陶磁器', score: 0.71 },
      { craftJa: '伊万里・有田焼', craft: 'Imari / Arita ware', prefecture: '佐賀県', category: '陶磁器', score: 0.68 },
    ],
    ambiguous: false,
  },
  mark: {
    textRaw: '三代 德田',
    reading: 'さんだい とくだ',
    interpretation: '三代目 徳田を名乗る工房の落款。九谷の上絵付系譜に一致。',
    confidence: 0.72,
  },
  comps: {
    items: [
      { title: '九谷焼 青手 盃 在銘', priceJpy: 19800, url: 'https://auctions.yahoo.co.jp/search/search?p=九谷焼+盃', source: 'Yahoo Auctions' },
      { title: '九谷焼 盃 五客揃 木箱', priceJpy: 24000, url: 'https://auctions.yahoo.co.jp/search/search?p=九谷焼+盃', source: 'Yahoo Auctions' },
      { title: '九谷 青手 酒器 徳田', priceJpy: 28500, url: 'https://jp.mercari.com/search?keyword=九谷焼+盃', source: 'Mercari' },
      { title: '九谷焼 上絵 盃 共箱付', priceJpy: 31000, url: 'https://jp.mercari.com/search?keyword=九谷焼+盃', source: 'Mercari' },
      { title: '九谷焼 盃 金彩 在銘', priceJpy: 34000, url: 'https://auctions.yahoo.co.jp/search/search?p=九谷焼+盃', source: 'Yahoo Auctions' },
    ],
    bandJpy: [19000, 34000],
    recommendedJpy: 28000,
    method: '11件の現行出品の20〜80パーセンタイル。共箱・在銘・完品で中央値を上方修正。',
    generatedCode,
  },
  story: {
    titleJa: '九谷焼 青手盃',
    inscriptionJa: '九谷青手盃　三代德田造',
    storyJa:
      '父の窯を継いで四十年、能美の土と向き合ってまいりました。この青手の緑は、一度焼いた白磁の上に厚く絵具を盛り、八百度で二度焼き締めて初めて出る色でございます。盃の内側だけ絵を省いたのは、酒の色を見ていただきたいからです。',
    careJa:
      '使い始めに湯通しは不要です。上絵は摩耗しますので、食洗機と研磨剤入りの洗剤は避け、柔らかい布で拭いてください。金彩の部分は電子レンジに入れないでください。',
    heritageJa:
      '祖父は戦後、絵具の材料が手に入らず、この緑だけは自分で鉱石を挽いて作りました。その加減は帳面に残らず、父が私の手を取って教えたものです。',
  },
  localized: {
    en: {
      title: 'Kutani Aote Sake Cup',
      story:
        'Forty years at his father\u2019s kiln in Nomi, Ishikawa. The green of aote is built by laying enamel thickly over fired porcelain and firing it a second time at 800°C — no other method gives that depth. The interior is left unpainted so the colour of the sake shows.',
      whyItMatters:
        'Aote Kutani is one of the few overglaze traditions where the pigment sits proud of the surface — you can feel it with a fingertip. Signed pieces from a named third-generation workshop rarely reach the market outside Japan.',
      shippingNote:
        'Ships from Ishikawa in its original paulownia box. EMS, 4–7 days to the EU and US. No CITES or cultural-property restriction applies to contemporary Kutani.',
      heritage:
        'After the war his grandfather could not buy pigment, so he ground this green from ore himself. The judgement of how fine to grind it was never written down — his father taught it hand over hand.',
    },
    zh: {
      title: '九谷烧 青手酒盃',
      story:
        '继承父亲的窑四十年，一直在石川县能美市与当地的瓷土打交道。青手的绿，是在已烧成的白瓷上厚敷釉料，以八百度二次烧成才得到的颜色。盃内不施彩，是为了让人看清酒的色泽。',
      whyItMatters: '青手九谷的釉料高出器面，指尖可以摸到厚度。三代传承的落款作品在日本以外极少流通。',
      shippingNote: '自石川县发货，附原装桐木箱。EMS 直邮，中国大陆 3–5 日。当代九谷烧无文物出口限制。',
    },
    fr: {
      title: 'Coupe à saké Kutani, décor aote',
      story:
        "Quarante ans au four de son père, à Nomi, préfecture d'Ishikawa. Le vert de l'aote naît d'un émail posé en épaisseur sur la porcelaine déjà cuite, puis d'une seconde cuisson à 800°C. L'intérieur reste nu pour laisser voir la robe du saké.",
      whyItMatters:
        "L'émail aote est en relief : on le sent sous le doigt, comme un émail cloisonné sans cloison. Une pièce signée d'un atelier de troisième génération quitte rarement le Japon.",
      shippingNote:
        "Expédiée d'Ishikawa dans sa boîte en paulownia d'origine. EMS, 4 à 7 jours vers la France. Aucune restriction d'exportation pour le Kutani contemporain.",
    },
    ko: {
      title: '구타니야키 아오테 술잔',
      story:
        '아버지의 가마를 이어 사십 년, 이시카와 노미의 흙을 다뤄 왔습니다. 아오테의 녹색은 한 번 구운 백자 위에 안료를 두껍게 올리고 팔백 도에서 다시 구워야 나오는 색입니다. 잔 안쪽에 그림을 넣지 않은 것은 술빛을 보시게 하려는 뜻입니다.',
      whyItMatters:
        '아오테 구타니는 안료가 표면보다 도드라져 손끝으로 두께가 만져지는 몇 안 되는 상회 기법입니다. 3대 공방의 낙관이 있는 작품은 일본 밖으로 거의 나오지 않습니다.',
      shippingNote: '이시카와에서 오동나무 상자에 담아 발송. EMS 기준 한국까지 2–3일. 현대 구타니야키는 수출 제한이 없습니다.',
    },
  },
  priceJpy: 28000,
  createdAt: '2026-07-25T02:30:00.000Z',
  place: {
    prefecture: '石川県',
    city: '能美市',
    travelMinutes: 168,
    openToday: true,
    note: '東京駅から北陸新幹線経由で2時間48分。工房は本日開いています。',
    lat: 36.4432,
    lng: 136.4652,
    address: '石川県能美市泉台町',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=36.4432,136.4652',
  },
};
