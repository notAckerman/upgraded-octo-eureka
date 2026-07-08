"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { register } from "./actions";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(register, null);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
      <h1 className="mb-6 text-center font-heading text-2xl font-semibold text-[var(--text)]">
        {t("registerTitle")}
      </h1>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-[var(--danger)]">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[10px] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-ink)] transition-all hover:opacity-90 active:translate-y-px disabled:opacity-50"
        >
          {pending ? "..." : t("submitRegister")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
