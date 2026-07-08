"use client";

import { useState, useTransition } from "react";
import { adjustBalance } from "@/server/actions/admin";

interface UserRow {
  id: string;
  email: string;
  role: string;
  balance: number;
  createdAt: string;
  keyCount: number;
  requestCount: number;
}

const rub = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 2,
});
const num = new Intl.NumberFormat("ru-RU");

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();

  function handleAdjust(userId: string) {
    const value = Number(amount.replace(",", "."));
    if (!value || Number.isNaN(value)) return;
    const fd = new FormData();
    fd.set("userId", userId);
    fd.set("amountRub", String(value));
    startTransition(async () => {
      const res = await adjustBalance(fd);
      if ("ok" in res && res.ok) {
        setAdjusting(null);
        setAmount("");
      }
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="px-4 py-3 font-medium text-[var(--muted)]">Email</th>
            <th className="px-4 py-3 font-medium text-[var(--muted)]">Роль</th>
            <th className="px-4 py-3 text-right font-medium text-[var(--muted)]">
              Баланс
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--muted)]">
              Ключи
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--muted)]">
              Запросы
            </th>
            <th className="px-4 py-3 font-medium text-[var(--muted)]">
              Регистрация
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-b border-[var(--border)] last:border-0"
            >
              <td className="px-4 py-3 font-medium text-[var(--text)]">
                {u.email}
              </td>
              <td className="px-4 py-3">
                {u.role === "ADMIN" ? (
                  <span className="rounded-full border border-[var(--accent)]/40 px-2 py-0.5 text-xs text-[var(--accent)]">
                    Админ
                  </span>
                ) : (
                  <span className="text-[var(--muted)]">Юзер</span>
                )}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[var(--text)]">
                {rub.format(u.balance)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[var(--muted)]">
                {num.format(u.keyCount)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[var(--muted)]">
                {num.format(u.requestCount)}
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {formatDate(u.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                {adjusting === u.id ? (
                  <span className="inline-flex items-center gap-1.5">
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !e.nativeEvent.isComposing &&
                          e.keyCode !== 229
                        )
                          handleAdjust(u.id);
                      }}
                      placeholder="±₽"
                      aria-label="Сумма корректировки"
                      className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-right font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      onClick={() => handleAdjust(u.id)}
                      disabled={pending}
                      className="rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-xs font-medium text-[var(--accent-ink)] disabled:opacity-50"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => {
                        setAdjusting(null);
                        setAmount("");
                      }}
                      className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--muted)]"
                    >
                      Отмена
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setAdjusting(u.id)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                  >
                    Баланс
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
