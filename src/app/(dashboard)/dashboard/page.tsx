import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getOverview, getRecentUsage } from "@/server/dashboard";
import { SpendChart } from "@/components/dashboard/spend-chart";

export const metadata: Metadata = {
  title: "Обзор",
};

const rub = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 2,
});
const num = new Intl.NumberFormat("ru-RU");

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
}

export default async function DashboardOverview() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations("dashboard");
  const [overview, recent] = await Promise.all([
    getOverview(session.user.id),
    getRecentUsage(session.user.id, 8),
  ]);

  const stats = [
    { label: t("balance"), value: rub.format(overview.balance), accent: true },
    { label: t("spend30d"), value: rub.format(overview.spend30d) },
    { label: t("requests30d"), value: num.format(overview.requests30d) },
    { label: t("tokens30d"), value: num.format(overview.tokens30d) },
  ];

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold text-[var(--text)]">
        {t("overview")}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <p className="text-sm text-[var(--muted)]">{s.label}</p>
            <p
              className={`mt-2 font-mono text-2xl font-semibold ${
                s.accent ? "text-[var(--accent)]" : "text-[var(--text)]"
              }`}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="mb-4 text-sm font-medium text-[var(--text)]">
          {t("dailySpend")}
        </p>
        <SpendChart data={overview.daily} />
      </div>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <p className="border-b border-[var(--border)] px-5 py-4 text-sm font-medium text-[var(--text)]">
          {t("recentUsage")}
        </p>
        {recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-[var(--muted)]">
            {t("emptyUsage")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-5 py-3 font-medium text-[var(--muted)]">
                    {t("model")}
                  </th>
                  <th className="px-5 py-3 font-medium text-[var(--muted)]">
                    {t("keyCol")}
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-[var(--muted)]">
                    {t("tokensCol")}
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-[var(--muted)]">
                    {t("cost")}
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-[var(--muted)]">
                    {t("timeCol")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-5 py-3 font-medium text-[var(--text)]">
                      {r.model}
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)]">
                      {r.keyName}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[var(--muted)]">
                      {num.format(r.inTok + r.outTok)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[var(--text)]">
                      {rub.format(r.cost)}
                    </td>
                    <td className="px-5 py-3 text-right text-[var(--muted)]">
                      {timeAgo(r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
