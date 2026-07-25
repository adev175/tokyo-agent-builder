# Sponsor integrations — 継 TSUGI

Six sponsored products, each in a real code path on the golden run. Live proof at
`/api/health` (all six pinged concurrently, 3s timeout, score rendered in the header).

Live: https://tokyo-agent-builder.vercel.app · marketplace: https://tokyo-agent-builder.vercel.app/market

Post-hackathon, the product split in two: `/market` is the buyer-facing storefront listing
every workshop, `/forge` is the craftsperson console that produces one. `/s/{id}` still
resolves (redirects to the piece's `/market/store/{slug}`) for anyone with an old link.

---

## ai&

Role: All Japanese-language generation, plus the comps parser code generation.
Models: `google/gemma-4-31b-it` for Japanese authoring, `deepseek-ai/deepseek-v4-flash` for
  code generation. Both on `https://api.aiand.com/v1`, both inside Japan.
Files: `lib/providers.ts:13`, `lib/pipeline.ts:300-327` (story), `lib/pipeline.ts:218-298` (codegen)
Calls: 2 per run minimum, more when repair passes fire; ai& carries every high-frequency call.
Why: Japanese-native quality, and an artisan's technique never leaves Japanese
  infrastructure. Agent loops make many cheap calls; onshore inference removes the
  cross-border round-trip from each one — the cost line in the header is that argument
  made visible.
Also: the artisan's spoken family history (dictated in the browser, `lib/speech.ts`) is
  shaped by ai& into the 職人の言葉 block — the one part of a listing no marketplace,
  scraper or model has, because it has never been written down anywhere.
Evidence: `/api/health` → `aiand.ok`; the 箱書き and story on any `/s/{id}` page.

## Qwen Cloud

Role: Vision. One pass over the photograph, observation only. Also the third-choice
  embedding backend behind the craft index when Nosana is down.
Model: `qwen3-vl-plus` via the OpenAI-compatible DashScope endpoint; `text-embedding-v4`
  for the fallback embeddings.
Files: `lib/providers.ts:21`, `lib/pipeline.ts:98-173` (`see`), `lib/pipeline.ts:175-216`
  (constrained pick), `lib/crafts.ts:105-111` (embedding fallback)
Calls: 1 per run, plus 1 constrained-pick call only when the retrieval margin is under 8%.
Why: The `see` stage is forbidden from naming a craft tradition (prompt at
  `lib/pipeline.ts:87-97`) — it returns the material class plus glaze, grain, joinery and
  wear. Naming is retrieval against the METI index, which removes the fame bias a vision
  model has toward famous kiln names. The declared material class then gates the candidate
  pool (`lib/crafts.ts:33-49`): painted wooden kokeshi are scored against the 10 wood and
  doll traditions, never against 九谷焼. Measured on the kokeshi photo, that gate alone moved
  the top-1 answer from 九谷焼 to 宮城伝統こけし. Vision never runs in a loop; the budget is
  $20 and one call is enough.
Evidence: `/api/health` → `qwen.ok`; trace pane `see` step shows the extracted features.

## GMI Cloud

Role: Four-language localisation fan-out.
Model: `google/gemini-3.5-flash-lite` on `https://api.gmi-serving.com/v1`.
Files: `lib/providers.ts:29`, `lib/pipeline.ts:329-379`
Calls: exactly 4 per run, concurrent (`Promise.allSettled`), one per language. Never used
  for retries or repair passes — smallest budget in the stack.
Why: Four independent short generations at once is exactly what a fast multi-tenant
  inference cloud is for. These are localisations, not translations: each names why *that*
  market recognises the price.
  Each call also carries the spoken family history, so the oral provenance reaches a
  Paris or Seoul buyer in their own language without being flattened into a translation.
Evidence: `/api/health` → `gmi.ok`; the EN / 中文 / FR / 한국어 tabs on any storefront.

## Nosana

Role: Self-hosted GPU endpoint. Japanese seal-script OCR (落款・銘・箱書き) and the
  embedding model behind grounded craft identification.
Files: `lib/providers.ts:37`, `lib/mark.ts:11-35`, `lib/crafts.ts:113-162`
  (embeddings, Nosana first, GMI second, Qwen last)
Calls: 1 OCR call per run; 1 batched embedding call per cold start (244-row index, cached
  module-level), 1 per run for the query.
Why: No hosted API reads 篆書 seal script well, and matching Japanese feature
  descriptions to Japanese craft names wants a Japanese-language embedding model. Both are
  real reasons to own the GPU. Budget is GPU-hours, not tokens — the only hard cap in the
  stack, so the endpoint comes up shortly before the demo and goes down after.
Evidence: `/api/health` → `nosana.ok`; trace pane `mark` step prints the reading.
Deploy target: `Qwen/Qwen2.5-VL-7B-Instruct` served OpenAI-compatible via vLLM on a single
  24GB-class GPU (RTX 4090 / A5000 / L4) — the OCR stage needs a vision-language model, and
  7B is enough for seal-script reading without paying for an A100. The embedding path
  (`NOSANA_EMBED_MODEL`) is optional: it already falls back to GMI, then Qwen
  `text-embedding-v4`, then lexical matching, so one GPU job is sufficient. Set
  `NOSANA_BASE_URL` to the endpoint (ending `/v1`), `NOSANA_MODEL` to the served model id, and
  `NOSANA_API_KEY` to whatever bearer token the vLLM job was launched with — this is a
  separate credential from the Nosana platform key.

## Daytona

Role: Sandboxed code execution and a second live host for the storefront.
Files: `lib/sandbox.ts` (whole file), `lib/comps.ts` (sources + codegen prompt + parse),
  `lib/pipeline.ts:218-298` (`comps`), `lib/pipeline.ts:381-434` (`ship` mirrors the piece
  into the sandbox), `app/api/prewarm/route.ts` (sandbox created on page mount)
Calls: 2-3 `fs.uploadFile` + 1 `process.codeRun` per run, plus 1 `getPreviewLink` on ship.
Why: The agent *writes* the comps parser at request time and we execute code we have never
  seen, over several hundred KB of untrusted marketplace HTML. Neither the code nor the HTML
  goes anywhere near the app server. The generated Python is streamed to the trace pane
  (`ForgeEvent` `{t:'code'}`) and rendered, so the audience watches code written seconds
  earlier produce the price band. `getPreviewLink` then serves the finished piece from
  inside the sandbox as `sandboxUrl`.
Note on egress: Daytona sandboxes on this account reach package registries only — a direct
  fetch to Yahoo Auctions is reset. So the orchestrator fetches the search HTML and uploads
  it into the sandbox (`lib/comps.ts:18-44`), and the agent's parser runs there with no
  network at all. Verified: 626 KB of Yahoo HTML in, 30 listings out, 12 comparable after
  filtering (`lib/comps.ts:115-125`).
Evidence: `/api/health` → `daytona.ok` (`app/api/health/route.ts:30-42`, lists sandboxes
  rather than creating one so a health poll never consumes quota); the trace pane prints
  the `daytonaproxy` preview URL at the end of every run.

## Qoder

Role: Dev-time coding agent. This repository — types, adapter, pipeline, both panes,
  the storefront and the craft index — was written through Qoder in the build window.
Files: n/a at runtime, by design. Zero runtime cost.
Why: The integration is the authorship. There is no runtime key and we do not pretend
  otherwise.
Evidence: `/api/health` → `qoder.ok` with `note: "build-time"`; commit history.

---

## Groq — disclosed fallback, not a sponsor claim

Role: fallback only, JSON repair pass, disabled by setting `ENABLE_FALLBACK=false`.
Files: `lib/providers.ts:45`, `lib/llm.ts:82-92`
Why disclosed: judges reading the code will find it. It never serves a stage on the golden
  path and it is never named in the pitch. It exists so a malformed JSON body does not kill
  a live demo.

Also, post-hackathon: `app/api/transcribe/route.ts` calls Groq's Whisper endpoint
(`/audio/transcriptions`) to transcribe the craftsperson's voice recording after they stop
speaking. This is a primary use, not a fallback — browser dictation (`SpeechRecognition`)
only exists in Chromium, so Safari and Firefox users got real-time captions but no final
transcript at all. Whisper transcribes the same recorded audio server-side regardless of
browser and replaces the (less accurate) live browser guess once it returns.

## Mercari — community partner, read-only

Mercari is not on the scored sponsor list and we did not force an integration. Their public
search is one of two sources the generated scraper reads (Yahoo Auctions is the other), at
low volume, read path only. TSUGI produces a paste-ready listing package and never
auto-posts: Mercari has no public C2C write API. See the generated source in
`Comps.generatedCode`, rendered in the trace pane on every run.

## Persistence — Vercel Blob

Not a sponsor, but load-bearing for the marketplace: Vercel Functions don't share memory
across instances or survive a redeploy, so an in-memory store would only ever reliably show
the seven seed workshops to whichever buyer happened to hit the same warm lambda that a
craftsperson just used. `lib/storage.ts` persists each `Piece` as one JSON blob
(`tsugi/pieces/{id}.json`) in a linked Vercel Blob store; `lib/store.ts` hydrates an
in-memory cache from it once per warm instance. No schema, no connection pool, no
credential a buyer or craftsperson ever sees — just `BLOB_READ_WRITE_TOKEN`.
Evidence: create a listing on `/forge`, then open `/market` from an incognito window — the
new store is there.

## Degradation

Every stage fails open — a `step_fail` never aborts the pipeline (`lib/pipeline.ts:56-85`).
If a provider is unconfigured or returns 401/404 the stage emits `step_fail` with the real
error, the storefront falls back to `lib/seed.ts` for that field, and the run still ends on
a live URL. What is degraded is visible in the trace pane and in `/api/health`, never hidden.
