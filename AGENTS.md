# CLAUDE.md — 継 TSUGI

Agent Forge AI Hackathon: Tokyo Creativity. One-day build.

---

## 0. Read this first

You are helping build a demo that must be **live on the public internet by 16:00 today**. Submission is a 3-minute live demo.

The rubric is: theme alignment (Japan/craft), innovation, real problem, **and "more sponsored products integrated, higher the score — we check code level integrations."** That last criterion is the only objective one. Six sponsors must appear in real code paths.

Optimise for: a working golden path, visible autonomy, and six live provider integrations. Nothing else.

---

## 1. What we are building

A Japanese craftsperson photographs one piece and records a 20-second voice memo. In under 40 seconds, TSUGI produces a **live, deployed, four-language storefront** for that piece: a provenance story in the artisan's own voice, a price benchmarked against real live listings, and export/shipping notes.

The pitch: Japan has ~240 crafts formally designated by METI. Demand for them has never been higher; the workshops are dying anyway, because a 73-year-old woodworker in Ishikawa has no website, no English, and no idea what his work is worth in Paris. TSUGI is the missing distribution layer, and every token about his technique stays on Japanese soil.

---

## 2. Hard constraints

| | |
|---|---|
| Build window | 11:30 → 15:30. Code freeze 15:30. |
| Pipeline latency target | **< 40s end to end.** Non-negotiable — it is the demo. |
| Deploy target | Vercel. A live URL must exist by 12:30 with fake data. |
| Team | 4 people, 4 workstreams (§15). |
| Demo | 3 minutes, one golden path, ends on a QR code. |

---

## 2b. Credit budget

| Provider | Granted | What the number tells us |
|---|---|---|
| Daytona | **$200** | By a wide margin the largest grant. Daytona expects to be the centrepiece. Spin sandboxes freely; never optimise sandbox count. |
| ai& | **$50** | Their per-token price sits ~80% below frontier, so this is an enormous token budget. Route every high-frequency call here. |
| Qwen Cloud | $20 | Vision only. Do not put vision inside a loop. |
| Nosana | **$13** | GPU-hours, not tokens. **The only hard cap in the stack.** Bring the endpoint up at 12:30, keep it warm through the demo, tear it down after. Never leave a GPU idling from 11:00. |
| GMI Cloud | $10 | Smallest budget. Four localisation calls per run and nothing else — never GMI for retries or repair passes. |
| Qoder | unknown | Dev-time only, zero runtime cost. Use it as the coding agent for this repo; that *is* the integration. |

Nobody runs out of credits in four hours except on Nosana. The binding constraint is time. Do not spend a single minute optimising spend.

---

## 3. Hard no's

Do not build, suggest, or scaffold any of these. They have all killed hackathon teams before:

- Auth, login, user accounts, sessions
- A database, an ORM, migrations, Prisma
- Fine-tuning, vector databases, RAG over a document corpus. The craft index in §8b is **not** this: it is a 244-row JSON file and a cosine loop. No pgvector, no Pinecone, no Chroma.
- A mobile app, React Native, Expo
- Payments, Stripe, checkout
- Docker, docker-compose, Kubernetes
- Tests, CI, linting config, pre-commit hooks
- A monorepo, workspaces, shared packages
- Any dependency not listed in §4
- Refactoring working code

If a feature is not on the golden path in §8, it does not get built.

---

## 4. Stack

- Next.js 15, App Router, TypeScript, deployed on Vercel
- Tailwind CSS
- `@daytonaio/sdk` — the only provider SDK
- `qrcode` — QR generation, client side
- Nothing else. No state library, no UI kit, no form library, no animation library.

Everything talks to models over plain `fetch`. All five LLM providers are OpenAI-compatible, so there is **one adapter** (§10).

---

## 5. Repo layout

Create exactly this. Do not add directories.

