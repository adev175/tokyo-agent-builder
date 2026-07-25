import type { Piece } from './types';
import { seed } from './seed';
import { place } from './place';

const kutani: Piece = { ...seed, storeName: '徳田窯', storeSlug: 'tokuda-kiln-demo' };

const wajima: Piece = {
  id: 'wj01',
  storeName: '輪島 蒔絵工房',
  storeSlug: 'wajima-maki-e-workshop',
  storeOrigin: '曾祖父が輪島で塗師として独立し、四代続けてこの工房で下地から仕上げまでを一貫して行っています。',
  storePeople: '四代目の私が下地と上塗りを、弟子の一人が沈金を担当しています。',
  imageDataUrl: '/craft3.jpg',
  images: ['/craft3.jpg', '/wajima.svg'],
  voice: {
    transcriptJa: '輪島塗は下地だけで一年かかります。布を着せて、地の粉を何度も塗り重ねて、やっと漆が乗る土台ができます。',
    heritageJa: '',
  },
  vision: {
    craft: 'Wajima lacquerware',
    craftJa: '輪島塗',
    objectJa: '汁椀',
    material: ['アテ材', '地の粉', '生漆'],
    technique: ['布着せ', '本堅地', '沈金'],
    regionGuess: '石川県輪島市',
    condition: '完品。日常使いによる小傷のみ、漆の剥離なし。',
    features: [
      'deep vermillion over a black ground, worn to a soft sheen at the rim',
      'cloth-reinforced foot, invisible under the final coat',
      'fine 沈金 line work chased after lacquering, not painted on',
      'weight noticeably heavier than the eye expects, from the built-up ground',
    ],
    confidence: 0.83,
    candidates: [
      { craftJa: '輪島塗', craft: 'Wajima lacquerware', prefecture: '石川県', category: '漆器', score: 0.85 },
      { craftJa: '山中漆器', craft: 'Yamanaka lacquerware', prefecture: '石川県', category: '漆器', score: 0.66 },
      { craftJa: '越前漆器', craft: 'Echizen lacquerware', prefecture: '福井県', category: '漆器', score: 0.6 },
    ],
    ambiguous: false,
  },
  mark: null,
  comps: {
    items: [
      { title: '輪島塗 汁椀 布着せ本堅地', priceJpy: 14000, url: 'https://auctions.yahoo.co.jp/search/search?p=輪島塗+汁椀', source: 'Yahoo Auctions' },
      { title: '輪島塗 夫婦椀 沈金', priceJpy: 22000, url: 'https://auctions.yahoo.co.jp/search/search?p=輪島塗+椀', source: 'Yahoo Auctions' },
      { title: '輪島塗 椀 在銘 共箱', priceJpy: 26000, url: 'https://jp.mercari.com/search?keyword=輪島塗+椀', source: 'Mercari' },
    ],
    bandJpy: [14000, 26000],
    recommendedJpy: 19500,
    method: '7件の現行出品の20〜80パーセンタイル。共箱・完品で中央値をやや上方修正。',
    generatedCode: seed.comps.generatedCode,
  },
  story: {
    titleJa: '輪島塗 汁椀',
    inscriptionJa: '輪島塗 布着せ本堅地椀',
    storyJa:
      '布を着せ、地の粉を何度も研いでは塗り重ねる本堅地の下地だけで一年かかります。急いだ椀は割れるので、急ぎません。使うほど艶が育つよう、厚く漆を乗せております。',
    careJa: '漂白剤・食洗機は使わないでください。ぬるま湯と柔らかい布で十分です。日光の当たる場所での保管は避けてください。',
    heritageJa: '',
  },
  localized: {
    en: {
      title: 'Wajima Lacquered Soup Bowl',
      story:
        'The cloth-reinforced ground alone takes a year — layer after layer of powdered clay, sanded back each time. A rushed bowl cracks, so nothing here is rushed. The lacquer is built up thick on purpose: the shine is meant to deepen with use, not fade.',
      whyItMatters:
        'Wajima is the reference standard other lacquer regions are measured against, precisely because of this ground. A bowl built this way will outlive the person who bought it.',
      shippingNote: 'Ships from Ishikawa in its lacquered box. EMS, 5–8 days internationally. No export restriction on contemporary lacquerware.',
      heritage: '',
    },
    zh: {
      title: '轮岛涂 汁椀',
      story: '仅布地打底就要一年——反复上灰、反复打磨。急就的椀会裂,所以这里没有捷径。漆刻意上得厚,是为了让光泽随使用而愈发深沉。',
      whyItMatters: '轮岛正是因为这层底工,才成为其他漆器产地对标的基准。这样做出的椀,寿命远比使用者更长。',
      shippingNote: '自石川县发货,附漆器专用木盒。EMS 直邮 5-8 日。当代漆器无出口限制。',
    },
    fr: {
      title: 'Bol à soupe laqué de Wajima',
      story:
        "Le fond seul, renforcé de tissu, demande un an — couche après couche de poudre d'argile, poncée à chaque fois. Un bol pressé se fend, alors rien ici n'est pressé. Le laque est volontairement épais : l'éclat doit s'approfondir avec l'usage.",
      whyItMatters:
        "Wajima est la référence à laquelle les autres régions laquières se mesurent, précisément à cause de ce fond. Un bol ainsi construit survit à son acheteur.",
      shippingNote: "Expédié d'Ishikawa dans sa boîte laquée. EMS, 5 à 8 jours. Aucune restriction d'exportation.",
    },
    ko: {
      title: '와지마누리 국그릇',
      story:
        '천을 덧대고 흙가루를 몇 번이고 발라 갈아내는 바탕 작업만 일 년이 걸립니다. 서두른 그릇은 갈라지기에 여기엔 서두름이 없습니다. 옻을 두껍게 올린 것은 쓸수록 광이 깊어지게 하기 위함입니다.',
      whyItMatters: '와지마가 다른 옻칠 산지의 기준이 되는 것은 바로 이 바탕 작업 때문입니다. 이렇게 만든 그릇은 산 사람보다 오래갑니다.',
      shippingNote: '이시카와에서 옻칠 상자에 담아 발송. EMS 기준 5-8일.',
    },
  },
  priceJpy: 19500,
  createdAt: '2026-06-02T04:10:00.000Z',
  place: withCoords(place('石川県', '輪島市'), 37.3999, 136.899, '石川県輪島市河井町'),
};

