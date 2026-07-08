import type { Metadata } from "next";
import { getAdminStats } from "@/server/admin";

export const metadata: Metadata = {
  title: "Обзор",
};

const rub = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 2,
});
const num = new Intl.NumberFormat("ru-RU");

export default async function AdminOverview() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Пользователей", value: num.format(stats.userCount) },
    { label: "Пополнений за 30 дней", value: rub.format(stats.deposits30d) },
    { label: "Выручка за 30 дней", value: rub.format(stats.revenue30d) },
    {
      label: "Маржа за 30 дней",
      value: rub.format(stats.margin30d),
      accent: true,
    },
    { label: "Запросов за 30 дней", value: num.format(stats.requests30d) },
    { label: "Открытых тикетов", value: num.format(stats.openTickets) },
  ];

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold text-[var(--text)]">
        Обзор
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <p className="text-sm text-[var(--muted)]">{c.label}</p>
            <p
              className={`mt-2 font-mono text-2xl font-semibold ${
                c.accent ? "text-[var(--accent)]" : "text-[var(--text)]"
              }`}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