```
app/
  page.tsx                 forge UI — the two-pane console
  s/[id]/page.tsx          the generated storefront (public, this is the QR target)
  api/
    forge/route.ts         streaming orchestrator
    health/route.ts        live ping of all 6 providers
    prewarm/route.ts       creates the Daytona sandbox early
lib/
  llm.ts                   the single OpenAI-compatible adapter
  providers.ts             six named provider configs
  pipeline.ts              the six stages, in order
  sandbox.ts               Daytona wrapper
  store.ts                 in-memory Piece store + seed
  seed.ts                  one complete hardcoded Piece — BUILD THIS FIRST
  crafts.ts                identify() — grounded craft classification, §8b
  crafts.data.json         the 244 METI-designated crafts
  mark.ts                  readMark() — Nosana seal-script OCR
  place.ts                 provenance → travel time. CUT FIRST if behind
  types.ts                 all types from §7
components/
  TracePane.tsx            left pane
  Storefront.tsx           right pane, also used by /s/[id]
INTEGRATIONS.md            sponsor audit trail — see §14
```

---

## 6. Environment variables

Every provider is a base URL + key + model. No hardcoded endpoints anywhere in the code.

```bash
# 1. ai& — Japanese authoring, in-Japan inference
AIAND_BASE_URL=
AIAND_API_KEY=
AIAND_MODEL=

# 2. Qwen Cloud — vision
QWEN_BASE_URL=
QWEN_API_KEY=
QWEN_MODEL=

# 3. GMI Cloud — multilingual fan-out
GMI_BASE_URL=
GMI_API_KEY=
GMI_MODEL=

# 4. Nosana — self-hosted vLLM endpoint, Japanese mark reading
NOSANA_BASE_URL=
NOSANA_API_KEY=
NOSANA_MODEL=

# 5. Daytona — sandboxed code execution
DAYTONA_API_KEY=

# 6. Qoder — dev-time only, no runtime key

# Fallback only. Never primary. Never mentioned in the pitch.
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_API_KEY=
GROQ_MODEL=
ENABLE_FALLBACK=true
```

Confirm each base URL and model string with the sponsor engineer at the 10:45 workshop. Do not guess them from memory — if a value is unknown, leave it blank and the stage degrades gracefully per §16.

---

## 7. Types

`lib/types.ts`. These are contracts. Do not change shapes once the frontend is consuming them.

```ts
export type Provider = 'aiand' | 'qwen' | 'gmi' | 'nosana' | 'daytona' | 'groq';
export type StepId = 'see' | 'mark' | 'comps' | 'story' | 'localize' | 'ship';
export type Lang = 'en' | 'zh' | 'fr' | 'ko';

export interface Vision {
  craft: string;            // "Kutani ware"
  craftJa: string;          // "九谷焼"
  objectJa: string;         // "盃"
  material: string[];
  technique: string[];
  regionGuess: string | null;
  condition: string;
  features: string[];       // max 4
  confidence: number;       // 0-1
  candidates: CraftCandidate[];  // top 3 from the grounded index, §8b
  ambiguous: boolean;            // top1 - top2 < 0.05 -> surface both, ask
}

export interface CraftCandidate {
  craftJa: string;          // "越前漆器"
  craft: string;            // "Echizen lacquerware"
  prefecture: string;       // "福井県"
  category: string;         // "漆器"
  score: number;            // 0-1 similarity against the index
}

export interface Place {
  prefecture: string;
  city: string;
  travelMinutes: number | null;
  openToday: boolean | null;
  note: string;             // one line, human readable
}

export interface Mark {
  textRaw: string | null;   // characters read off the seal / box / tag
  reading: string | null;   // kana reading
  interpretation: string | null;
  confidence: number;
}

export interface CompItem { title: string; priceJpy: number; url: string; source: string }

export interface Comps {
  items: CompItem[];        // max 12
  bandJpy: [number, number];
  recommendedJpy: number;
  method: string;           // one sentence, human readable
  generatedCode: string;    // the Python the agent wrote — SHOWN IN THE UI
}

export interface Story {
  titleJa: string;
  inscriptionJa: string;    // the 箱書き — max 40 chars, vertical display
  storyJa: string;          // 2-3 sentences, artisan first person
  careJa: string;
}

export interface LocalizedCopy { title: string; story: string; whyItMatters: string; shippingNote: string }

export interface Piece {
  id: string;               // 4-char base36
  imageDataUrl: string;
  vision: Vision;
  mark: Mark | null;
  comps: Comps;
  story: Story;
  localized: Record<Lang, LocalizedCopy>;
  priceJpy: number;
  createdAt: string;
  sandboxUrl?: string;
  place?: Place | null;     // optional, cut-first
}
```

---

## 8. The pipeline

`lib/pipeline.ts`. Six stages. **Stages inside the same wave run with `Promise.allSettled`** — this is how we hit 40 seconds.

