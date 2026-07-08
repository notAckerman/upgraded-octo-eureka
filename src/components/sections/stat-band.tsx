import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/common/reveal";

export async function StatBand() {
  const t = await getTranslations("stats");
  const stats = [
    { value: "9+", label: t("s1l") },
    { value: "1M", label: t("s2l") },
    { value: "3", label: t("s3l") },
    { value: "60", label: t("s4l") },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6">
      <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div className="font-mono text-5xl font-semibold tabular-nums text-[var(--text)] md:text-6xl">
              {s.value}
            </div>
            <div className="mt-3 max-w-[16ch] text-sm text-[var(--muted)]">
              {s.label}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
