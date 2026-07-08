import type { ReactNode } from "react";
import { BrandMark } from "@/components/common/brand-mark";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-[var(--text)]">
            <BrandMark className="size-8" />
            <span className="font-heading text-xl font-semibold tracking-tight">
              Узел
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