**Wave 1 (parallel, ~8s)**
- `see` → **Qwen Cloud**, vision model. Input: image. Output: visual features **only** — glaze, foot ring, grain, joinery, marks. It is explicitly forbidden from naming a tradition. Naming happens in §8b, and the reason is not stylistic.
- `mark` → **Nosana**, self-hosted endpoint. Input: image. Output: `Mark`. Reads the 落款 / 銘 / box calligraphy. This stage exists because no hosted API is good at Japanese seal script, which is precisely why it runs on our own GPU.

**Wave 2 (parallel, ~16s)**
- `comps` → **Daytona**. The agent *writes* Python, we execute it in the sandbox, it returns live listings. Output: `Comps`.
- `story` → **ai&**. Input: `Vision` + `Mark` + transcript. Output: `Story`. All Japanese generation happens here, on Japanese infrastructure.

**Wave 3 (parallel, ~8s)**
- `localize` → **GMI Cloud**. Four concurrent calls, one per language. Output: `Record<Lang, LocalizedCopy>`. These are localisations, not translations — each names why *that* market should care.

**Wave 4 (~2s)**
- `ship` → assemble `Piece`, write to `store`, return `/s/{id}`. If the Daytona sandbox is alive, also serve the storefront HTML from inside it and surface `getPreviewLink(port)` as `sandboxUrl`.

### Prompts

`see` (Qwen). Temperature 0.2. Response must be JSON only.

```
You are appraising a piece of Japanese craft from a single photograph.
Identify the craft tradition, the object type, materials, and visible techniques.
If a region is suggested by form, glaze, or joinery, name it; otherwise null.
Note at most four features a collector would care about.
Be specific: "aote overglaze in five colours", not "decorated".
If you cannot identify the tradition, set confidence below 0.4 and say so — do not guess a famous kiln.
Return only JSON matching this schema: {schema}
```

`story` (ai&). Temperature 0.8.

```
あなたは日本の伝統工芸の作品カードを書く職人本人です。
以下の情報から、箱書き・作品の物語・手入れの説明を書いてください。
・一人称。謙譲を保ちつつ、技術への誇りは隠さない。
・箱書きは40字以内。作品名と作者の要素のみ。
・物語は2〜3文。産地・素材・技法の具体を必ず一つ以上含める。
・誇張、マーケティング表現、「唯一無二」等の常套句は使わない。
・情報が不足している点は書かない。推測で産地を書かない。
JSONのみで返答: {schema}
```

`localize` (GMI, one call per language). Temperature 0.6.

```
Localise this Japanese craft listing for a {lang} collector.
Do not translate literally. Name the one thing a buyer in this market
would recognise as the reason this object is worth its price.
Keep the artisan's voice. No marketing superlatives.
Return only JSON: {schema}
```

`comps` (Daytona). The model writes the scraper; we run it. Prompt the code generation with:

```
Write a self-contained Python 3 script using only the standard library
(urllib.request, json, re) that searches Japanese resale marketplaces for
comparable items to: {craftJa} {objectJa} {technique}.
Print a single JSON object to stdout: {"items":[{"title","priceJpy","url","source"}],"method":"..."}
No dependencies. No input(). Fail closed: print {"items":[],"method":"..."} on any error.
Timeout every request at 5 seconds.
```

Then `sandbox.process.codeRun(source)`, parse stdout, and compute `bandJpy` as the 20th–80th percentile and `recommendedJpy` as the median adjusted for condition. **Store the generated source in `Comps.generatedCode` and render it in the trace pane.** That code appearing on screen, written seconds earlier, is the moment the demo lands.

> Note on marketplaces: Mercari has **no public C2C write API** — Mercari Shops' GraphQL API is contract-gated. Read paths only. TSUGI produces a paste-ready listing package, never an auto-post. Don't let anyone burn an hour discovering this.

> **Mercari.** Mercari is a *community* partner, not on the scored sponsor list — do not burn time forcing an integration. Two honest uses: (a) their public search is one of the comps sources the generated scraper reads, low-volume and read-only, and if a Mercari rep asks, say exactly that; (b) one line in the pitch — craft objects are built to outlive their owner, and a provenance record is what makes secondhand craft resale trustworthy. That is a real bridge to their circular-economy mission and it costs zero build time. If you want a second comps source that is unambiguously fine to read at volume, use Yahoo Auctions alongside it.

