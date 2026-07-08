"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Key,
  BarChart3,
  Cpu,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/common/brand-mark";
import { ThemeToggle } from "@/components/common/theme-toggle";

const navItems = [
  { key: "overview", href: "/dashboard", icon: LayoutDashboard },
  { key: "keys", href: "/dashboard/keys", icon: Key },
  { key: "usage", href: "/dashboard/usage", icon: BarChart3 },
  { key: "models", href: "/dashboard/models", icon: Cpu },
  { key: "support", href: "/dashboard/support", icon: MessageSquare },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const t = useTranslations("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 flex size-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface)] lg:hidden"
        aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
          <Link href="/" className="flex items-center gap-2 text-[var(--text)]">
            <BrandMark className="size-6" />
            <span className="font-heading text-lg font-semibold tracking-tight">
              Узел
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--surface-2)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                }`}
              >
                <Icon className="size-4" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[var(--border)] px-3 py-3">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            >
              <LogOut className="size-4" />
              {t("signOut")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