const nambu: Piece = {
  id: 'nb01',
  storeName: '南部鋳金工房',
  storeSlug: 'nambu-imono-workshop',
  storeOrigin: '盛岡の鋳物師町に大正期から続く工房で、砂型づくりから鋳込みまで自分たちで行っています。',
  storePeople: '型を起こす職人と、仕上げの金気止めを担当する職人の二人でやっております。',
  imageDataUrl: '/nambu.svg',
  images: ['/nambu.svg'],
  voice: {
    transcriptJa: '砂型に霰の粒を一つずつ押して文様を作ります。鉄瓶は使ってお湯を沸かすほど、内側の湯垢が水をまろやかにします。',
    heritageJa: '',
  },
  vision: {
    craft: 'Nambu ironware',
    craftJa: '南部鉄器',
    objectJa: '鉄瓶',
    material: ['鋳鉄', '漆', '鉄漿'],
    technique: ['鋳造', '霰文', '金気止め'],
    regionGuess: '岩手県盛岡市',
    condition: '完品。表面に均一な酸化被膜、使用感あり。',
    features: [
      'raised hail-drop (霰) pattern, each pip pressed into the sand mould by hand',
      'matte black oxide finish from 金気止め firing, not paint',
      'lidded, iron trivet-style handle hinge shows use-wear',
      'no lining — bare cast iron, meant to season with water over years',
    ],
    confidence: 0.81,
    candidates: [
      { craftJa: '南部鉄器', craft: 'Nambu ironware', prefecture: '岩手県', category: '金工品', score: 0.84 },
      { craftJa: '高岡銅器', craft: 'Takaoka copperware', prefecture: '富山県', category: '金工品', score: 0.58 },
      { craftJa: '燕鎚起銅器', craft: 'Tsubame hammered copperware', prefecture: '新潟県', category: '金工品', score: 0.52 },
    ],
    ambiguous: false,
  },
  mark: {
    textRaw: '南部',
    reading: 'なんぶ',
    interpretation: '鋳型に押された工房銘。個人作家名ではなく産地銘。',
    confidence: 0.6,
  },
  comps: {
    items: [
      { title: '南部鉄器 鉄瓶 霰文 中古', priceJpy: 12000, url: 'https://auctions.yahoo.co.jp/search/search?p=南部鉄器+鉄瓶', source: 'Yahoo Auctions' },
      { title: '南部鉄器 鉄瓶 未使用', priceJpy: 24000, url: 'https://jp.mercari.com/search?keyword=南部鉄器+鉄瓶', source: 'Mercari' },
      { title: '南部鉄器 霰 鉄瓶 大', priceJpy: 29000, url: 'https://auctions.yahoo.co.jp/search/search?p=南部鉄器+鉄瓶', source: 'Yahoo Auctions' },
    ],
    bandJpy: [12000, 29000],
    recommendedJpy: 21000,
    method: '9件の現行出品の20〜80パーセンタイル。霰文の粒立ちと未使用度で調整。',
    generatedCode: seed.comps.generatedCode,
  },
  story: {
    titleJa: '南部鉄器 霰文鉄瓶',
    inscriptionJa: '南部鉄瓶 霰文',
    storyJa:
      '砂型に霰の粒を一つずつ押してから鋳込みます。同じ型は使い捨てで、一つの鉄瓶に一つの型しかありません。使うほど内側に水垢がつき、それが鉄瓶を育てます。',
    careJa: '使用後は蓋を開けたまま自然乾燥させてください。洗剤は使わず、内側は擦らないでください。',
    heritageJa: '',
  },
  localized: {
    en: {
      title: 'Nambu Ironware Kettle, Hail-Drop Pattern',
      story:
        'Each hail-drop is pressed into the sand mould by hand before casting, and the mould is used once — one kettle, one mould. The scale that builds up inside with use is what softens the water; it is not something to scrub away.',
      whyItMatters: 'A kettle that is meant to age. Collectors buy Nambu iron expecting to hand it to the next generation, not to replace it.',
      shippingNote: 'Ships from Morioka, Iwate. EMS, 5–9 days. Declare as cast iron cookware — no restriction, but note the weight for customs.',
      heritage: '',
    },
    zh: {
      title: '南部铁器 霰纹铁壶',
      story: '每一粒霰纹都是浇铸前手工按入砂型的,一个模只用一次——一壶一模。使用中内壁积起的水垢正是让水变得温润的关键,不必刷去。',
      whyItMatters: '这是一把注定会变老的壶。收藏者买南部铁器,想的是传给下一代,而不是更换。',
      shippingNote: '自岩手县盛冈发货。EMS 5-9 日。申报为铸铁炊具,注意重量。',
    },
    fr: {
      title: 'Bouilloire en fonte Nambu, motif grêle',
      story:
        "Chaque grain de grêle est pressé à la main dans le moule de sable avant la coulée, et le moule ne sert qu'une fois — une bouilloire, un moule. Le tartre qui s'accumule à l'intérieur adoucit l'eau ; il ne se récure pas.",
      whyItMatters: "Une bouilloire faite pour vieillir. On l'achète pour la transmettre, pas pour la remplacer.",
      shippingNote: "Expédiée de Morioka, Iwate. EMS, 5 à 9 jours. Déclarer comme fonte de cuisine.",
    },
    ko: {
      title: '난부 철기 아라레무늬 철병',
      story:
        '싸라기 무늬 하나하나를 주조 전에 모래 틀에 손으로 눌러 찍고, 그 틀은 한 번만 씁니다 — 철병 하나에 틀 하나. 쓰면서 안쪽에 앉는 물때가 물을 부드럽게 하니 닦아내지 않습니다.',
      whyItMatters: '늙어가도록 만들어진 주전자입니다. 다음 세대에게 물려주려고 사는 물건입니다.',
      shippingNote: '이와테현 모리오카에서 발송. EMS 기준 5-9일.',
    },
  },
  priceJpy: 21000,
  createdAt: '2026-05-14T09:20:00.000Z',
  place: withCoords(place('岩手県', '盛岡市'), 39.7036, 141.1527, '岩手県盛岡市南大通'),
};