---

## 8b. Grounded identification — the ML workstream

This subsystem exists because the product's single largest failure mode is confident misidentification, and it is a *systematic* failure, not random noise.

Japanese crafts are visually near-identical across traditions. Black lacquer from Echizen, Wajima, Yamanaka and Kishu is indistinguishable in a photograph. Blue-and-white from Arita, Tobe and Seto overlaps heavily. A vision model asked "what is this?" answers with whichever name is most famous — Wajima, Arita, Kutani — because famous names dominate its training distribution. It will be confident and it will be wrong, and since region drives the workshop, the price and the story, one bad guess makes everything downstream confidently wrong.

Three moves fix it.

**A. Separate perception from naming.** `see` returns observable features only and is forbidden from naming a tradition. Naming is retrieval: embed the feature description, cosine it against the 244 designated crafts, return the top 3. The model can no longer invent "artisanal Kyoto pottery" — it must choose from a real list. This alone removes most of the fame bias, because the biased step never sees the label space.

**B. Break ties deliberately.** If `top1 - top2 < 0.05`, run one targeted discriminator call: *"these two traditions differ mainly in {distinguishing feature}; which does the photo show?"* Margin-based routing, one extra call, materially better accuracy.

**C. Show uncertainty.** When `ambiguous` is true the storefront reads "likely 越前漆器, possibly 山中漆器" and the trace pane says so. **This is a demo asset, not a caveat.** A judge will ask how you know it isn't Wajima. Systems that know what they don't know win that exchange; systems that assert lose it.

Build the index by scraping the 伝統的工芸品産業振興協会 listing inside a Daytona sandbox — 244 rows of `{craftJa, craft, prefecture, category, materials[], techniques[], visualCues[]}`. Ship it as `lib/crafts.data.json`. If the scrape stalls past 13:00, hand-enter 40 rows covering the major categories and move on; 40 grounded candidates beat 244 that never load.

**Nosana hosts the embedding model and the seal-script OCR.** This is the honest justification for that integration: a Japanese-language embedding model matching Japanese descriptions to Japanese craft names, and 籭書 seal-script OCR, are not things a general hosted API does well. Own GPU, real reason.

**Interface contract.** The ML workstream delivers exactly two functions and touches no other file:

```ts
// lib/crafts.ts
export async function identify(features: string[]): Promise<CraftCandidate[]>
// lib/mark.ts
export async function readMark(imageDataUrl: string): Promise<Mark>
```

Both must return within 6s or throw. Stub them returning `seed` values at 11:45 so the orchestrator is never blocked.

**Then measure it.** Twenty photos with known answers off the association site, run `identify`, report top-1 and top-3 accuracy. A real measured number on the architecture slide is close to unheard of at a hackathon and takes thirty minutes. If accuracy is poor, say the number anyway — a team that measured and reported 61% reads as more competent than a team that claims accuracy and never checked.

---

## 9. Streaming event protocol

`app/api/forge/route.ts` returns newline-delimited JSON over a `ReadableStream`. Set `export const maxDuration = 300`. Do not buffer and return at the end — the stream *is* the product.

```ts
export type ForgeEvent =
  | { t: 'step_start'; id: StepId; provider: Provider; label: string; labelJa: string }
  | { t: 'code';       id: StepId; source: string }
  | { t: 'log';        id: StepId; line: string }
  | { t: 'step_done';  id: StepId; provider: Provider; ms: number; calls: number; costJpy: number; data: unknown }
  | { t: 'step_fail';  id: StepId; provider: Provider; ms: number; error: string }
  | { t: 'done';       storefrontUrl: string; sandboxUrl?: string; piece: Piece; totalMs: number; totalCalls: number; totalCostJpy: number };
```

Every stage emits `step_start` before work and exactly one of `step_done` / `step_fail`. A `step_fail` never aborts the pipeline — it degrades (§16).

Track `calls` and `costJpy` per stage honestly from token counts. The total matters: **the cost line is the ai& argument made visible.** Their own framing is that agent loops chain many calls and each one costs money and cross-border latency. Our run makes ~40 calls. Show that.

---

## 10. The provider adapter

`lib/llm.ts` — one function, all five LLM providers.

