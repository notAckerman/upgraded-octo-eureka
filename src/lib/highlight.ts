import "server-only";
import { createHighlighter, type Highlighter } from "shiki";

// Dual theme so highlighting follows the site's light/dark tokens via CSS vars.
const THEMES = { light: "vitesse-light", dark: "vitesse-dark" } as const;
const LANGS = ["bash", "javascript", "python", "json"] as const;

export type CodeLang = (typeof LANGS)[number];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEMES.light, THEMES.dark],
      langs: [...LANGS],
    });
  }
  return highlighterPromise;
}

/** Server-only: returns Shiki HTML with per-token --shiki-light/--shiki-dark vars. */
export async function highlight(code: string, lang: CodeLang): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code, {
    lang,
    themes: THEMES,
    defaultColor: false,
  });
}
