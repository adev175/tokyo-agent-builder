export type Provider = 'aiand' | 'qwen' | 'gmi' | 'nosana' | 'daytona' | 'groq';
export type StepId = 'see' | 'mark' | 'comps' | 'story' | 'localize' | 'ship';
export type Lang = 'en' | 'zh' | 'fr' | 'ko';

export interface Vision {
  craft: string;
  craftJa: string;
  objectJa: string;
  material: string[];
  technique: string[];
  regionGuess: string | null;
  condition: string;
  features: string[];
  confidence: number;
  candidates: CraftCandidate[];
  ambiguous: boolean;
}

export interface CraftCandidate {
  craftJa: string;
  craft: string;
  prefecture: string;
  category: string;
  score: number;
}

export interface Place {
  prefecture: string;
  city: string;
  travelMinutes: number | null;
  openToday: boolean | null;
  note: string;
  lat?: number;
  lng?: number;
  address?: string;
  mapsUrl?: string;
}

/** What the artisan says out loud — the part of provenance no website carries. */
export interface VoiceNote {
  transcriptJa: string;
  heritageJa: string;
  audioDataUrl?: string;
}

export interface Mark {
  textRaw: string | null;
  reading: string | null;
  interpretation: string | null;
  confidence: number;
}

export interface CompItem {
  title: string;
  priceJpy: number;
  url: string;
  source: string;
}

export interface Comps {
  items: CompItem[];
  bandJpy: [number, number];
  recommendedJpy: number;
  method: string;
  generatedCode: string;
}

export interface Story {
  titleJa: string;
  inscriptionJa: string;
  storyJa: string;
  careJa: string;
  heritageJa?: string;
  storeOriginJa?: string;
  storePeopleJa?: string;
}

export interface LocalizedCopy {
  title: string;
  story: string;
  whyItMatters: string;
  shippingNote: string;
  heritage?: string;
}

export interface Piece {
  id: string;
  storeName: string;
  storeSlug: string;
  storeOrigin?: string;
  storePeople?: string;
  imageDataUrl: string;
  images?: string[];
  voice?: VoiceNote | null;
  vision: Vision;
  mark: Mark | null;
  comps: Comps;
  story: Story;
  localized: Record<Lang, LocalizedCopy>;
  priceJpy: number;
  createdAt: string;
  sandboxUrl?: string;
  place?: Place | null;
}

export type ForgeEvent =
  | { t: 'step_start'; id: StepId; provider: Provider; label: string; labelJa: string }
  | { t: 'code'; id: StepId; source: string }
  | { t: 'log'; id: StepId; line: string }
  | { t: 'step_done'; id: StepId; provider: Provider; ms: number; calls: number; costJpy: number; data: unknown }
  | { t: 'step_fail'; id: StepId; provider: Provider; ms: number; error: string }
  | {
      t: 'done';
      storefrontUrl: string;
      sandboxUrl?: string;
      piece: Piece;
      totalMs: number;
      totalCalls: number;
      totalCostJpy: number;
    };
