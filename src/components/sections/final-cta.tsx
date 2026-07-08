import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { site } from "@/lib/site";

export async function FinalCta() {
  const t = await getTranslations("cta");

  return (
    <section className="relative isolate overflow-hidden border-t border-[var(--border)]">
      {/* R6 ambient backdrop — CSS mesh, drifting, decoration only */}
      <div className="ambient-backdrop absolute inset-0 -z-10" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-[var(--bg)]/40" aria-hidden />

      <div className="mx-auto max-w-[1400px] px-4 py-32 text-center sm:px-6">
        <h2 className="mx-auto max-w-3xl text-balance text-4xl md:text-6xl">
          {t("headline")}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--muted)]">
          {t("subline")}
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-[10px] bg-[var(--accent)] px-8 text-sm font-medium text-[var(--accent-ink)] transition-all hover:opacity-90 active:translate-y-px"
          >
            {t("getKey")}
          </Link>
          <a
            href={site.tgChannel}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          >
            {t("telegram")}
          </a>
        </div>
      </div>
    </section>
  );
}
