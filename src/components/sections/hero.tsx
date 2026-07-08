import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CopyButton } from "@/components/common/copy-button";
import { HeroCanvas } from "@/components/three/hero-canvas";
import { highlight } from "@/lib/highlight";

const CURL = `curl uzel.dev/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-uzel-..." \\
  -d '{"model":"gpt-4o","messages":[...]}'`;

export async function Hero() {
  const t = await getTranslations("hero");
  const curlHtml = await highlight(CURL, "bash");

  return (
    <section className="grain relative isolate min-h-[100dvh] overflow-hidden">
      {/* R1 scene bleeds off the right; poster on touch / reduced-motion */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[54%]">
        <HeroCanvas />
      </div>
      {/* left-to-right scrim keeps copy readable over the scene */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/85 to-transparent lg:via-[var(--bg)]/60" />
      {/* soft depth glow behind the copy */}
      <div
        className="pointer-events-none absolute left-[-10%] top-[18%] h-[420px] w-[520px] rounded-full opacity-60 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent) 22%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1400px] items-center px-4 pt-20 pb-16 sm:px-6">
        <div className="max-w-xl">
          <h1 className="text-balance">
            {t("before")}
            <span className="text-gradient-accent">{t("accent")}</span>
            {t("after")}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--muted)]">
            {t("subline")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--accent)] px-6 text-sm font-medium text-[var(--accent-ink)] transition-all hover:opacity-90 active:translate-y-px"
            >
              {t("getKey")}
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface)]/50 px-6 text-sm font-medium text-[var(--text)] transition-all hover:bg-[var(--surface-2)] active:translate-y-px"
            >
              {t("docs")}
            </Link>
          </div>

          <div className="mt-8 flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 backdrop-blur-sm">
            <div
              className="min-w-0 flex-1 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: curlHtml }}
            />
            <CopyButton
              value={CURL}
              label={t("copy")}
              className="mt-0.5 shrink-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