const nishijin: Piece = {
  id: 'ns01',
  storeName: '西陣 織房',
  storeSlug: 'nishijin-orimoto',
  storeOrigin: '祖母がこの西陣の織屋で織子として働き始め、母が図案と技術を継いで今の織房になりました。',
  storePeople: '母が図案と先染めを、私が引箔と製織を担当しています。',
  imageDataUrl: '/nishijin.svg',
  images: ['/nishijin.svg'],
  voice: {
    transcriptJa: '帯は先に糸を染めてから織ります。金銀糸は箔を漆で和紙に貼ってから細く裁ったものです。',
    heritageJa: '祖母がこの工房で織子をしており、母がその技を継ぎました。今の柄は祖母が図案帳に残していたものです。',
  },
  vision: {
    craft: 'Nishijin brocade',
    craftJa: '西陣織',
    objectJa: '袋帯',
    material: ['絹', '金銀糸'],
    technique: ['先染紋織', '引箔'],
    regionGuess: '京都府京都市',
    condition: '完品。未使用、たとう紙に包まれた状態。',
    features: [
      'gold thread cut from lacquer-backed foil paper, not metallic yarn',
      'pattern woven in, not printed — visible on the reverse in reverse colours',
      'stiff hand from the density of the weave, softens only with wear',
      'selvedge shows the maker\'s thread-count mark',
    ],
    confidence: 0.79,
    candidates: [
      { craftJa: '西陣織', craft: 'Nishijin brocade', prefecture: '京都府', category: '織物', score: 0.82 },
      { craftJa: '本場大島紬', craft: 'Oshima tsumugi', prefecture: '鹿児島県', category: '織物', score: 0.55 },
      { craftJa: '結城紬', craft: 'Yuki tsumugi', prefecture: '茨城県', category: '織物', score: 0.5 },
    ],
    ambiguous: false,
  },
  mark: null,
  comps: {
    items: [
      { title: '西陣織 袋帯 引箔 未使用', priceJpy: 38000, url: 'https://auctions.yahoo.co.jp/search/search?p=西陣織+袋帯', source: 'Yahoo Auctions' },
      { title: '西陣織 名古屋帯 正絹', priceJpy: 26000, url: 'https://jp.mercari.com/search?keyword=西陣織+帯', source: 'Mercari' },
      { title: '西陣織 袋帯 金銀糸 逸品', priceJpy: 52000, url: 'https://auctions.yahoo.co.jp/search/search?p=西陣織+袋帯', source: 'Yahoo Auctions' },
    ],
    bandJpy: [26000, 52000],
    recommendedJpy: 39000,
    method: '8件の現行出品の20〜80パーセンタイル。未使用・引箔の技法で中央値を上方修正。',
    generatedCode: seed.comps.generatedCode,
  },
  story: {
    titleJa: '西陣織 袋帯',
    inscriptionJa: '西陣織 引箔袋帯',
    storyJa:
      '帯は織る前に糸を染めます。金の糸は和紙に漆で箔を貼り、それを髪よりも細く裁って織り込んだものです。柄は祖母が図案帳に残した文様を、そのまま母が織り継ぎました。',
    careJa: '湿気を避け、たとう紙に包んで平らに保管してください。金銀糸の部分は強くこすらないでください。',
    heritageJa:
      '祖母がこの工房で織子をしており、母がその技を継ぎました。今の柄は祖母が図案帳に残していたものです。',
  },
  localized: {
    en: {
      title: 'Nishijin Brocade Obi',
      story:
        'The thread is dyed before the weave, not after. The gold is foil paper lacquered and cut finer than a hair, woven in — you can see the pattern reversed on the back, proof it is woven rather than printed. The design is her grandmother\'s, kept in a pattern book and rewoven by her mother.',
      whyItMatters:
        'A woven obi carries a design the way an heirloom carries a name — this one has already passed through two weavers in the same family before reaching a collector.',
      shippingNote: 'Ships flat from Kyoto, wrapped in acid-free paper. EMS, 5–8 days. Silk textiles carry no export restriction.',
      heritage:
        "Her grandmother wove at this workshop, and her mother carried the technique forward. The pattern on this obi is the grandmother's own, kept in a design book and rewoven by hand.",
    },
    zh: {
      title: '西阵织 袋带',
      story: '织造前先染线,而非织后染色。金线是漆贴金箔纸后裁得比发丝还细再织入的——带子背面纹样是反色的,正是手织而非印刷的证明。图案是祖母留在图案本里的,由母亲重新织出。',
      whyItMatters: '一条手织的带子承载的图案,如同传家之名。这一条已经在同一个家族里经过两代织工之手。',
      shippingNote: '自京都平铺发货,防酸纸包裹。EMS 5-8 日。真丝织物无出口限制。',
      heritage: '祖母曾在这间工房织带,母亲继承了这门手艺。带子上的图案正是祖母留在图案本中的那一枚,由母亲重新织出。',
    },
    fr: {
      title: 'Obi en brocart de Nishijin',
      story:
        "Le fil est teint avant le tissage, non après. L'or est un papier doré laqué, coupé plus fin qu'un cheveu et tissé — le motif apparaît inversé au dos, preuve qu'il est tissé et non imprimé. Le dessin est celui de sa grand-mère, conservé dans un carnet et retissé par sa mère.",
      whyItMatters: "Un obi tissé porte un motif comme un objet de famille porte un nom — celui-ci a déjà traversé deux tisserandes de la même famille.",
      shippingNote: "Expédié à plat de Kyoto, emballé dans du papier sans acide. EMS, 5 à 8 jours.",
      heritage: "Sa grand-mère tissait dans cet atelier, et sa mère a repris la technique. Le motif de cet obi est celui que sa grand-mère avait conservé dans un carnet de dessin.",
    },
    ko: {
      title: '니시진오리 후쿠로오비',
      story:
        '실은 짜기 전에 먼저 염색합니다. 금실은 옻으로 금박을 입힌 종이를 머리카락보다 가늘게 잘라 짜 넣은 것으로, 뒷면에서 무늬가 반전되어 보이는 것이 인쇄가 아닌 직조라는 증거입니다. 무늬는 할머니가 도안첩에 남긴 것을 어머니가 그대로 다시 짰습니다.',
      whyItMatters: '짜여진 오비가 담은 무늬는 가보가 이름을 담듯 합니다. 이 오비는 이미 한 집안의 두 직공을 거쳤습니다.',
      shippingNote: '교토에서 평평하게 포장하여 발송. EMS 기준 5-8일.',
      heritage: '할머니가 이 공방에서 오비를 짰고 어머니가 그 기술을 이었습니다. 이 오비의 무늬는 할머니가 도안첩에 남긴 것입니다.',
    },
  },
  priceJpy: 39000,
  createdAt: '2026-04-20T07:45:00.000Z',
  place: withCoords(place('京都府', '京都市'), 35.0328, 135.7458, '京都府京都市上京区西陣'),
};

