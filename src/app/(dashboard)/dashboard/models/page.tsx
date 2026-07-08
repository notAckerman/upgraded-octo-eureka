import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { formatCtx, formatRub } from "@/lib/catalog";
import { getEnabledModels } from "@/server/dashboard";

export const metadata: Metadata = {
  title: "Модели и цены",
};

export default async function DashboardModels() {
  const t = await getTranslations("dashboard");
  const models = await getEnabledModels();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold text-[var(--text)]">
        {t("models")}
      </h1>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 font-medium text-[var(--muted)]">Модель</th>
              <th className="px-4 py-3 font-medium text-[var(--muted)]">Провайдер</th>
              <th className="px-4 py-3 font-medium text-[var(--muted)]">Контекст</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--muted)]">₽ / 1M вход</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--muted)]">₽ / 1M выход</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.slug} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 font-medium text-[var(--text)]">{m.name}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{m.provider}</td>
                <td className="px-4 py-3 font-mono text-[var(--muted)]">{formatCtx(m.ctx)}</td>
                <td className="px-4 py-3 text-right font-mono text-[var(--text)]">{formatRub(m.inRub1M)} ₽</td>
                <td className="px-4 py-3 text-right font-mono text-[var(--text)]">{formatRub(m.outRub1M)} ₽</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
