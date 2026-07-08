import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getUsagePage } from "@/server/dashboard";

export const metadata: Metadata = {
  title: "Расход",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardUsage() {
  const t = await getTranslations("dashboard");
  const session = await auth();
  const { rows, totals } = await getUsagePage(session!.user!.id, 50);

  const nf = new Intl.NumberFormat("ru-RU");

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold text-[var(--text)]">
        {t("usage")}
      </h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">Всего запросов</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--text)]">
            {nf.format(totals.requests)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">Всего токенов</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--text)]">
            {nf.format(totals.tokens)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">Общая стоимость</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--text)]">
            {nf.format(Math.round(totals.cost * 100) / 100)} ₽
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="text-[var(--muted)]">{t("emptyUsage")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 font-medium text-[var(--muted)]">
                  Модель
                </th>
                <th className="px-4 py-3 font-medium text-[var(--muted)]">
                  Ключ
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--muted)]">
                  Вход
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--muted)]">
                  Выход
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--muted)]">
                  Стоимость
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--muted)]">
                  мс
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--muted)]">
                  Время
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text)]">
                    {r.model}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{r.keyName}</td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--muted)]">
                    {nf.format(r.inTok)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--muted)]">
                    {nf.format(r.outTok)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--text)]">
                    {r.cost.toFixed(4)} ₽
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--muted)]">
                    {nf.format(r.ms)}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--muted)]">
                    {formatDateTime(r.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
