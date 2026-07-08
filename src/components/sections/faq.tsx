"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface QA {
  q: string;
  a: string;
}

export function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as QA[];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <h2 className="text-center">{t("title")}</h2>
      <div className="mt-12 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-base font-medium text-[var(--text)]">
                  {item.q}
                </span>
                <ChevronDown
                  className={`size-5 shrink-0 text-[var(--muted)] transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-200 ${
                  isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
                }`}
              >
                <p className="overflow-hidden text-sm leading-relaxed text-[var(--muted)]">
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