const echizenWashi: Piece = {
  id: 'ew01',
  storeName: '越前 紙漉き工房',
  storeSlug: 'echizen-kamisuki-workshop',
  storeOrigin: '越前市今立の紙漉き集落で祖父の代から簀桁を使い、川の水と楮だけで紙を漉いています。',
  storePeople: '私と息子の二人で、冬場は毎朝暗いうちから紙を漉いております。',
  imageDataUrl: '/craft4.jpg',
  images: ['/craft4.jpg', '/echizen-washi.svg'],
  voice: {
    transcriptJa: '楮の皮を煮て、叩いて、簀桁で流し漉きします。水の冷たい冬の方が紙が締まって良いものができます。',
    heritageJa: '',
  },
  vision: {
    craft: 'Echizen washi',
    craftJa: '越前和紙',
    objectJa: '和紙',
    material: ['楮', '雁皮', '三椏'],
    technique: ['流し漉き', '打雲'],
    regionGuess: '福井県越前市',
    condition: '完品。未使用、湿気による波打ちなし。',
    features: [
      'visible long kōzo fibres suspended unevenly through the sheet, not printed texture',
      'soft deckle edge on all four sides from the su-geta frame',
      'faint cloud-like density variation (打雲) from the second pour',
      'holds ink without feathering, tested at the corner',
    ],
    confidence: 0.77,
    candidates: [
      { craftJa: '越前和紙', craft: 'Echizen washi', prefecture: '福井県', category: '和紙', score: 0.8 },
      { craftJa: '美濃和紙', craft: 'Mino washi', prefecture: '岐阜県', category: '和紙', score: 0.57 },
      { craftJa: '土佐和紙', craft: 'Tosa washi', prefecture: '高知県', category: '和紙', score: 0.5 },
    ],
    ambiguous: false,
  },
  mark: null,
  comps: {
    items: [
      { title: '越前和紙 打雲 書道用', priceJpy: 3200, url: 'https://auctions.yahoo.co.jp/search/search?p=越前和紙', source: 'Yahoo Auctions' },
      { title: '越前和紙 手漉き 一帖', priceJpy: 5800, url: 'https://jp.mercari.com/search?keyword=越前和紙', source: 'Mercari' },
      { title: '越前和紙 職人手漉き 高級', priceJpy: 8200, url: 'https://auctions.yahoo.co.jp/search/search?p=越前和紙+手漉き', source: 'Yahoo Auctions' },
    ],
    bandJpy: [3200, 8200],
    recommendedJpy: 5400,
    method: '6件の現行出品の20〜80パーセンタイル。手漉き・打雲技法で中央値を調整。',
    generatedCode: seed.comps.generatedCode,
  },
  story: {
    titleJa: '越前和紙 打雲',
    inscriptionJa: '越前和紙 打雲一帖',
    storyJa:
      '楮の皮を煮て叩き、簀桁で流し漉きします。水が冷たい冬ほど繊維が締まって良い紙になるので、寒い時期を選んで漉いております。一枚ごとに厚みが少し違うのはそのためです。',
    careJa: '直射日光と高湿度を避けて保管してください。折り目をつけると繊維が切れますので、平らに保管をお勧めします。',
    heritageJa: '',
  },
  localized: {
    en: {
      title: 'Echizen Washi, Cloud-Dyed Sheet',
      story:
        'The kōzo bark is boiled, beaten, then poured across a bamboo screen by hand. Cold winter water tightens the fibre, so the coldest weeks are chosen on purpose — that is why no two sheets are quite the same thickness.',
      whyItMatters:
        'This is the paper Japanese painters and calligraphers still specify by region, not just by grade — Echizen has supplied court paper since before it had a prefecture name.',
      shippingNote: 'Ships flat from Fukui between board to prevent creasing. EMS, 4–7 days. No restriction on contemporary washi.',
      heritage: '',
    },
    zh: {
      title: '越前和纸 打云纹',
      story: '楮树皮先煮后捶,再用竹帘手工浇漉。冬季水冷能让纤维更紧实,因此特意选在最冷的时节抄纸——这也是每张纸厚度略有不同的原因。',
      whyItMatters: '这是日本画家与书法家至今仍按产地而非等级指定使用的纸——越前供纸的历史比这个县名本身还要久。',
      shippingNote: '自福井平铺发货,夹板防止折痕。EMS 4-7 日。当代和纸无出口限制。',
    },
    fr: {
      title: 'Washi d\'Echizen, feuille nuageuse',
      story:
        "L'écorce de kōzo est bouillie, battue, puis versée à la main sur un tamis de bambou. L'eau froide de l'hiver resserre la fibre, aussi choisit-on exprès les semaines les plus froides — d'où de légères variations d'épaisseur d'une feuille à l'autre.",
      whyItMatters: "C'est le papier que peintres et calligraphes japonais exigent encore par région, pas seulement par qualité.",
      shippingNote: "Expédié à plat de Fukui, entre cartons rigides. EMS, 4 à 7 jours.",
    },
    ko: {
      title: '에치젠 와시, 구름무늬 종이',
      story:
        '닥나무 껍질을 삶고 두드린 뒤 대나무 발에 손으로 부어 뜹니다. 겨울의 찬물이 섬유를 조여 더 좋은 종이가 되기에 일부러 가장 추운 시기를 골라 뜹니다 — 그래서 종이마다 두께가 조금씩 다릅니다.',
      whyItMatters: '일본 화가와 서예가들이 등급이 아니라 산지로 지금도 지정하는 종이입니다.',
      shippingNote: '후쿠이에서 평평하게, 판 사이에 끼워 발송. EMS 기준 4-7일.',
    },
  },
  priceJpy: 5400,
  createdAt: '2026-03-11T02:00:00.000Z',
  place: withCoords(place('福井県', '越前市'), 35.9046, 136.1853, '福井県越前市新在家'),
};

