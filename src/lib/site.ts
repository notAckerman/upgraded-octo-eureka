/**
 * Single source of brand and site constants.
 * Brand approved at Step 1: Узел (Latin wordmark "Uzel").
 */

export const site = {
  brand: "Узел",
  brandLatin: "Uzel",
  tagline: "OpenAI-совместимый шлюз к лучшим LLM",
  domain: process.env.NEXT_PUBLIC_APP_URL ?? "https://uzel.dev",
  tgChannel: process.env.NEXT_PUBLIC_TG_CHANNEL ?? "https://t.me/uzel_api",
  apiBase: "/api/v1",
} as const;

/** Provider families shown in the model marquee (real, well-known names). */
export const providers = [
  "OpenAI",
  "Anthropic",
  "Google",
  "DeepSeek",
  "Mistral",
  "Qwen",
  "Meta Llama",
  "xAI",
] as const;

/** A small, honest price teaser for the landing (RUB per 1M tokens). */
export const priceTeaser = [
  { model: "DeepSeek V3", ctx: "128K", inRub: "1,6", outRub: "6,4" },
  { model: "Claude Haiku 4.5", ctx: "200K", inRub: "1,6", outRub: "8" },
  { model: "GPT-4o mini", ctx: "128K", inRub: "2,4", outRub: "9,6" },
  { model: "Claude Sonnet 4.6", ctx: "200K", inRub: "4", outRub: "12" },
  { model: "Gemini 2.5 Pro", ctx: "1M", inRub: "8", outRub: "32" },
  { model: "GPT-4o", ctx: "128K", inRub: "16", outRub: "48" },
] as const;