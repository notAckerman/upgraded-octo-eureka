/**
 * Static model catalog for the landing table. Kept in sync with prisma/seed.ts.
 * Live prices are authoritative in the dashboard; this is an honest teaser.
 */
export interface CatalogModel {
  slug: string;
  name: string;
  provider: string;
  ctx: number;
  inRub: number;
  outRub: number;
}

export const catalog: CatalogModel[] = [
  { slug: "gpt-4o", name: "GPT-4o", provider: "OpenAI", ctx: 128_000, inRub: 16, outRub: 48 },
  { slug: "gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI", ctx: 128_000, inRub: 2.4, outRub: 9.6 },
  { slug: "claude-opus-4-8", name: "Claude Opus 4.8", provider: "Anthropic", ctx: 200_000, inRub: 12, outRub: 36 },
  { slug: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic", ctx: 200_000, inRub: 4, outRub: 12 },
  { slug: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "Anthropic", ctx: 200_000, inRub: 1.6, outRub: 8 },
  { slug: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", ctx: 1_048_576, inRub: 8, outRub: 32 },
  { slug: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", ctx: 131_072, inRub: 1.6, outRub: 6.4 },
  { slug: "qwen-2.5-72b", name: "Qwen 2.5 72B", provider: "Qwen", ctx: 131_072, inRub: 2.4, outRub: 9.6 },
  { slug: "mistral-large", name: "Mistral Large", provider: "Mistral", ctx: 131_072, inRub: 4, outRub: 12 },
];

export const catalogProviders = [
  "OpenAI",
  "Anthropic",
  "Google",
  "DeepSeek",
  "Qwen",
  "Mistral",
] as const;

/** 128_000 -> "128K", 1_048_576 -> "1M" */
export function formatCtx(ctx: number): string {
  if (ctx >= 1_000_000) return `${Math.round(ctx / 1_000_000)}M`;
  return `${Math.round(ctx / 1000)}K`;
}

/** 2.4 -> "2,4"  ·  16 -> "16" (ru decimal comma, no trailing zeros) */
export function formatRub(n: number): string {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}