```ts
export async function chat(opts: {
  provider: Provider;
  messages: unknown[];
  json?: boolean;
  temperature?: number;
  timeoutMs?: number;
}): Promise<{ text: string; ms: number; promptTokens: number; completionTokens: number }>
```

Behaviour:
- Reads base URL / key / model from `lib/providers.ts` by provider name.
- POSTs `{model, messages, temperature}` to `${baseUrl}/chat/completions` with `Authorization: Bearer ${key}`.
- `json: true` → append "Return only JSON, no prose, no code fences" to the system message, then strip ``` fences and parse. On parse failure, one repair attempt via `groq` if `ENABLE_FALLBACK`.
- Default timeout 20000ms. On timeout or non-2xx, throw a typed error the pipeline catches.
- Never retry more than once. We do not have time for exponential backoff.

`lib/sandbox.ts` wraps Daytona:

```ts
getSandbox(): Promise<Sandbox>   // reuses a module-level singleton
runPython(source: string): Promise<{ stdout: string; ms: number }>
serveHtml(html: string): Promise<string>   // writes file, starts http.server, returns getPreviewLink
```

`/api/prewarm` calls `getSandbox()` and is fired from `page.tsx` on mount. Sandbox creation is fast but dependency-free startup still costs seconds we don't have at demo time.

---

## 11. UI

`app/page.tsx` is a two-pane console. Left is the paperwork, right is the piece.

```
┌──────────────────────────────────────────────────────────────────┐
│ 継 TSUGI                       36.4s · 41 calls · ¥2.10 · 6/6 ●  │
├───────────────────────────┬──────────────────────────────────────┤
│ FORGE TRACE               │                                      │
│                           │   ┌──────────┐   九                  │
│ ● 見る    see             │   │          │   谷    石            │
│   Qwen Cloud    6.2s ✓    │   │  [photo] │   焼    川   ┌───┐    │
│                           │   │          │        県   │ 銘 │    │
│ ● 銘      mark            │   │          │   盃    能  └───┘    │
│   Nosana        4.8s ✓    │   └──────────┘        美            │
│   読み: 三代 徳田          │                       市            │
│                           │  ───────────────────────────────      │
│ ● 相場    comps           │  Kiln      Technique   Body    Rim    │
│   Daytona      12.4s ✓    │  Kutani    Aote        Stone   62mm   │
│   ┌─────────────────────┐ │  ───────────────────────────────      │
│   │ import urllib.reque │ │                                      │
│   │ q = "九谷焼 盃 青手" │ │  父の窯を継いで      Forty years at   │
│   │ ...                 │ │  四十年、この        his father's     │
│   └─────────────────────┘ │  青手の緑は…         kiln. The green  │
│   11 listings ¥19k–¥34k   │                      of aote can't…   │
│                           │  ───────────────────────────────      │
│ ● 語り    story           │  Comparable ¥19,000–¥34,000 · 11      │
│   ai&           5.1s ✓    │                                      │
│   すべて国内推論           │  ¥28,000        ┌──────────┐         │
│                           │                 │ ▓▓ ▓ ▓▓  │         │
│ ● 翻訳    localize        │  [日本語][EN]   │ ▓ ▓▓▓ ▓  │         │
│   GMI Cloud     7.0s ✓    │  [中文][FR]     │ ▓▓ ▓  ▓▓ │         │
│                           │                 └──────────┘         │
│ ● 出荷    ship            │                 tsugi.app/s/k9f2      │
│   0.9s ✓  → /s/k9f2       │                                      │
└───────────────────────────┴──────────────────────────────────────┘
```

Left pane: monospace, hairline rules, no cards, no rounded corners, no shadows. It should read as a shipping manifest or a 栞 insert card — the paperwork that travels with the piece. Steps appear as the stream arrives; completed steps show provider, latency, and one line of extracted evidence. The generated Python appears inline, dense, small.

Right pane: see §12.

Empty state is a single line: *"Photograph a piece."* Not a hero, not an illustration.

Failure state per step: `● 銘 mark — Nosana unreachable · continuing without mark`. Errors state what happened and that we continued. They do not apologise.

---

## 12. Storefront design

**Design thesis: the page is a 共箱** — the signed wooden box a craft piece travels in. Signature element is the **箱書き**, the vertical sumi inscription on the lid, with the red 落款 as the only saturated thing on the page. Build to that and nothing else.

Do not produce a cream background with a large centred serif headline and a terracotta accent. That is the default that every generated page arrives at, and it will read as templated to a Tokyo design judge.

Tokens:

```
--paper    #E6E6DF   paulownia — cool grey-green, NOT warm cream
--plate    #DAD8CF   photo well
--rule     #C6C4B9   hairlines only, 1px, never borders on all four sides
--sumi     #191917   text
--ash      #6E6E68   metadata
--shu      #A8342A   seal + price. Nothing else. Ever.
```

Type:
- Japanese: `'Yu Mincho', 'Hiragino Mincho ProN', 'Noto Serif JP', serif`. Mincho, not gothic.
- Latin: one narrow grotesque for metadata and labels. **Not a serif** — a Latin serif beside Mincho is the obvious pairing and reads as stock.
- Two sizes for body (14 / 13), one display size for the vertical title (26), 10px for field labels with `letter-spacing: .1em`.

Layout rules:
- The vertical title uses `writing-mode: vertical-rl`. This is the risk we are taking and it is correct for the subject: real hakogaki runs vertically, right to left. Object name column, then a smaller provenance column to its left, then the seal.
- `border-radius: 0` throughout. Boxes have square corners.
- No gradients, no shadows, no blur, no hover animation.
- Metadata is a row of four fields separated by hairlines, labels above values.
- Japanese story and English story sit **side by side**, equal weight. The Japanese is not a translation of the English; it is the original.
- Price in 朱, Mincho, 30px, with the comparable range above it in 10px ash. The range is what justifies the number — it must be adjacent.
- QR bottom right, 70px, with the URL beneath it in monospace.
- Responsive down to 375px: the two-pane console stacks, storefront first.

`/s/[id]` renders `Storefront.tsx` standalone with no chrome. This URL is what the QR points to and what judges will open on their phones.

---

## 13. Health and telemetry

`app/api/health/route.ts` pings all six providers concurrently with a 3s timeout and returns:

```json
{ "aiand": {"ok": true, "ms": 210}, "qwen": {...}, "gmi": {...},
  "nosana": {...}, "daytona": {...}, "qoder": {"ok": true, "note": "build-time"},
  "score": "6/6" }
