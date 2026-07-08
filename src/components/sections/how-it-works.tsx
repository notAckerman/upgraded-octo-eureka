import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/common/reveal";

export async function HowItWorks() {
  const t = await getTranslations("how");
  const steps = [
    { n: "1", title: t("s1t"), body: t("s1b") },
    { n: "2", title: t("s2t"), body: t("s2b") },
    { n: "3", title: t("s3t"), body: t("s3b") },
  ];

  return (
    <section id="how" className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6">
      <Reveal>
        <h2 className="max-w-2xl">{t("title")}</h2>
      </Reveal>

      <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
        {/* connecting rail (desktop) */}
        <div
          className="absolute inset-x-[16%] top-5 hidden h-px bg-[var(--border)] md:block"
          aria-hidden
        />
        {steps.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.08} className="relative">
            <div className="flex size-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] font-mono text-sm font-medium text-[var(--accent)]">
              {step.n}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-[var(--text)]">
              {step.title}
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
              {step.body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
