import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Настройки",
};

export default async function DashboardSettings() {
  const t = await getTranslations("dashboard");
  const session = await auth();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold text-[var(--text)]">
        {t("settings")}
      </h1>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">Аккаунт</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--muted)]">Email</label>
            <p className="text-sm text-[var(--text)]">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
