"use client";

import { Menu, Send, X } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { BrandMark } from "@/components/common/brand-mark";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { site } from "@/lib/site";

export function SiteNav() {
  const t = useTranslations("nav");
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 8));

  const links = [
    { href: "/#pricing", label: t("models") },
    { href: "/#how", label: t("how") },
    { href: "/docs", label: t("docs") },
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "glass border-[var(--border)] bg-[var(--bg)]/70"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-[var(--text)]">
          <BrandMark className="size-6" />
          <span className="font-heading text-lg font-semibold tracking-tight">
            {site.brand}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={site.tgChannel}
            target="_blank"
            rel="noreferrer"
            aria-label={t("telegram")}
            className="flex size-9 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          >
            <Send className="size-4" />
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 min-w-[76px] items-center justify-center rounded-[10px] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-ink)] transition-all hover:opacity-90 active:translate-y-px"
            >
              Панель
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-9 min-w-[76px] items-center justify-center rounded-[10px] px-3 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)]"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 min-w-[136px] items-center justify-center rounded-[10px] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-ink)] transition-all hover:opacity-90 active:translate-y-px"
              >
                {t("getKey")}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-[10px] border border-[var(--border)] text-[var(--text)]"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("menuClose") : t("menuOpen")}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border-t border-[var(--border)] bg-[var(--bg)]/90 lg:hidden"
        >
          <div className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-[10px] border border-[var(--border)] text-sm font-medium text-[var(--text)]"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-[10px] bg-[var(--accent)] text-sm font-medium text-[var(--accent-ink)]"
              >
                {t("getKey")}
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
