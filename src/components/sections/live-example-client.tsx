"use client";

import { useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/common/copy-button";

export type Format = "openai" | "anthropic";
export type SnippetMap = Record<Format, Record<string, string>>;

const FORMATS: { id: Format; label: string; model: string }[] = [
  { id: "openai", label: "OpenAI SDK", model: "claude-sonnet-4-6" },
  { id: "anthropic", label: "Anthropic SDK", model: "claude-opus-4-8" },
];
const LANGS = ["curl", "JavaScript", "Python"];

export function LiveExampleClient({
  snippets,
  highlighted,
}: {
  snippets: SnippetMap;
  highlighted: SnippetMap;
}) {
  const t = useTranslations("live");
  const response = t("response");
  const [format, setFormat] = useState<Format>("openai");
  const [lang, setLang] = useState(LANGS[0]);
  const [typed, setTyped] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const model = useMemo(
    () => FORMATS.find((f) => f.id === format)?.model ?? "",
    [format],
  );

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(response);
      return;
    }
    let i = 0;
    setTyped("");
    const id = setInterval(() => {
      i += 1;
      setTyped(response.slice(0, i));
      if (i >= response.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [inView, response]);

  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)]/20 py-24">
      <div ref={ref} className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <h2 className="max-w-2xl">{t("title")}</h2>
        <p className="mt-4 max-w-xl text-[var(--muted)]">{t("subtitle")}</p>

        {/* format segmented control */}
        <div className="mt-8 inline-flex rounded-[10px] border border-[var(--border)] bg-[var(--surface)]/50 p-1">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                format === f.id
                  ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/50 pl-4">
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
                <span className="size-2.5 rounded-full bg-[var(--border)]" />
                <span className="size-2.5 rounded-full bg-[var(--border)]" />
                <span className="size-2.5 rounded-full bg-[var(--border)]" />
              </div>
              <div className="flex">
                {LANGS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`relative px-4 py-3 text-sm transition-colors ${
                      lang === l
                        ? "text-[var(--text)]"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {l}
                    {lang === l && (
                      <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[var(--accent)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <CopyButton
              value={snippets[format][lang]}
              label={t("copy")}
              className="mr-3"
            />
          </div>

          <div className="grid gap-px bg-[var(--border)] md:grid-cols-2">
            <div
              className="overflow-x-auto bg-[var(--bg)] p-5"
              dangerouslySetInnerHTML={{ __html: highlighted[format][lang] }}
            />
            <div className="bg-[var(--bg)] p-5">
              <div className="mb-3 flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="size-2 animate-pulse rounded-full bg-[var(--ok)]" />
                streaming · {model}
              </div>
              <p className="min-h-24 font-mono text-[13px] leading-relaxed text-[var(--text)]">
                {typed}
                <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse bg-[var(--accent)]" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