```

The header renders `6/6 ●` from this, polled once on mount. During the demo it is on screen the entire time.

This is a 20-minute build that directly answers the one objective judging criterion, proves the integrations without anyone reading code, and tells the ai& cost-and-latency story for us. Build it before any polish.

---

## 14. INTEGRATIONS.md

Required deliverable. The organisers stated they check code-level integration. Make it trivial for them.

One section per sponsor, in this exact format:

```
## ai&
Role:      All Japanese-language generation.
Files:     lib/providers.ts:12, lib/pipeline.ts:88-131
Calls:     ~28 per run (story + per-field verification passes)
Why:       Japanese-native quality, and an artisan's technique never
           leaves Japanese infrastructure. Agent loops make many cheap
           calls; onshore inference removes the round-trip from each one.
Evidence:  /api/health → aiand.ok
```

Include Groq honestly, marked `Role: fallback only, disabled by default`. Judges reading the code will find it. A disclosed fallback chain reads as engineering judgement; a hidden one reads as cheating.

---

## 15. Build order

Clock times, not phases. If you are behind at a checkpoint, cut scope — never slip the checkpoint.

| Time | Deliverable | Owner |
|---|---|---|
| 11:30 | `lib/seed.ts` — one complete `Piece` for a real 九谷焼 cup, fully populated | You |
| 11:45 | `types.ts`, `providers.ts`, `llm.ts` skeleton. All env vars present, blanks allowed | You |
| 12:00 | `Storefront.tsx` renders `seed` correctly. §12 followed exactly | Frontend |
| **12:30** | **Deployed to Vercel. `/s/demo` is live and beautiful.** Non-negotiable | Frontend |
| 12:30 | Nosana vLLM endpoint live via the dashboard. **Never the CLI** | Infra |
| 13:00 | `see` + `story` working against real providers | You |
| 13:00 | `TracePane.tsx` consuming a mocked event stream | Frontend |
| 13:15 | Daytona `runPython` returning stdout | Infra |
| 13:45 | `comps` returning real listings | You + Infra |
| 14:00 | `localize` — four languages in parallel | You |
| **14:30** | **First real end-to-end run. Ugly is fine.** Nosana hard kill if not live | All |
| 14:45 | `/api/health` + telemetry header | Infra |
| 15:00 | `INTEGRATIONS.md` complete with real line numbers | You |
| 15:10 | **Backup video recorded** of a successful run | Frontend |
| 15:30 | **Code freeze.** Rehearse twice with a stopwatch | All |
| 15:45 | Submission form, README, repo public | You |

### Workstreams

**You — orchestrator and all six integrations.** `llm.ts`, `providers.ts`, `pipeline.ts`, `forge/route.ts`, `health/route.ts`, `INTEGRATIONS.md`, the Vercel deploy, the demo script. You are the only person who can hold the sponsor-count criterion, and it is the only criterion with guaranteed points. Do not take frontend work off the designer to "help".

**Designer — the page and the paperwork.** Improve `storefront.html` against §12, then `TracePane.tsx`, then the single architecture slide (six logos, one line each). Tell them explicitly that the trace pane is *demo content*, not debug output — latency, call counts and generated source are the product. Left unbriefed they will treat it as logging and style it accordingly.

**ML — grounded identification, §8b.** Owns `crafts.ts`, `mark.ts`, the Nosana endpoint, and the accuracy number. Self-contained behind two function signatures, so nothing they do can block you. Nosana hard-stops at 14:30: if the endpoint is not live, `identify` falls back to GMI embeddings, `readMark` returns null, and Nosana ships documented-but-degraded.

**JP teammate — content truth and the pitch.** Light load, high leverage. Records the voice memo. Confirms every Japanese string is right. Reads ai&'s output and says whether it sounds like a person or like machine translation — that judgement cannot be outsourced, and a Japanese judge catches stiff Japanese in one second. Delivers the Japanese half of the demo. Talks to sponsor reps and Japanese attendees, where a Japanese student opens doors a foreign intern does not.

Legacy note: **you** own orchestrator + providers. **Frontend** owns both panes and the deploy. **Infra** owns Nosana + Daytona, isolated, hard-timeboxed. **JP-native teammate** sources the demo object, writes and validates all Japanese output, and delivers the Japanese portion of the pitch — if the keigo is wrong, the demo dies in front of a Japanese judge regardless of how good the code is.

---

## 16. Fallback ladder

Every stage degrades. Nothing aborts the pipeline.

| Stage | If it fails | Demo impact |
|---|---|---|
| `see` Qwen | Retry once, then Groq vision, then `seed.vision` | None visible |
| `mark` Nosana | Emit `step_fail`, set `mark: null`, storefront omits the provenance column | Small. Say "the mark reader is on our own GPU and it's flaky on venue wifi" — honest and it still proves the integration |
| `comps` Daytona | Emit the generated code anyway, fall back to `seed.comps` band | Low — the *code on screen* is the point, not the numbers |
| `story` ai& | Groq with the same Japanese prompt | Loses the sovereignty line. Avoid at all costs |
| `localize` GMI | Serialise through ai& | Slower, invisible |
| `ship` | Always works — in-memory store | — |
| Everything | Navigate to `/s/demo` and present the backup video | Demo survives |

If the venue wifi dies: tether the demo laptop to a phone hotspot and have everyone else disable sync. Assume this will happen.

---

## 17. Rules for you, the coding agent

1. **Never break the golden path.** If a change risks §8, don't make it.
2. **Do not add dependencies.** §4 is the complete list. If you think you need another, use `fetch` instead.
3. **Do not refactor.** Duplicated code that works beats abstracted code that might.
4. **Do not write tests, config, or tooling.** There is no time and no reviewer.
5. **If a provider returns 401 or 404, stub the stage, emit `step_fail`, and move on.** Log it in `INTEGRATIONS.md`. Do not spend turns debugging someone else's auth.
6. **Do not invent base URLs or model names.** They come from env vars, confirmed with sponsor engineers. A hallucinated endpoint costs 20 minutes of misattributed debugging.
7. **Every stage keeps its provider attribution.** Never quietly reroute a stage to a different provider to make it work — that destroys the one criterion we are optimising for.
8. **The trace pane is a feature, not logging.** Latency, call counts, cost, and generated source are demo content. Treat them as product.
9. **Short files.** No file over 200 lines. If one grows past that, the scope is wrong.
10. When you finish a task, state what changed in one line and stop. Do not propose improvements.