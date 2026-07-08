"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  catalog,
  catalogProviders,
  formatCtx,
  formatRub,
} from "@/lib/catalog";

export function PricingTable() {
  const t = useTranslations("pricing");
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((m) => {
      const matchesQ =
        !q || m.name.toLowerCase().includes(q) || m.slug.includes(q);
      const matchesP = !provider || m.provider === provider;
      return matchesQ && matchesP;
    });
  }, [query, provider]);

  return (
    <section id="pricing" className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6">
      <h2 className="max-w-2xl">{t("title")}</h2>
      <p className="mt-4 max-w-xl text-[var(--muted)]">{t("subtitle")}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
            className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterPill active={provider === null} onClick={() => setProvider(null)}>
            {t("all")}
          </FilterPill>
          {catalogProviders.map((p) => (
            <FilterPill
              key={p}
              active={provider === p}
              onClick={() => setProvider(p)}
            >
              {p}
            </FilterPill>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="sticky top-0 bg-[var(--surface-2)]">
            <tr className="text-left text-xs text-[var(--muted)]">
              <th className="px-4 py-3 font-medium">{t("colModel")}</th>
              <th className="px-4 py-3 font-medium">{t("colProvider")}</th>
              <th className="px-4 py-3 text-right font-medium">
                {t("colContext")}
              </th>
              <th className="px-4 py-3 text-right font-medium">{t("colIn")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("colOut")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr
                key={m.slug}
                className="border-t border-[var(--border)] transition-colors hover:bg-[var(--surface)]/50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--text)]">{m.name}</div>
                  <div className="font-mono text-xs text-[var(--muted)]">
                    {m.slug}
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">{m.provider}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--muted)]">
                  {formatCtx(m.ctx)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--text)]">
                  {formatRub(m.inRub)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--text)]">
                  {formatRub(m.outRub)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                >
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
          : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
      }`}
    >
      {children}
    </button>
  );
}
