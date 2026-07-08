import { Check, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/common/reveal";

export async function Comparison() {
  const t = await getTranslations("comparison");
  const direct = t.raw("direct") as string[];
  const uzel = t.raw("uzel") as string[];

  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)]/20 py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <Reveal>
          <h2 className="max-w-2xl">{t("title")}</h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-6">
            <div className="mb-5 text-sm font-medium text-[var(--muted)]">
              {t("directLabel")}
            </div>
            <ul className="space-y-4">
              {direct.map((row) => (
                <li key={row} className="flex items-start gap-3">
                  <X className="mt-0.5 size-4 shrink-0 text-[var(--danger)]" />
                  <span className="text-sm leading-relaxed text-[var(--muted)]">
                    {row}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="gradient-card card-highlight rounded-2xl border border-[var(--accent)]/30 bg-[var(--surface)] p-6">
            <div className="mb-5 text-sm font-medium text-[var(--accent)]">
              {t("uzelLabel")}
            </div>
            <ul className="space-y-4">
              {uzel.map((row) => (
                <li key={row} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--ok)]" />
                  <span className="text-sm leading-relaxed text-[var(--text)]">
                    {row}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
