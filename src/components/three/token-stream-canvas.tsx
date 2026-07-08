"use client";

/**
 * Lazy, isolated wrapper for the R3 token-stream scene (bento streaming cell).
 * Mirrors the hero-canvas pattern:
 * - three/r3f loaded via next/dynamic ({ ssr: false })
 * - prefers-reduced-motion OR touch / <768px → CSS dot fallback, no WebGL
 * - keyed by theme so blending/colors re-derive cleanly on toggle
 */

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Suspense, useEffect, useState } from "react";

const TokenStream = dynamic(
  () => import("./token-stream").then((m) => m.TokenStream),
  { ssr: false, loading: () => null },
);

function CssFallback() {
  return (
    <div className="token-stream relative h-full" aria-hidden>
      {Array.from({ length: 7 }).map((_, i) => (
        <span
          key={i}
          className="token-dot"
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </div>
  );
}

function useMediaFlag(query: string) {
  const [flag, setFlag] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setFlag(mq.matches);
    const onChange = () => setFlag(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return flag;
}

export function TokenStreamCanvas({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const reduced = useMediaFlag("(prefers-reduced-motion: reduce)");
  const small = useMediaFlag("(max-width: 767px), (pointer: coarse)");

  useEffect(() => setMounted(true), []);

  const dark = resolvedTheme !== "light";
  const fallbackOnly = !mounted || reduced || small;

  return (
    <div className={className} aria-hidden>
      {fallbackOnly ? (
        <CssFallback />
      ) : (
        <Suspense fallback={<CssFallback />}>
          <TokenStream key={dark ? "dark" : "light"} dark={dark} />
        </Suspense>
      )}
    </div>
  );
}