const beppuBamboo: Piece = {
  id: 'bp01',
  storeName: '別府 竹工房',
  storeSlug: 'beppu-take-workshop',
  storeOrigin: '別府の竹細工組合で修業したのち、独立してこの工房を構えて二十年になります。',
  storePeople: '私一人で、竹の仕入れから編みまで通しで手がけています。',
  imageDataUrl: '/beppu-bamboo.svg',
  images: ['/beppu-bamboo.svg'],
  voice: {
    transcriptJa: '真竹を割って、幅を揃えて、四つ目編みで底を組んでから立ち上げます。竹は油抜きしてから二年寝かせます。',
    heritageJa: '',
  },
  vision: {
    craft: 'Beppu bamboo craft',
    craftJa: '別府竹細工',
    objectJa: '盛籠',
    material: ['真竹'],
    technique: ['四つ目編', '網代編'],
    regionGuess: '大分県別府市',
    condition: '完品。竹ひごの割れ・虫食いなし。',
    features: [
      'split madake bamboo strips of uniform width, edges hand-planed smooth',
      'four-eye (四つ目) weave at the base transitioning to a denser body weave',
      'natural oil sheen from the removal process, no lacquer coating',
      'rim finished with a wrapped binding, not glued',
    ],
    confidence: 0.75,
    candidates: [
      { craftJa: '別府竹細工', craft: 'Beppu bamboo craft', prefecture: '大分県', category: '竹工品', score: 0.78 },
      { craftJa: '駿河竹千筋細工', craft: 'Suruga bamboo ware', prefecture: '静岡県', category: '竹工品', score: 0.6 },
      { craftJa: '大館曲げわっぱ', craft: 'Odate bentwood work', prefecture: '秋田県', category: '木工品', score: 0.42 },
    ],
    ambiguous: false,
  },
  mark: null,
  comps: {
    items: [
      { title: '別府竹細工 盛籠 四つ目編', priceJpy: 8800, url: 'https://auctions.yahoo.co.jp/search/search?p=別府竹細工+籠', source: 'Yahoo Auctions' },
      { title: '別府竹細工 手提げ籠', priceJpy: 13000, url: 'https://jp.mercari.com/search?keyword=別府竹細工', source: 'Mercari' },
      { title: '別府竹細工 網代編 花籠', priceJpy: 16500, url: 'https://auctions.yahoo.co.jp/search/search?p=別府竹細工', source: 'Yahoo Auctions' },
    ],
    bandJpy: [8800, 16500],
    recommendedJpy: 12000,
    method: '5件の現行出品の20〜80パーセンタイル。編み目の密度で中央値を調整。',
    generatedCode: seed.comps.generatedCode,
  },
  story: {
    titleJa: '別府竹細工 盛籠',
    inscriptionJa: '別府竹細工 四つ目盛籠',
    storyJa:
      '真竹を割って幅を揃え、油を抜いてから二年寝かせます。四つ目編みで底を組み、そこから編み目を締めながら立ち上げていきます。急いで編むと目が揃いません。',
    careJa: '水に浸けたままにしないでください。使用後は風通しの良い場所で自然乾燥させてください。',
    heritageJa: '',
  },
  localized: {
    en: {
      title: 'Beppu Bamboo Serving Basket',
      story:
        'Madake bamboo is split, trimmed to an even width, oiled and rested for two years before it is woven. The base starts as a four-eye weave and tightens as the sides rise — rush it and the weave goes uneven.',
      whyItMatters:
        'Beppu\'s weaves are dense enough to hold their shape without a lacquer coat — the bamboo\'s own oil is the only finish, and it darkens honestly with handling.',
      shippingNote: 'Ships from Oita, lightly packed — bamboo tolerates transit well. EMS, 5–9 days. No export restriction.',
      heritage: '',
    },
    zh: {
      title: '别府竹编 盛篮',
      story: '真竹剖开、削至等宽,去油后陈放两年才开始编织。篮底以四目编起底,越往上编目越紧——编得急了,目就乱了。',
      whyItMatters: '别府的编法紧密到无需上漆就能定型——竹子自身的油脂就是唯一的涂层,会随使用诚实地变深色。',
      shippingNote: '自大分县发货,竹编耐运输,包装从简。EMS 5-9 日。',
    },
    fr: {
      title: 'Panier en bambou de Beppu',
      story:
        "Le bambou madake est fendu, taillé à largeur égale, dégraissé puis reposé deux ans avant le tissage. La base commence en tissage à quatre yeux et se resserre en montant — précipité, le tissage devient irrégulier.",
      whyItMatters: "Le tissage de Beppu est assez dense pour tenir sa forme sans laque — seule l'huile propre du bambou finit la pièce.",
      shippingNote: "Expédié d'Oita, emballage léger. EMS, 5 à 9 jours.",
    },
    ko: {
      title: '벳푸 대나무 소쿠리',
      story:
        '참대를 쪼개 폭을 맞추고, 기름을 뺀 뒤 이 년을 재웠다가 엮기 시작합니다. 바닥은 사각눈뜨기로 시작해 위로 갈수록 눈을 조입니다 — 서두르면 눈이 고르지 않습니다.',
      whyItMatters: '벳푸의 엮음은 옻칠 없이도 형태를 유지할 만큼 촘촘합니다. 대나무 자체의 기름기가 유일한 마감입니다.',
      shippingNote: '오이타에서 발송, 대나무는 운송에 강해 포장이 간단합니다. EMS 기준 5-9일.',
    },
  },
  priceJpy: 12000,
  createdAt: '2026-02-08T05:30:00.000Z',
  place: withCoords(place('大分県', '別府市'), 33.2846, 131.4914, '大分県別府市南立石'),
};

