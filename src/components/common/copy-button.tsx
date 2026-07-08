"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  className,
  label,
}: {
  value: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          /* clipboard unavailable */
        }
      }}
      aria-label={label ?? "Скопировать"}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:text-[var(--text)]",
        className,
      )}
    >
      {copied ? (
        <Check className="size-4 text-[var(--ok)]" />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  );
}