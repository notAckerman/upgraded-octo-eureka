import { Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { BrandMark } from "@/components/common/brand-mark";
import { site } from "@/lib/site";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  const columns = [
    {
      title: t("product"),
      links: [
        { href: "/#pricing", label: t("models") },
        { href: "/#how", label: t("how") },
        { href: "/docs", label: t("docs") },
      ],
    },
    {
      title: t("payment"),
      links: [
        { href: "/register", label: t("sbp") },
        { href: "/register", label: t("crypto") },
        { href: "/register", label: t("lolz") },
      ],
    },
    {
      title: t("account"),
      links: [
        { href: "/login", label: t("login") },
        { href: "/register", label: t("getKey") },
        { href: "/dashboard/support", label: t("support") },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]/30">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-[var(--text)]">
            <BrandMark className="size-6" />
            <span className="font-heading text-lg font-semibold tracking-tight">
              {site.brand}
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
            {t("tagline")}
          </p>
          <a
            href={site.tgChannel}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          >
            <Send className="size-4" />
            {t("channel")}
          </a>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 font-sans text-sm font-semibold text-[var(--text)]">
              {col.title}
            </h3>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-[var(--muted)] sm:flex-row sm:px-6">
          <span>
            © 2026 {site.brand}. {t("rights")}
          </span>
          <span className="font-mono">
            {site.domain.replace("https://", "")}
          </span>
        </div>
      </div>
    </footer>
  );
}