const edoKiriko: Piece = {
  id: 'ek01',
  storeName: '江戸切子 硝子工房',
  storeSlug: 'edo-kiriko-glassworks',
  storeOrigin: '江東区の硝子団地で父が始めた工房で、私が二代目としてカットの型を増やしてきました。',
  storePeople: '私が割り出しとカットを、パートの職人が磨きを担当しています。',
  imageDataUrl: '/edokiriko.svg',
  images: ['/edokiriko.svg'],
  voice: {
    transcriptJa: '色被せのガラスをダイヤモンドホイールで切り込みます。菊繋ぎの文様は一列でも狂うと目立つので、割り出しからやり直します。',
    heritageJa: '',
  },
  vision: {
    craft: 'Edo kiriko',
    craftJa: '江戸切子',
    objectJa: '切子グラス',
    material: ['色被せガラス', 'クリスタル'],
    technique: ['菊繋ぎ', '矢来'],
    regionGuess: '東京都江東区',
    condition: '完品。カット面の欠けなし。',
    features: [
      'colour-cased crystal cut back to clear glass, layered not painted',
      'chrysanthemum-lattice (菊繋ぎ) cut pattern, hand-marked before cutting',
      'sharp edges on every facet, hand-polished — no soft moulded lines',
      'base cut with a radiating star pattern visible from underneath',
    ],
    confidence: 0.73,
    candidates: [
      { craftJa: '江戸切子', craft: 'Edo kiriko', prefecture: '東京都', category: 'その他工芸品', score: 0.76 },
      { craftJa: '薩摩切子', craft: 'Satsuma kiriko', prefecture: '鹿児島県', category: 'その他工芸品', score: 0.55 },
    ],
    ambiguous: false,
  },
  mark: null,
  comps: {
    items: [
      { title: '江戸切子 グラス 菊繋ぎ', priceJpy: 9800, url: 'https://auctions.yahoo.co.jp/search/search?p=江戸切子+グラス', source: 'Yahoo Auctions' },
      { title: '江戸切子 ペアグラス 職人', priceJpy: 18000, url: 'https://jp.mercari.com/search?keyword=江戸切子', source: 'Mercari' },
      { title: '江戸切子 グラス 矢来紋', priceJpy: 15500, url: 'https://auctions.yahoo.co.jp/search/search?p=江戸切子', source: 'Yahoo Auctions' },
    ],
    bandJpy: [9800, 18000],
    recommendedJpy: 13800,
    method: '6件の現行出品の20〜80パーセンタイル。カット密度で中央値を調整。',
    generatedCode: seed.comps.generatedCode,
  },
  story: {
    titleJa: '江戸切子 菊繋ぎ',
    inscriptionJa: '江戸切子 菊繋ぎ紋グラス',
    storyJa:
      '色を被せたガラスをダイヤモンドホイールで削り込みます。菊繋ぎは一列でも間隔が狂うと目立つので、その時は割り出しの線引きからやり直します。妥協した文様は出しません。',
    careJa: '食洗機は避け、手洗いをお願いします。カット面同士がぶつからないよう、他の食器と重ねずに保管してください。',
    heritageJa: '',
  },
  localized: {
    en: {
      title: 'Edo Kiriko Cut-Glass Tumbler',
      story:
        'Colour-cased crystal is cut back to clear glass on a diamond wheel. The chrysanthemum-lattice pattern shows any misaligned row instantly, so a bad line means starting the layout over — nothing uneven leaves this bench.',
      whyItMatters:
        'Every facet is hand-cut and hand-polished, not moulded — you can feel the edges are sharp in a way pressed glass never is.',
      shippingNote: 'Ships from Tokyo, double-boxed with glass-rated packing. EMS, 3–6 days. No export restriction.',
      heritage: '',
    },
    zh: {
      title: '江户切子 玻璃杯',
      story: '色被玻璃在钻石轮上切磨回透明。菊繋纹一列错位便格外明显,一旦出错就要从划线重新开始——绝不让不齐的纹样出厂。',
      whyItMatters: '每一个切面都是手工切割、手工抛光,而非模具压制——棱边的锐利是压制玻璃永远做不到的。',
      shippingNote: '自东京发货,玻璃专用双层包装。EMS 3-6 日。',
    },
    fr: {
      title: 'Verre taillé Edo Kiriko',
      story:
        "Le cristal doublé de couleur est taillé jusqu'au verre clair à la meule diamantée. Le motif en treillis de chrysanthème révèle instantanément toute rangée mal alignée — une ligne ratée signifie tout reprendre depuis le tracé.",
      whyItMatters: "Chaque facette est taillée et polie à la main, jamais moulée — on sent des arêtes que le verre pressé n'a jamais.",
      shippingNote: "Expédié de Tokyo, double emballage spécial verre. EMS, 3 à 6 jours.",
    },
    ko: {
      title: '에도키리코 유리잔',
      story:
        '색을 입힌 크리스탈을 다이아몬드 휠로 깎아 투명 유리를 드러냅니다. 국화무늬는 한 줄만 어긋나도 눈에 띄어, 잘못되면 밑선부터 다시 그립니다. 고르지 않은 무늬는 내보내지 않습니다.',
      whyItMatters: '모든 면이 손으로 깎고 손으로 광낸 것으로, 압축 유리에서는 느낄 수 없는 날카로운 모서리를 가집니다.',
      shippingNote: '도쿄에서 유리 전용 이중 포장으로 발송. EMS 기준 3-6일.',
    },
  },
  priceJpy: 13800,
  createdAt: '2026-01-22T08:15:00.000Z',
  place: withCoords(place('東京都', '江東区'), 35.6984, 139.8014, '東京都江東区亀戸'),
};

function withCoords<T extends { note: string }>(base: T, lat: number, lng: number, address: string): T & { lat: number; lng: number; address: string; mapsUrl: string } {
  return { ...base, lat, lng, address, mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` };
}

export const seedStores: Piece[] = [kutani, wajima, nambu, nishijin, echizenWashi, beppuBamboo, edoKiriko];
