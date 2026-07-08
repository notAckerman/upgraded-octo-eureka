import { Activity, Bitcoin, QrCode, Send, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/common/reveal";
import { TokenStreamCanvas } from "@/components/three/token-stream-canvas";
import { site } from "@/lib/site";

export async function Bento() {
  const t = await getTranslations("bento");

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6">
      <Reveal>
        <h2 className="max-w-2xl">{t("title")}</h2>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {/* Cell 1 — wide, balance */}
        <div className="gradient-card card-highlight relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:col-span-2 md:row-span-1">
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <Wallet className="size-5" />
            <span className="text-sm font-medium">{t("balanceLabel")}</span>
          </div>
          <div className="mt-8">
            <div className="font-mono text-4xl font-semibold tabular-nums text-[var(--text)]">
              12 500,00 ₽
            </div>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              {t("balanceBody")}
            </p>
          </div>
        </div>

        {/* Cell 2 — uptime */}
        <div className="card-highlight rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center gap-2 text-[var(--text)]">
            <Activity className="size-5 text-[var(--ok)]" />
            <span className="text-sm font-medium">{t("uptimeLabel")}</span>
          </div>
          <div className="mt-6 flex items-end gap-1">
            {[40, 62, 48, 70, 55, 80, 66, 90, 72, 84].map((h, i) => (
              <span
                key={i}
                className="w-2 rounded-sm bg-[var(--ok)]/40"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">{t("uptimeBody")}</p>
        </div>

        {/* Cell 3 — streaming (R3 token stream, CSS fallback on touch/reduced-motion) */}
        <div className="card-highlight relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <span className="text-sm font-medium text-[var(--text)]">
            {t("streamLabel")}
          </span>
          <TokenStreamCanvas className="relative my-4 h-16" />
          <p className="text-sm text-[var(--muted)]">{t("streamBody")}</p>
        </div>

        {/* Cell 4 — payments */}
        <div className="gradient-card card-highlight rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <span className="text-sm font-medium text-[var(--text)]">
            {t("payLabel")}
          </span>
          <div className="mt-5 flex flex-col gap-3 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <QrCode className="size-4 text-[var(--accent)]" /> {t("paySbp")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Bitcoin className="size-4 text-[var(--accent)]" /> {t("payCrypto")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Wallet className="size-4 text-[var(--accent)]" /> {t("payLolz")}
            </span>
          </div>
        </div>

        {/* Cell 5 — telegram support */}
        <div className="card-highlight flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center gap-2 text-[var(--text)]">
            <Send className="size-5 text-[var(--accent)]" />
            <span className="text-sm font-medium">{t("supportLabel")}</span>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">{t("supportBody")}</p>
          <a
            href={site.tgChannel}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:opacity-80"
          >
            {t("openChannel")}
          </a>
        </div>
      </div>
    </section>
  );
}
